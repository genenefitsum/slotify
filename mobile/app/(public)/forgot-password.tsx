import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { authApi } from '@/api/auth.api';
import { getErrorMessage } from '@/api/http';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useHaptics } from '@/hooks/useHaptics';
import { showAlert } from '@/lib/alert';
import {
  type ForgotPasswordForm,
  forgotPasswordSchema,
  type ResetPasswordForm,
  resetPasswordSchema,
} from '@/lib/validation';

type Step = 'request' | 'reset';

export default function ForgotPassword() {
  const haptics = useHaptics();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', newPassword: '' },
  });

  const sendCode = async (value: string) => {
    const response = await authApi.forgotPassword({ email: value.trim() });
    setNotice(response.message);
  };

  const onRequest = async (values: ForgotPasswordForm) => {
    setSubmitting(true);
    try {
      await sendCode(values.email);
      setEmail(values.email.trim());
      haptics.success();
      setStep('reset');
    } catch (error) {
      haptics.error();
      showAlert('Could not send code', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = async (values: ResetPasswordForm) => {
    setSubmitting(true);
    try {
      await authApi.resetPassword({ email, code: values.code.trim(), newPassword: values.newPassword });
      haptics.success();
      showAlert('Password updated', 'Sign in with your new password.');
      router.replace('/login');
    } catch (error) {
      haptics.error();
      showAlert('Could not reset password', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    try {
      await sendCode(email);
      haptics.success();
    } catch (error) {
      haptics.error();
      showAlert('Could not resend code', getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentClassName="px-6 pb-8 pt-2">
      <Animated.View entering={FadeIn.duration(300)}>
        <BackButton />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify().damping(18)} className="mt-8">
        <Badge label={step === 'request' ? 'Forgot password' : 'Check your email'} />
        <Text className="mt-5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          {step === 'request' ? 'Reset it' : 'Enter code'}
        </Text>
        <Text className="mt-3 font-sans text-base text-ink/60">
          {step === 'request'
            ? 'Enter your email and we’ll send you a 6-digit reset code.'
            : 'Enter the code we emailed you and choose a new password.'}
        </Text>
      </Animated.View>

      {step === 'request' ? (
        <>
          <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} className="mt-9 gap-5">
            <Controller
              control={requestForm.control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={requestForm.formState.errors.email?.message}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={() => void requestForm.handleSubmit(onRequest)()}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(270).springify().damping(18)} className="mt-8">
            <Button
              label="Send reset code"
              icon={ArrowRight}
              loading={submitting}
              onPress={requestForm.handleSubmit(onRequest)}
            />
          </Animated.View>
        </>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(130).springify().damping(18)} className="mt-6">
            {notice ? (
              <Text className="rounded-2xl border border-ink/10 bg-ink/5 px-4 py-3 font-sans text-sm text-ink/60">
                {notice}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} className="mt-6 gap-5">
            <Controller
              control={resetForm.control}
              name="code"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="Reset code"
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
                  onBlur={onBlur}
                  error={resetForm.formState.errors.code?.message}
                  placeholder="123456"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  returnKeyType="next"
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="newPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextField
                  label="New password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={resetForm.formState.errors.newPassword?.message}
                  placeholder="••••••••"
                  secure
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={() => void resetForm.handleSubmit(onReset)()}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(270).springify().damping(18)} className="mt-8">
            <Button
              label="Update password"
              icon={ArrowRight}
              loading={submitting}
              onPress={resetForm.handleSubmit(onReset)}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300)}
            className="mt-6 flex-row items-center justify-between"
          >
            <Pressable
              hitSlop={8}
              onPress={() => {
                setStep('request');
                resetForm.reset();
              }}
            >
              <Text className="font-sans text-sm text-ink/60">Change email</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={() => void onResend()}>
              <Text className="font-sans-bold text-sm text-ink underline">Resend code</Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      <View className="flex-1" />

      <Animated.View
        entering={FadeInDown.delay(320)}
        className="flex-row items-center justify-center gap-1.5 pt-8"
      >
        <Text className="font-sans text-sm text-ink/60">Remembered it?</Text>
        <Pressable hitSlop={8} onPress={() => router.replace('/login')}>
          <Text className="font-sans-bold text-sm text-ink underline">Back to sign in</Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}
