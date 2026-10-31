import { Image } from 'expo-image';
import { useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, useWindowDimensions, View } from 'react-native';

import { cn } from '@/lib/cn';

/**
 * Full-bleed, swipeable image carousel for a vendor's photos. Falls back to a
 * single image or the brand placeholder when there's nothing to show.
 */
export function VendorGallery({ images, aspectRatio = 4 / 3 }: { images: string[]; aspectRatio?: number }) {
  const { width } = useWindowDimensions();
  const height = Math.round(width / aspectRatio);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={{ width, height }} className="items-center justify-center bg-ink/5">
        <View className="h-14 w-14 items-center justify-center bg-ink">
          <View className="h-4 w-4 bg-acid" />
        </View>
      </View>
    );
  }

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ width, height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={images.length > 1 ? onMomentumEnd : undefined}
      >
        {images.map((uri, i) => (
          <Image
            key={`${i}-${uri.slice(0, 24)}`}
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>

      {images.length > 1 ? (
        <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <View
              key={i}
              className={cn('h-1.5 rounded-full', i === index ? 'w-4 bg-canvas' : 'w-1.5 bg-canvas/50')}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
