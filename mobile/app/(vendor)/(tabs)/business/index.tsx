import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Check,
  FileText,
  ImagePlus,
  Info,
  LifeBuoy,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/http';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { SettingsGroup, SettingsRow } from '@/components/ui/SettingsRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { VendorMap } from '@/components/vendors/VendorMap';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useMyVendor, useResolveMapLink, useUpsertVendor } from '@/hooks/useMyVendor';
import { showAlert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { formatTime12 } from '@/lib/format';
import { pickImages } from '@/lib/image';
import {
  createDefaultWorkingHours,
  createEmptyBlackout,
  DAY_LABELS,
  MAX_IMAGE_COUNT,
  VENDOR_STATUS_META,
  VENDOR_TIMEZONE,
} from '@/lib/vendor';
import { colors } from '@/theme/colors';
import type { StatusTone } from '@/lib/bookingStatus';
import type { BlackoutSlot, Vendor, VendorImagePayload, WorkingHour } from '@/types/vendor';

// ── time / date helpers (wall-clock strings ↔ Date) ──────────────────────────
const hhmmToDate = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
};
const dateToHhmm = (d: Date) =>
  `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;
const dateKeyToDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
};
const dateToKey = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const formatDateKey = (value: string) =>
  value
    ? dateKeyToDate(value).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Pick a date';

const TONE_BG: Record<StatusTone, string> = {
  ink: 'bg-ink',
  acid: 'bg-acid',
  muted: 'border border-ink/20 bg-transparent',
  destructive: 'bg-destructive',
};
const TONE_TEXT: Record<StatusTone, string> = {
  ink: 'text-canvas',
  acid: 'text-ink',
  muted: 'text-ink/60',
  destructive: 'text-white',
};

type VendorForm = {
  displayName: string;
  legalBusinessName: string;
  description: string;
  categories: string[];
  city: string;
  countryCode: string;
  addressLine1: string;
  locationDescription: string;
  coordinates: [number, number]; // [lng, lat]
  workingHours: WorkingHour[];
  blackoutSlots: BlackoutSlot[];
};

const buildForm = (vendor?: Vendor): VendorForm => ({
  displayName: vendor?.displayName ?? '',
  legalBusinessName: vendor?.legalBusinessName ?? '',
  description: vendor?.description ?? '',
  categories: vendor?.categories ?? [],
  city: vendor?.location.city ?? '',
  countryCode: vendor?.location.countryCode ?? 'ET',
  addressLine1: vendor?.location.addressLine1 ?? '',
  locationDescription: vendor?.location.description ?? '',
  coordinates: (vendor?.location.coordinates.coordinates as [number, number]) ?? [0, 0],
  workingHours: vendor?.workingHours?.length ? vendor.workingHours : createDefaultWorkingHours(),
  blackoutSlots: vendor?.blackoutSlots ?? [],
});

type PickerState = {
  mode: 'date' | 'time';
  value: Date;
  title: string;
  onPick: (d: Date) => void;
} | null;

export default function VendorBusiness() {
  const haptics = useHaptics();
  const { user, logout } = useAuth();

  const vendor = useMyVendor();
  const hasVendor = Boolean(vendor.data);
  const upsert = useUpsertVendor(hasVendor);
  const resolveMapLink = useResolveMapLink();

  const [form, setForm] = useState<VendorForm>(() => buildForm(undefined));
  const [newImages, setNewImages] = useState<VendorImagePayload[] | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [mapLink, setMapLink] = useState('');
  // Raw text for the manual lat/lng fields, kept separate from the parsed
  // numbers in `form.coordinates` so partial input (e.g. "8." or "-") is typable.
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [picking, setPicking] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [picker, setPicker] = useState<PickerState>(null);
  const seededRef = useRef(false);

  // Seed the form once the profile arrives (edit mode).
  useEffect(() => {
    if (vendor.data && !seededRef.current) {
      seededRef.current = true;
      setForm(buildForm(vendor.data));
      const coords = vendor.data.location.coordinates.coordinates ?? [];
      setLngInput(coords[0] ? String(coords[0]) : '');
      setLatInput(coords[1] ? String(coords[1]) : '');
      setExistingImages(
        vendor.data.images?.length
          ? vendor.data.images
          : vendor.data.imageUrl
            ? [vendor.data.imageUrl]
            : [],
      );
    }
  }, [vendor.data]);

  const update = (patch: Partial<VendorForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const updateHour = (dayOfWeek: number, patch: Partial<WorkingHour>) =>
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h,
      ),
    }));
  const updateBlackout = (index: number, patch: Partial<BlackoutSlot>) =>
    setForm((prev) => ({
      ...prev,
      blackoutSlots: prev.blackoutSlots.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));

  const previews = newImages ? newImages.map((img) => img.data) : existingImages;
  const canRemovePreviews = newImages !== null;

  const addPhotos = async () => {
    haptics.light();
    const base = newImages ?? [];
    setPicking(true);
    try {
      const { images, error } = await pickImages(MAX_IMAGE_COUNT - base.length);
      if (error) return showAlert('Photos', error);
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

  const addCategory = () => {
    const parts = categoryInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const merged = Array.from(new Set([...form.categories, ...parts]));
    update({ categories: merged });
    setCategoryInput('');
  };

  const applyMapLink = () => {
    const raw = mapLink.trim();
    if (!raw) return;
    // Plain "lat, lng" pasted directly → no server round-trip needed.
    const pair = raw.match(/^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (pair) {
      update({ coordinates: [Number(pair[2]), Number(pair[1])] });
      setLatInput(pair[1]);
      setLngInput(pair[2]);
      setMapLink('');
      haptics.success();
      return;
    }
    resolveMapLink.mutate(raw, {
      onSuccess: ({ coordinates }) => {
        if (coordinates.length >= 2) {
          update({ coordinates: [coordinates[0], coordinates[1]] });
          setLngInput(String(coordinates[0]));
          setLatInput(String(coordinates[1]));
          setMapLink('');
          haptics.success();
        } else {
          showAlert('Location', 'Could not read coordinates from that link.');
        }
      },
      onError: (error) => showAlert('Location', getErrorMessage(error, 'Unable to resolve that link.')),
    });
  };

  // Manual lat/lng entry: keep the raw text, commit the parsed number (or 0 when
  // the field is cleared/invalid) to the form's [lng, lat] coordinate pair.
  const onLatInput = (text: string) => {
    setLatInput(text);
    const n = Number(text);
    setForm((prev) => ({
      ...prev,
      coordinates: [prev.coordinates[0], Number.isFinite(n) ? n : 0],
    }));
  };
  const onLngInput = (text: string) => {
    setLngInput(text);
    const n = Number(text);
    setForm((prev) => ({
      ...prev,
      coordinates: [Number.isFinite(n) ? n : 0, prev.coordinates[1]],
    }));
  };

  const openInMaps = () => {
    const [lng, lat] = form.coordinates;
    const query =
      lat || lng
        ? `${lat},${lng}`
        : encodeURIComponent(
            [form.displayName, form.city].filter(Boolean).join(' ') || 'Addis Ababa',
          );
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const openPicker = (next: NonNullable<PickerState>) => setPicker(next);

  const onSave = () => {
    if (!form.displayName.trim() || !form.city.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    const [lng, lat] = form.coordinates;
    const payload = {
      displayName: form.displayName.trim(),
      legalBusinessName: form.legalBusinessName.trim() || undefined,
      description: form.description.trim() || undefined,
      categories: form.categories,
      workingHours: form.workingHours,
      blackoutSlots: form.blackoutSlots,
      images: newImages ?? undefined,
      location: {
        countryCode: form.countryCode.trim() || 'ET',
        city: form.city.trim(),
        addressLine1: form.addressLine1.trim() || undefined,
        description: form.locationDescription.trim() || undefined,
        coordinates: lat || lng ? [lng, lat] : undefined,
      },
    };
    upsert.mutate(payload, {
      onSuccess: () => {
        haptics.success();
        setNewImages(null);
        showAlert(hasVendor ? 'Saved' : 'Profile created', 'Your business profile is up to date.');
      },
      onError: (error) => {
        haptics.error();
        showAlert('Could not save', getErrorMessage(error));
      },
    });
  };

  const onLogout = () => {
    showAlert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          haptics.medium();
          logout();
          router.replace('/landing');
        },
      },
    ]);
  };

  if (vendor.isLoading) {
    return (
      <Screen scroll contentClassName="px-6 pt-2">
        <View className="mt-8 gap-4">
          <Skeleton height={48} width="60%" />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={160} />
        </View>
      </Screen>
    );
  }

  const statusMeta = vendor.data ? VENDOR_STATUS_META[vendor.data.status] : null;
  const [lng, lat] = form.coordinates;
  const hasCoords = Boolean(lat || lng);

  return (
    <>
      <Screen scroll keyboardAware contentClassName="px-6 pb-12 pt-2">
        <View className="flex-row items-center justify-between">
          <BackButton />
          {statusMeta ? (
            <View className={cn('px-2.5 py-1', TONE_BG[statusMeta.tone])}>
              <Text
                className={cn(
                  'font-mono text-[10px] uppercase tracking-[0.14em]',
                  TONE_TEXT[statusMeta.tone],
                )}
              >
                {statusMeta.label}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-6">
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            {hasVendor ? 'Business profile' : 'Set up your business'}
          </Text>
          <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
            {form.displayName || 'Business'}
          </Text>
        </View>

        {/* Basics */}
        <Section title="Basics" />
        <View className="gap-5">
          <TextField
            label="Display name"
            value={form.displayName}
            onChangeText={(t) => update({ displayName: t })}
            error={showErrors && !form.displayName.trim() ? 'A display name is required.' : undefined}
            placeholder="Lensa Beauty Studio"
            autoCapitalize="words"
          />
          <TextField
            label="Legal business name"
            value={form.legalBusinessName}
            onChangeText={(t) => update({ legalBusinessName: t })}
            placeholder="Optional"
            autoCapitalize="words"
          />
          <TextField
            label="Description"
            value={form.description}
            onChangeText={(t) => update({ description: t })}
            placeholder="Tell customers what you offer"
            multiline
            numberOfLines={4}
          />

          {/* Categories */}
          <View>
            <Text className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
              Categories
            </Text>
            {form.categories.length > 0 ? (
              <View className="mb-3 flex-row flex-wrap gap-2">
                {form.categories.map((c) => (
                  <Pressable
                    key={c}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${c}`}
                    onPress={() => update({ categories: form.categories.filter((x) => x !== c) })}
                    className="h-9 flex-row items-center gap-1.5 border border-ink bg-ink px-3"
                  >
                    <Text className="font-mono text-[11px] uppercase tracking-[0.12em] text-canvas">
                      {c}
                    </Text>
                    <X size={12} color={colors.canvas} strokeWidth={2.5} />
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View className="flex-row gap-3">
              <TextField
                containerClassName="flex-1"
                label=""
                value={categoryInput}
                onChangeText={setCategoryInput}
                placeholder="e.g. Beauty, Nails"
                autoCapitalize="words"
                onSubmitEditing={addCategory}
                returnKeyType="done"
              />
              <View className="justify-end">
                <Button
                  label="Add"
                  variant="outline"
                  size="md"
                  icon={Plus}
                  iconPosition="leading"
                  fullWidth={false}
                  onPress={addCategory}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location */}
        <Section title="Location" />
        <View className="gap-5">
          <View className="flex-row gap-4">
            <TextField
              containerClassName="flex-1"
              label="City"
              value={form.city}
              onChangeText={(t) => update({ city: t })}
              error={showErrors && !form.city.trim() ? 'Required.' : undefined}
              placeholder="Addis Ababa"
              autoCapitalize="words"
            />
            <TextField
              containerClassName="w-28"
              label="Country"
              value={form.countryCode}
              onChangeText={(t) => update({ countryCode: t.toUpperCase() })}
              placeholder="ET"
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
          <TextField
            label="Address"
            value={form.addressLine1}
            onChangeText={(t) => update({ addressLine1: t })}
            placeholder="Street, building (optional)"
          />
          <TextField
            label="Directions"
            value={form.locationDescription}
            onChangeText={(t) => update({ locationDescription: t })}
            placeholder="Landmarks, floor, parking (optional)"
            multiline
            numberOfLines={2}
          />

          {/* Map link → coordinates */}
          <View className="border border-ink/15 bg-white p-4">
            <View className="flex-row items-center gap-2">
              <MapPin size={15} color={colors.ink} strokeWidth={2} />
              <Text className="font-sans-bold text-sm text-ink">Pin exact location</Text>
            </View>
            <Text className="mt-1 font-sans text-xs text-ink/60">
              Paste a Google Maps link, or coordinates like 8.9950, 38.7924.
            </Text>
            <View className="mt-3 flex-row gap-3">
              <TextField
                containerClassName="flex-1"
                label=""
                value={mapLink}
                onChangeText={setMapLink}
                placeholder="Maps link or lat, lng"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View className="justify-end">
                <Button
                  label="Use"
                  variant="outline"
                  size="md"
                  fullWidth={false}
                  loading={resolveMapLink.isPending}
                  onPress={applyMapLink}
                />
              </View>
            </View>

            {/* Manual entry */}
            <View className="mt-4 flex-row gap-3">
              <TextField
                containerClassName="flex-1"
                label="Latitude"
                value={latInput}
                onChangeText={onLatInput}
                placeholder="8.9950"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextField
                containerClassName="flex-1"
                label="Longitude"
                value={lngInput}
                onChangeText={onLngInput}
                placeholder="38.7924"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Live preview */}
            {hasCoords ? (
              <View className="mt-4">
                <VendorMap latitude={lat} longitude={lng} onPress={openInMaps} height={160} />
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
                    {`Set · ${lat.toFixed(5)}, ${lng.toFixed(5)}`}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open in Maps"
                    onPress={openInMaps}
                    hitSlop={6}
                    className="active:opacity-70"
                  >
                    <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink underline">
                      Open in Maps
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
                No location set
              </Text>
            )}
          </View>
        </View>

        {/* Photos */}
        <Section title="Photos" />
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
                    onPress={() => setNewImages((p) => (p ? p.filter((_, i) => i !== index) : p))}
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
            <Button
              label="Clear"
              variant="ghost"
              size="md"
              fullWidth={false}
              onPress={() => {
                setNewImages([]);
                setExistingImages([]);
              }}
            />
          ) : null}
        </View>
        <Text className="mt-2 font-sans text-xs text-ink/50">Up to {MAX_IMAGE_COUNT} photos.</Text>

        {/* Working hours */}
        <Section title="Working hours" subtitle={`Times are in ${VENDOR_TIMEZONE.replace('_', ' ')}.`} />
        <View className="gap-2">
          {form.workingHours.map((hour) => (
            <View
              key={hour.dayOfWeek}
              className="flex-row items-center gap-3 border border-ink/15 bg-white px-4 py-3"
            >
              <Checkbox
                checked={hour.isEnabled}
                onChange={(v) => updateHour(hour.dayOfWeek, { isEnabled: v })}
                accessibilityLabel={`${DAY_LABELS[hour.dayOfWeek]} open`}
              />
              <Text className="w-10 font-sans-bold text-sm text-ink">
                {DAY_LABELS[hour.dayOfWeek].slice(0, 3)}
              </Text>
              {hour.isEnabled ? (
                <View className="flex-1 flex-row items-center justify-end gap-2">
                  <TimeChip
                    value={hour.startTime}
                    onPress={() =>
                      openPicker({
                        mode: 'time',
                        value: hhmmToDate(hour.startTime),
                        title: `${DAY_LABELS[hour.dayOfWeek]} opens`,
                        onPick: (d) => updateHour(hour.dayOfWeek, { startTime: dateToHhmm(d) }),
                      })
                    }
                  />
                  <Text className="font-sans text-ink/40">–</Text>
                  <TimeChip
                    value={hour.endTime}
                    onPress={() =>
                      openPicker({
                        mode: 'time',
                        value: hhmmToDate(hour.endTime),
                        title: `${DAY_LABELS[hour.dayOfWeek]} closes`,
                        onPick: (d) => updateHour(hour.dayOfWeek, { endTime: dateToHhmm(d) }),
                      })
                    }
                  />
                </View>
              ) : (
                <Text className="flex-1 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
                  Closed
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Blackout slots */}
        <Section title="Blocked times" subtitle="Dates and hours customers can't book." />
        <View className="gap-3">
          {form.blackoutSlots.length === 0 ? (
            <View className="border border-dashed border-ink/20 bg-white p-4">
              <Text className="font-sans text-sm text-ink/50">No blocked times added yet.</Text>
            </View>
          ) : (
            form.blackoutSlots.map((slot, index) => (
              <View key={index} className="gap-3 border border-ink/15 bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      openPicker({
                        mode: 'date',
                        value: slot.date ? dateKeyToDate(slot.date) : new Date(),
                        title: 'Blocked date',
                        onPick: (d) => updateBlackout(index, { date: dateToKey(d) }),
                      })
                    }
                    className="h-11 flex-1 flex-row items-center border border-ink/15 bg-white px-3 active:bg-ink/5"
                  >
                    <Text className={cn('font-sans text-base', slot.date ? 'text-ink' : 'text-ink/40')}>
                      {formatDateKey(slot.date)}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove blocked time"
                    hitSlop={8}
                    onPress={() =>
                      update({ blackoutSlots: form.blackoutSlots.filter((_, i) => i !== index) })
                    }
                    className="ml-3 h-11 w-11 items-center justify-center border border-ink/15 bg-white active:bg-ink/5"
                  >
                    <Trash2 size={16} color={colors.inkMuted} strokeWidth={2} />
                  </Pressable>
                </View>
                <View className="flex-row items-center gap-2">
                  <TimeChip
                    value={slot.startTime}
                    onPress={() =>
                      openPicker({
                        mode: 'time',
                        value: hhmmToDate(slot.startTime),
                        title: 'Block starts',
                        onPick: (d) => updateBlackout(index, { startTime: dateToHhmm(d) }),
                      })
                    }
                  />
                  <Text className="font-sans text-ink/40">–</Text>
                  <TimeChip
                    value={slot.endTime}
                    onPress={() =>
                      openPicker({
                        mode: 'time',
                        value: hhmmToDate(slot.endTime),
                        title: 'Block ends',
                        onPick: (d) => updateBlackout(index, { endTime: dateToHhmm(d) }),
                      })
                    }
                  />
                </View>
                <TextField
                  label=""
                  value={slot.label}
                  onChangeText={(t) => updateBlackout(index, { label: t })}
                  placeholder="Reason (optional)"
                />
              </View>
            ))
          )}
          <Button
            label="Add blocked time"
            variant="outline"
            size="md"
            icon={Plus}
            iconPosition="leading"
            onPress={() => update({ blackoutSlots: [...form.blackoutSlots, createEmptyBlackout()] })}
          />
        </View>

        {/* Save */}
        <View className="mt-9">
          <Button
            label={hasVendor ? 'Save profile' : 'Create profile'}
            icon={Check}
            iconPosition="leading"
            loading={upsert.isPending}
            onPress={onSave}
          />
        </View>

        {/* Account */}
        <SettingsGroup title="Account">
          <SettingsRow label="Signed in as" value={user?.email ?? '—'} />
          <SettingsRow
            icon={LifeBuoy}
            label="Help & support"
            onPress={() => router.push('/support')}
          />
          <SettingsRow icon={FileText} label="Terms of service" onPress={() => router.push('/legal/terms')} />
          <SettingsRow
            icon={ShieldCheck}
            label="Privacy policy"
            onPress={() => router.push('/legal/privacy')}
          />
          <SettingsRow icon={Info} label="About Slotify" onPress={() => router.push('/about')} last />
        </SettingsGroup>
        <View className="mt-6">
          <Button label="Log out" variant="outline" icon={LogOut} iconPosition="leading" onPress={onLogout} />
        </View>
      </Screen>

      {/* Date / time picker */}
      {picker
        ? (Platform.OS === 'ios' ? (
            <Sheet visible onClose={() => setPicker(null)} title={picker.title}>
              <View className="items-center">
                <DateTimePicker
                  value={picker.value}
                  mode={picker.mode}
                  display="spinner"
                  themeVariant="light"
                  onChange={(_, d) => d && setPicker((p) => (p ? { ...p, value: d } : p))}
                />
              </View>
              <View className="mt-2">
                <Button
                  label="Done"
                  onPress={() => {
                    picker.onPick(picker.value);
                    setPicker(null);
                  }}
                />
              </View>
            </Sheet>
          ) : (
            <DateTimePicker
              value={picker.value}
              mode={picker.mode}
              onChange={(event, d) => {
                const current = picker;
                setPicker(null);
                if (event.type === 'set' && d && current) current.onPick(d);
              }}
            />
          ))
        : null}
    </>
  );
}

function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-4 mt-9">
      <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">{title}</Text>
      {subtitle ? <Text className="mt-1 font-sans text-xs text-ink/50">{subtitle}</Text> : null}
    </View>
  );
}

function TimeChip({ value, onPress }: { value: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Time ${value}`}
      onPress={onPress}
      className="h-10 items-center justify-center border border-ink/15 bg-white px-3 active:bg-ink/5"
    >
      <Text className="font-sans-bold text-sm text-ink">{formatTime12(value)}</Text>
    </Pressable>
  );
}
