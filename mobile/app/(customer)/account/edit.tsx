import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Camera, Check } from 'lucide-react-native';
import { type ComponentRef, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, type TextInput, View } from 'react-native';

import { getErrorMessage } from '@/api/http';
import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { showAlert } from '@/lib/alert';
import { pickAvatar } from '@/lib/image';
import { type ProfileForm, profileSchema } from '@/lib/validation';
import { colors } from '@/theme/colors';
import type { ImagePayload } from '@/types/auth';

export default function EditProfile() {
  const haptics = useHaptics();
  const { user, updateProfile } = useAuth();
  const lastNameRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [avatar, setAvatar] = useState<ImagePayload | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [picking, setPicking] = useState(false);

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  // What the avatar should display right now: a freshly picked preview, else the
  // saved photo — unless the user chose to remove it, in which case show initials.
  const displayUri = removed ? undefined : (preview ?? user?.avatarUrl ?? undefined);
  const hasPhoto = Boolean(displayUri);

  const onPickAvatar = async () => {
    haptics.light();
    setPicking(true);
    try {
      const { image, error } = await pickAvatar();
      if (error) {
        showAlert('Photo', error);
        return;
      }
      if (image) {
        setAvatar(image);
        setPreview(image.data);
        setRemoved(false);
      }
    } catch (error) {
      showAlert(
        'Photo',
        getErrorMessage(error, 'Could not open the photo library. If you just added photo support, rebuild the app.')
      );
    } finally {
      setPicking(false);
    }
  };

  const onRemoveAvatar = () => {
    haptics.light();
    setAvatar(null);
    setPreview(null);
    setRemoved(true);
  };

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
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName ?? '',
        // A new pick uploads; an explicit removal clears; otherwise leave as-is.
        avatar: avatar ? avatar : removed ? null : undefined,
      });
      haptics.success();
      router.back();
    } catch (error) {
      haptics.error();
      showAlert('Could not save', getErrorMessage(error));
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
          Edit profile
        </Text>
        <Text className="mt-3 font-sans text-base text-ink/60">
          Update your photo and how your name appears on Slotify.
        </Text>
      </View>

      {/* Profile picture */}
      <View className="mt-8 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile picture"
          onPress={onPickAvatar}
          className="active:opacity-80"
        >
          <Avatar uri={displayUri} initials={initials} size={96} />
          <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-canvas bg-acid">
            <Camera size={15} color={colors.ink} strokeWidth={2.5} />
          </View>
        </Pressable>
        <View className="mt-3 flex-row items-center gap-4">
          <Pressable onPress={onPickAvatar} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-ink underline">
              {picking ? 'Opening…' : hasPhoto ? 'Change photo' : 'Add photo'}
            </Text>
          </Pressable>
          {hasPhoto && (
            <Pressable onPress={onRemoveAvatar} hitSlop={8}>
              <Text className="font-sans-bold text-sm text-ink/50 underline">Remove</Text>
            </Pressable>
          )}
        </View>
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
