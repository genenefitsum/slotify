import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ImagePlus, Trash2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/http';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useHaptics } from '@/hooks/useHaptics';
import { useMyVendor } from '@/hooks/useMyVendor';
import {
  useCreateService,
  useDeleteService,
  useMyServices,
  useUpdateService,
} from '@/hooks/useServices';
import { showAlert } from '@/lib/alert';
import { pickImages } from '@/lib/image';
import { MAX_IMAGE_COUNT } from '@/lib/vendor';
import { colors } from '@/theme/colors';
import type { DepositType, Service } from '@/types/service';
import type { VendorImagePayload } from '@/types/vendor';

type Draft = {
  name: string;
  description: string;
  durationMinutes: string;
  bufferBeforeMinutes: string;
  bufferAfterMinutes: string;
  priceAmount: string;
  depositType: DepositType;
  depositValue: string;
  isActive: boolean;
};

const DEPOSIT_OPTIONS: { value: DepositType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'percentage', label: 'Percent' },
];

const buildDraft = (service?: Service): Draft => ({
  name: service?.name ?? '',
  description: service?.description ?? '',
  durationMinutes: String(service?.durationMinutes ?? 60),
  bufferBeforeMinutes: String(service?.bufferBeforeMinutes ?? 0),
  bufferAfterMinutes: String(service?.bufferAfterMinutes ?? 0),
  priceAmount: String(service?.priceAmount ?? 0),
  depositType: service?.depositType ?? 'none',
  depositValue: String(service?.depositValue ?? 0),
  isActive: service?.isActive ?? true,
});

