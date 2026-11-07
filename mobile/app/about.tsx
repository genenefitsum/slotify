import { CalendarCheck, Compass, Sparkles } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';

const STEPS = [
  {
    icon: Compass,
    step: 'Step 1',
    title: 'Discover',
    body: 'Browse vendors by city and category, compare profiles, and shortlist professionals that fit your needs.',
  },
  {
    icon: CalendarCheck,
    step: 'Step 2',
    title: 'Book',
    body: 'Select a service, choose your preferred time slot, and share notes so vendors can prepare in advance.',
  },
  {
    icon: Sparkles,
    step: 'Step 3',
    title: 'Manage',
    body: 'Track statuses in your dashboard, handle updates quickly, and leave reviews after completed appointments.',
  },
] as const;

const TRUST = [
  'Clear pricing and service duration are visible before you book.',
  'Role-based spaces keep customer and vendor workflows clean.',
  'Post-service reviews help future customers choose with confidence.',
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

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
          About Slotify
        </Text>
        <Text className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink">
          A booking marketplace built for clarity and trust
        </Text>
        <Text className="mt-4 font-sans text-base leading-relaxed text-ink/70">
          Slotify helps customers discover, compare, and book trusted professionals across
          Ethiopia. From first search to final appointment, each step is built around transparent
          pricing, clear service details, and reliable scheduling.
        </Text>

        {/* Steps */}
        <View className="mt-9 gap-3">
          {STEPS.map(({ icon: Icon, step, title, body }) => (
            <View key={step} className="border border-ink/15 bg-white p-4">
              <View className="flex-row items-center gap-2">
                <Icon size={16} color="#111" />
                <Text className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                  {step}
                </Text>
              </View>
              <Text className="mt-2 font-display text-xl uppercase tracking-tight text-ink">
                {title}
              </Text>
              <Text className="mt-1.5 font-sans text-[15px] leading-relaxed text-ink/70">{body}</Text>
            </View>
          ))}
        </View>

        {/* Trust */}
        <View className="mt-9">
          <Text className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
            Trust &amp; transparency by default
          </Text>
          <View className="mt-1 h-0.5 w-8 bg-acid" />
          {TRUST.map((line) => (
            <View key={line} className="mt-3 flex-row gap-2.5">
              <Text className="font-sans text-[15px] leading-relaxed text-acid">•</Text>
              <Text className="flex-1 font-sans text-[15px] leading-relaxed text-ink/70">{line}</Text>
            </View>
          ))}
        </View>

        {/* Closing */}
        <View className="mt-10 border border-ink bg-ink p-5">
          <Text className="font-display text-xl uppercase tracking-tight text-canvas">
            Discover · Book · Manage
          </Text>
          <Text className="mt-1.5 font-sans text-[15px] leading-relaxed text-canvas/70">
            One place to find trusted professionals and keep every appointment on track.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
