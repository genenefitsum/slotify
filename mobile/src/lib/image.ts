import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { ImagePayload } from '@/types/auth';

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