export default function ServiceEditor() {
  const router = useRouter();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const vendor = useMyVendor();
  const services = useMyServices(vendor.data?.id);
  const existing = useMemo(
    () => (id ? services.data?.items.find((s) => s.id === id) : undefined),
    [id, services.data],
  );

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [draft, setDraft] = useState<Draft>(() => buildDraft(undefined));
  // null = keep existing images untouched; array = replace with this new set.
  const [newImages, setNewImages] = useState<VendorImagePayload[] | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const seededRef = useRef(false);

  // Seed the form once the service arrives from cache (edit / deep link).
  useEffect(() => {
    if (isEdit && existing && !seededRef.current) {
      seededRef.current = true;
      setDraft(buildDraft(existing));
      setExistingImages(existing.images?.length ? existing.images : existing.imageUrl ? [existing.imageUrl] : []);
    }
  }, [isEdit, existing]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const previews = newImages ? newImages.map((img) => img.data) : existingImages;
  const canRemovePreviews = newImages !== null;

  const addPhotos = async () => {
    haptics.light();
    const base = newImages ?? [];
    setPicking(true);
    try {
      const { images, error } = await pickImages(MAX_IMAGE_COUNT - base.length);
      if (error) {
        showAlert('Photos', error);
        return;
      }
      if (images?.length) {
        setNewImages([...base, ...images]);
        setExistingImages([]);
      }
    } catch (error) {
      showAlert(
        'Photos',
        getErrorMessage(error, 'Could not open the photo library. If you just added photo support, rebuild the app.'),
      );
    } finally {
      setPicking(false);
    }
  };

  const removePhoto = (index: number) =>
    setNewImages((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));

  const clearPhotos = () => {
    setNewImages([]);
    setExistingImages([]);
  };

  const nameError = showErrors && !draft.name.trim() ? 'A service name is required.' : undefined;
  const duration = Number(draft.durationMinutes);
  const durationError =
    showErrors && (!Number.isFinite(duration) || duration <= 0)
      ? 'Enter a duration in minutes.'
      : undefined;

  const onSubmit = () => {
    if (!draft.name.trim() || !Number.isFinite(duration) || duration <= 0) {
      setShowErrors(true);
      haptics.error();
      return;
    }

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      durationMinutes: Math.round(duration),
      bufferBeforeMinutes: Math.max(0, Math.round(Number(draft.bufferBeforeMinutes) || 0)),
      bufferAfterMinutes: Math.max(0, Math.round(Number(draft.bufferAfterMinutes) || 0)),
      priceAmount: Math.max(0, Number(draft.priceAmount) || 0),
      currency: 'ETB',
      depositType: draft.depositType,
      depositValue: draft.depositType === 'none' ? 0 : Math.max(0, Number(draft.depositValue) || 0),
      images: newImages ?? undefined,
    };

    const handlers = {
      onSuccess: () => {
        haptics.success();
        router.back();
      },
      onError: (error: unknown) => {
        haptics.error();
        showAlert('Could not save service', getErrorMessage(error));
      },
    };

    if (isEdit && id) {
      updateService.mutate({ id, payload: { ...payload, isActive: draft.isActive } }, handlers);
    } else {
      createService.mutate(payload, handlers);
    }
  };

  const onDelete = () => {
    if (!id) return;
    showAlert('Delete service?', `"${draft.name || 'This service'}" will be removed permanently.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteService.mutate(id, {
            onSuccess: () => {
              haptics.success();
              router.back();
            },
            onError: (error) => {
              haptics.error();
              showAlert('Could not delete service', getErrorMessage(error));
            },
          }),
      },
    ]);
  };

  const saving = createService.isPending || updateService.isPending;

  return (
    <Screen scroll keyboardAware contentClassName="px-6 pb-10 pt-2">
      <BackButton />

      <View className="mt-6">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {isEdit ? 'Edit service' : 'New service'}
        </Text>
        <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          {isEdit ? draft.name || 'Service' : 'Service'}
        </Text>
      </View>

      <View className="mt-8 gap-5">
        <TextField
          label="Name"
          value={draft.name}
          onChangeText={(t) => set('name', t)}
          error={nameError}
          placeholder="Signature haircut"
          autoCapitalize="words"
        />

        <TextField
          label="Description"
          value={draft.description}
          onChangeText={(t) => set('description', t)}
          placeholder="What's included"
          multiline
          numberOfLines={3}
        />

        <View className="flex-row gap-4">
          <TextField
            containerClassName="flex-1"
            label="Price (ETB)"
            value={draft.priceAmount}
            onChangeText={(t) => set('priceAmount', t)}
            keyboardType="numeric"
            placeholder="0"
          />
          <TextField
            containerClassName="flex-1"
            label="Duration (min)"
            value={draft.durationMinutes}
            onChangeText={(t) => set('durationMinutes', t)}
            keyboardType="numeric"
            placeholder="60"
            error={durationError}
          />
        </View>

        <View className="flex-row gap-4">
          <TextField
            containerClassName="flex-1"
            label="Buffer before (min)"
            value={draft.bufferBeforeMinutes}
            onChangeText={(t) => set('bufferBeforeMinutes', t)}
            keyboardType="numeric"
            placeholder="0"
          />
          <TextField
            containerClassName="flex-1"
            label="Buffer after (min)"
            value={draft.bufferAfterMinutes}
            onChangeText={(t) => set('bufferAfterMinutes', t)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        {/* Deposit */}
        <View>
          <Text className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
            Deposit
          </Text>
          <View className="flex-row gap-2">
            {DEPOSIT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={draft.depositType === opt.value}
                onPress={() => set('depositType', opt.value)}
              />
            ))}
          </View>
          {draft.depositType !== 'none' ? (
            <TextField
              containerClassName="mt-4"
              label={draft.depositType === 'fixed' ? 'Deposit amount (ETB)' : 'Deposit percent (%)'}
              value={draft.depositValue}
              onChangeText={(t) => set('depositValue', t)}
              keyboardType="numeric"
              placeholder="0"
            />
          ) : null}
        </View>

        {/* Photos */}
        <View>
          <Text className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
            Photos
          </Text>
          {previews.length > 0 ? (
            <View className="mb-3 flex-row flex-wrap gap-3">
              {previews.map((uri, index) => (
                <View key={`${uri}-${index}`} className="h-24 w-24 border border-ink/15 bg-ink/5">
                  <Image source={uri} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  {canRemovePreviews ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove photo ${index + 1}`}
                      hitSlop={6}
                      onPress={() => removePhoto(index)}
                      className="absolute right-0 top-0 h-6 w-6 items-center justify-center bg-ink"
                    >
                      <X size={13} color={colors.canvas} strokeWidth={2.5} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          <View className="flex-row gap-3">
            <Button
              label={picking ? 'Opening…' : 'Add photos'}
              variant="outline"
              size="md"
              icon={ImagePlus}
              iconPosition="leading"
              fullWidth={false}
              disabled={picking}
              onPress={addPhotos}
            />
            {previews.length > 0 ? (
              <Button label="Clear" variant="ghost" size="md" fullWidth={false} onPress={clearPhotos} />
            ) : null}
          </View>
          <Text className="mt-2 font-sans text-xs text-ink/50">Up to {MAX_IMAGE_COUNT} photos.</Text>
        </View>

        {/* Active toggle (edit only — new services are active by default) */}
        {isEdit ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => set('isActive', !draft.isActive)}
            className="flex-row items-center justify-between border border-ink/15 bg-white p-4 active:bg-ink/5"
          >
            <View className="flex-1 pr-4">
              <Text className="font-sans-bold text-base text-ink">Active</Text>
              <Text className="mt-0.5 font-sans text-xs text-ink/60">
                Inactive services stay hidden from customers.
              </Text>
            </View>
            <Checkbox
              checked={draft.isActive}
              onChange={(v) => set('isActive', v)}
              accessibilityLabel="Active"
            />
          </Pressable>
        ) : null}
      </View>

      <View className="mt-9 gap-3">
        <Button
          label={isEdit ? 'Save changes' : 'Create service'}
          icon={Check}
          iconPosition="leading"
          loading={saving}
          onPress={onSubmit}
        />
        {isEdit ? (
          <Button
            label="Delete service"
            variant="outline"
            icon={Trash2}
            iconPosition="leading"
            loading={deleteService.isPending}
            onPress={onDelete}
          />
        ) : null}
      </View>
    </Screen>
  );
}
