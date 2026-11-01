import { Image } from 'expo-image';
import { Pressable } from 'react-native';

/**
 * Static map preview of a vendor's location (keyless OpenStreetMap tiles) that
 * works in Expo Go without any native module. Tapping opens the full
 * interactive map in the native Maps app for panning/zoom/directions.
 *
 * A fully *embedded* interactive map needs a native module (react-native-maps
 * or react-native-webview), which requires a development build — see the
 * Location section's "Open in Maps" action for the interactive experience.
 */
export function VendorMap({
  latitude,
  longitude,
  onPress,
  height = 180,
}: {
  latitude: number;
  longitude: number;
  onPress?: () => void;
  height?: number;
}) {
  const uri =
    `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}` +
    `&zoom=15&size=640x320&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open location in Maps"
      onPress={onPress}
      className="overflow-hidden border border-ink/15 bg-ink/5 active:opacity-90"
      style={{ height }}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
      />
    </Pressable>
  );
}
