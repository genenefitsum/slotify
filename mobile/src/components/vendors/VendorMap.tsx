import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { colors } from '@/theme/colors';

const TILE = 256;
const ZOOM = 15;
// Horizontal padding (px-6 on each side) the map sits inside on the detail screen.
const H_PADDING = 48;

/** Web-Mercator pixel coordinate of a lat/lng at a given zoom. */
function project(latitude: number, longitude: number, zoom: number) {
  const scale = 2 ** zoom;
  const x = ((longitude + 180) / 360) * scale * TILE;
  const latRad = (latitude * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale * TILE;
  return { x, y, tiles: scale };
}

/**
 * Static map preview built from OpenStreetMap tiles (keyless, works in Expo Go),
 * centered on the vendor with a pin. Tapping opens the full interactive map in
 * the native Maps app. A fully embedded interactive map needs a native module
 * (react-native-maps) and a development build.
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
  const { width } = useWindowDimensions();
  const vw = Math.max(Math.round(width - H_PADDING), 1);
  const vh = height;

  const { x: worldX, y: worldY, tiles: tileCount } = project(latitude, longitude, ZOOM);
  const originX = worldX - vw / 2;
  const originY = worldY - vh / 2;

  const cells: { key: string; uri: string; left: number; top: number }[] = [];
  for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + vw) / TILE); tx += 1) {
    for (let ty = Math.floor(originY / TILE); ty <= Math.floor((originY + vh) / TILE); ty += 1) {
      if (ty < 0 || ty >= tileCount) continue;
      const wrappedX = ((tx % tileCount) + tileCount) % tileCount;
      cells.push({
        key: `${tx}-${ty}`,
        uri: `https://tile.openstreetmap.org/${ZOOM}/${wrappedX}/${ty}.png`,
        left: tx * TILE - originX,
        top: ty * TILE - originY,
      });
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open location in Maps"
      onPress={onPress}
      className="overflow-hidden border border-ink/15 bg-ink/5 active:opacity-90"
      style={{ width: vw, height: vh }}
    >
      {cells.map((cell) => (
        <Image
          key={cell.key}
          source={{ uri: cell.uri }}
          style={{ position: 'absolute', left: cell.left, top: cell.top, width: TILE, height: TILE }}
          contentFit="cover"
          transition={150}
        />
      ))}
      <View style={{ position: 'absolute', left: vw / 2 - 14, top: vh / 2 - 26 }}>
        <MapPin size={28} color={colors.ink} fill={colors.acid} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
