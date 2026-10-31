import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { type ComponentRef, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, type TextInput, View } from 'react-native';

import { getErrorMessage } from '@/api/http';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { type ProfileForm, profileSchema } from '@/lib/validation';

export default function EditProfile() {
  const haptics = useHaptics();
  const { user, updateProfile } = useAuth();
  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    try {
      await updateProfile({ firstName: values.firstName, lastName: values.lastName ?? '' });
      haptics.success();
      router.back();
    } catch (error) {
      haptics.error();
      Alert.alert('Could not save', getErrorMessage(error));
    }
  };

  return (
    <Screen scroll keyboardAware contentClassName="px-6 pb-8 pt-2">
      <BackButton />

      <View className="mt-8">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          Account
        </Text>
        <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Edit name
        </Text>
        <Text className="mt-3 font-sans text-base text-ink/60">
          Update how your name appears on Slotify.
        </Text>
      </View>

      <View className="mt-10 gap-5">
        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
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
              label="Last name"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.lastName?.message}
              placeholder="Tadesse"
              autoCapitalize="words"
              textContentType="familyName"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit(onSubmit)()}
            />
          )}
        />
      </View>

      <View className="mt-9">
        <Button
          label="Save changes"
          icon={Check}
          iconPosition="leading"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </Screen>
  );
}
