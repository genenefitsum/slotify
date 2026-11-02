import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { ImagePayload } from '@/types/auth';
import type { VendorImagePayload } from '@/types/vendor';

/**
 * Pick a square profile picture from the library and downscale it to 512px JPEG
 * so the upload stays well under the backend's 2MB limit. Returns a base64
 * data-URL payload the API accepts, or an error message.
 */
export async function pickAvatar(): Promise<{ image?: ImagePayload; error?: string }> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: 'Photo access is needed to set a profile picture.' };
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  const uri = picked.canceled ? undefined : picked.assets[0]?.uri;
  if (!uri) return {};

  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 512 });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG, base64: true });

  if (!result.base64) return { error: 'Could not process the image.' };
  return { image: { data: `data:image/jpeg;base64,${result.base64}`, contentType: 'image/jpeg' } };
}

/**
 * Pick up to `remaining` gallery photos for a vendor or service and downscale
 * each to a 1280px-wide JPEG so uploads stay under the backend's 2MB/image
 * limit. Landscape-friendly (no square crop). Returns base64 data-URL payloads
 * the API accepts, or an error message.
 */
export async function pickImages(
  remaining: number
): Promise<{ images?: VendorImagePayload[]; error?: string }> {
  if (remaining <= 0) {
    return { error: 'You have reached the photo limit.' };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: 'Photo access is needed to add photos.' };
  }

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 1,
  });

  if (picked.canceled || picked.assets.length === 0) return {};

  try {
    const images = await Promise.all(
      picked.assets.slice(0, remaining).map(async (asset) => {
        const context = ImageManipulator.manipulate(asset.uri);
        context.resize({ width: 1280 });
        const rendered = await context.renderAsync();
        const result = await rendered.saveAsync({
          compress: 0.7,
          format: SaveFormat.JPEG,
          base64: true,
        });
        if (!result.base64) throw new Error('Could not process an image.');
        return {
          data: `data:image/jpeg;base64,${result.base64}`,
          contentType: 'image/jpeg',
        } satisfies VendorImagePayload;
      })
    );
    return { images };
  } catch {
    return { error: 'Could not process one or more images.' };
  }
}
