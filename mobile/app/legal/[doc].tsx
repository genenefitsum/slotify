import { useLocalSearchParams } from 'expo-router';
import { FileWarning } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LEGAL_DOCS, type LegalSlug } from '@/lib/legal';

const VALID: LegalSlug[] = ['terms', 'privacy', 'cookies'];

export default function LegalDocScreen() {
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const slug = VALID.includes(doc as LegalSlug) ? (doc as LegalSlug) : null;
  const document = slug ? LEGAL_DOCS[slug] : null;

  if (!document) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-2">
          <BackButton />
        </View>
        <EmptyState icon={FileWarning} title="Not found" message="This document doesn’t exist." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-2">
        <BackButton />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 48 }}
      >
        {/* Header */}
        <Text className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {document.eyebrow}
        </Text>
        <Text className="mt-2 font-display text-3xl uppercase leading-[0.98] tracking-tight text-ink">
          {document.title}
        </Text>
        <Text className="mt-4 font-sans text-base leading-relaxed text-ink/70">{document.intro}</Text>

        {document.updated ? (
          <Text className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40">
            Last updated · {document.updated}
          </Text>
        ) : null}

        {/* Sections */}
        {document.sections.map((section) => (
          <View key={section.heading} className="mt-8">
            <Text className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
              {section.heading}
            </Text>
            <View className="mt-1 h-0.5 w-8 bg-acid" />

            {section.paragraphs?.map((p, i) => (
              <Text
                key={i}
                className="mt-3 font-sans text-[15px] leading-relaxed text-ink/70"
              >
                {p}
              </Text>
            ))}

            {section.bullets?.map((b, i) => (
              <View key={i} className="mt-2.5 flex-row gap-2.5">
                <Text className="font-sans text-[15px] leading-relaxed text-acid">•</Text>
                <Text className="flex-1 font-sans text-[15px] leading-relaxed text-ink/70">{b}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Contact */}
        <Pressable
          className="mt-10 border border-ink/15 bg-white p-4"
          onPress={() => void Linking.openURL(`mailto:${document.contactEmail}`)}
        >
          <Text className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
            Contact
          </Text>
          <Text className="mt-1 font-sans-bold text-base text-ink underline">
            {document.contactEmail}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
