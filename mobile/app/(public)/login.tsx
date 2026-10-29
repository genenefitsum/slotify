import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { type ComponentRef, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, Text, type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useHaptics } from '@/hooks/useHaptics';
import { type LoginForm, loginSchema } from '@/lib/validation';

export default function Login() {
  const haptics = useHaptics();
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (_values: LoginForm) => {
    setSubmitting(true);
    // TODO(auth): call authApi.login + AuthContext once the networking phase lands.
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSubmitting(false);
    haptics.success();
    Alert.alert('Sign-in ready', 'The login UI is wired. Backend auth comes in the next phase.');
  };

  return (
    <Screen scroll keyboardAware contentClassName="px-6 pb-8 pt-2">
      <Animated.View entering={FadeIn.duration(300)}>
        <BackButton />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify().damping(18)} className="mt-8">
        <Badge label="Welcome back" />
        <Text className="mt-5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Log in
        </Text>
        <Text className="mt-3 font-sans text-base text-ink/60">
          Pick up right where you left off.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).springify().damping(18)} className="mt-10 gap-5">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              ref={passwordRef}
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              placeholder="••••••••"
              secure
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit(onSubmit)()}
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify().damping(18)} className="mt-9">
        <Button
          label="Log in"
          icon={ArrowRight}
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
        />
      </Animated.View>

      <View className="flex-1" />

      <Animated.View
        entering={FadeInDown.delay(300)}
        className="flex-row items-center justify-center gap-1.5 pt-8"
      >
        <Text className="font-sans text-sm text-ink/60">New to Slotify?</Text>
        <Pressable hitSlop={8} onPress={() => router.replace('/register')}>
          <Text className="font-sans-bold text-sm text-ink underline">Create account</Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}
