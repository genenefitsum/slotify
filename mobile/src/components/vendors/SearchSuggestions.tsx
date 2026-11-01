import { Image } from 'expo-image';
import { ChevronRight, Search } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';
import type { Vendor } from '@/types/vendor';

/** Splits `text` around the first case-insensitive match of `query`, highlighting it. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const idx = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (idx === -1) {
    return (
      <Text numberOfLines={1} className="font-sans-bold text-base text-ink">
        {text}
      </Text>
    );
  }
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <Text numberOfLines={1} className="font-sans-bold text-base text-ink">
      {before}
      <Text className="bg-acid/50 text-ink">{match}</Text>
      {after}
    </Text>
  );
}

/**
 * Live autocomplete panel shown while the user is typing: matching vendors
 * (tap → detail) and matching categories (tap → apply the filter).
 */
export function SearchSuggestions({
  query,
  vendors,
  categories,
  onPickVendor,
  onPickCategory,
}: {
  query: string;
  vendors: Vendor[];
  categories: string[];
  onPickVendor: (vendor: Vendor) => void;
  onPickCategory: (category: string) => void;
}) {
  const isEmpty = vendors.length === 0 && categories.length === 0;

  return (
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
      }}
    >
      {isEmpty ? (
        <View className="items-center px-6 pt-20">
          <View className="h-14 w-14 items-center justify-center border border-ink/15 bg-white">
            <Search size={24} color={colors.inkMuted} strokeWidth={2} />
          </View>
          <Text className="mt-5 text-center font-display text-2xl uppercase tracking-tight text-ink">
            No matches
          </Text>
          <Text className="mt-2 text-center font-sans text-sm text-ink/60">
            Nothing matches “{query}”. Try a different name, place, or category.
          </Text>
        </View>
      ) : (
        <>
          {vendors.length > 0 ? (
            <>
              <SectionLabel>Vendors</SectionLabel>
              <View className="border border-ink/10 bg-white">
                {vendors.map((vendor, index) => {
                  const thumb = vendor.imageUrl ?? vendor.images[0] ?? null;
                  return (
                    <Pressable
                      key={vendor.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${vendor.displayName}`}
                      onPress={() => onPickVendor(vendor)}
                      className={cn(
                        'flex-row items-center gap-3 p-3 active:bg-ink/5',
                        index > 0 && 'border-t border-ink/10',
                      )}
                    >
                      {thumb ? (
                        <Image
                          source={{ uri: thumb }}
                          style={{ width: 44, height: 44 }}
                          contentFit="cover"
                          className="bg-ink/10"
                        />
                      ) : (
                        <View className="h-11 w-11 items-center justify-center bg-ink">
                          <Text className="font-display text-base text-canvas">
                            {vendor.displayName[0]?.toUpperCase() ?? '?'}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <Highlighted text={vendor.displayName} query={query} />
                        {vendor.location.city ? (
                          <Text className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
                            {vendor.location.city}
                          </Text>
                        ) : null}
                      </View>
                      <ChevronRight size={18} color={colors.inkMuted} strokeWidth={2} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {categories.length > 0 ? (
            <>
              <SectionLabel>Categories</SectionLabel>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    active={false}
                    onPress={() => onPickCategory(category)}
                  />
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
      {children}
    </Text>
  );
}
