import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { type ComponentRef, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, Text, type TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { getErrorMessage } from '@/api/http';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { OrDivider } from '@/components/ui/OrDivider';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/cn';
import { type RegisterForm, registerSchema } from '@/lib/validation';

type Role = 'customer' | 'vendor_owner';

export default function Register() {
  const haptics = useHaptics();
  const { register } = useAuth();
  const { signInWithGoogle } = useGoogleSignIn();
  const params = useLocalSearchParams<{ role?: string }>();
  const initialRole: Role = params.role === 'vendor_owner' ? 'vendor_owner' : 'customer';
  const [submitting, setSubmitting] = useState(false);

  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: initialRole,
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setSubmitting(true);
    try {
      const user = await register(values);
      haptics.success();
      router.replace(user.role === 'customer' ? '/explore' : '/landing');
    } catch (error) {
      haptics.error();
      Alert.alert('Sign up failed', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll keyboardAware contentClassName="px-6 pb-8 pt-2">
      <Animated.View entering={FadeIn.duration(300)}>
        <BackButton />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify().damping(18)} className="mt-8">
        <Text className="font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Create{'\n'}account
        </Text>
        <Text className="mt-3 font-sans text-base text-ink/60">
          A few details and you&apos;re in.
        </Text>
      </Animated.View>

      {/* Role toggle — carries the choice made on the landing screen */}
      <Animated.View entering={FadeInDown.delay(120).springify().damping(18)} className="mt-7">
        <Text className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
          I&apos;m joining as
        </Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-3">
              <RoleChip
                label="Customer"
                active={value === 'customer'}
                onPress={() => {
                  haptics.selection();
                  onChange('customer');
                }}
              />
              <RoleChip
                label="Vendor"
                active={value === 'vendor_owner'}
                onPress={() => {
                  haptics.selection();
                  onChange('vendor_owner');
                }}
              />
            </View>
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(170).springify().damping(18)} className="mt-6">
        <GoogleButton onPress={() => void signInWithGoogle(getValues('role'))} />
        <OrDivider label="or sign up with email" className="mt-5" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(230).springify().damping(18)} className="mt-6 gap-5">
        <View className="flex-row gap-3">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                containerClassName="flex-1"
                label="First name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                placeholder="Lensa"
                autoCapitalize="words"
                textContentType="givenName"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                ref={lastNameRef}
                containerClassName="flex-1"
                label="Last name"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                placeholder="Tadesse"
                autoCapitalize="words"
                textContentType="familyName"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              ref={emailRef}
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
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              ref={phoneRef}
              label="Phone (optional)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              placeholder="+251 ..."
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
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
              placeholder="At least 8 characters"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit(onSubmit)()}
            />
          )}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)} className="mt-9">
        <Button
          label="Create account"
          icon={ArrowRight}
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(340)}
        className="flex-row items-center justify-center gap-1.5 pt-8"
      >
        <Text className="font-sans text-sm text-ink/60">Already have an account?</Text>
        <Pressable hitSlop={8} onPress={() => router.replace('/login')}>
          <Text className="font-sans-bold text-sm text-ink underline">Log in</Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

function RoleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn(
        'h-12 flex-1 items-center justify-center border',
        active ? 'border-ink bg-ink' : 'border-ink/20 bg-canvas'
      )}
    >
      <Text
        className={cn(
          'font-display text-sm uppercase tracking-wide',
          active ? 'text-canvas' : 'text-ink/70'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
