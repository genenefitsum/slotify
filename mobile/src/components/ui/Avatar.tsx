import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

/** Circular brand avatar — shows the uploaded photo, or the user's initials. */
export function Avatar({
  uri,
  initials,
  size = 48,
  className,
}: {
  uri?: string | null;
  initials: string;
  size?: number;
  className?: string;
}) {
  // Set the circle via `borderRadius` in `style`: expo-image isn't mapped for
  // NativeWind className, so `rounded-full` would be a no-op on the photo.
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={150}
        className={cn('bg-ink/10', className)}
      />
    );
  }

  return (
    <View
      className={cn('items-center justify-center bg-ink', className)}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-display text-canvas" style={{ fontSize: Math.round(size * 0.33) }}>
        {initials}
      </Text>
    </View>
  );
}
