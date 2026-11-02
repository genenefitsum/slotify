# Slotify Mobile — Vendor Side Implementation Plan

> The customer side is feature-complete. This plan delivers the **vendor** surface
> of the mobile app at full parity with the web app's vendor dashboard, reinterpreted
> through the same premium Apple design language we used for the customer flows
> (large titles, frosted glass, grouped inset lists, bottom sheets, spring motion,
> haptics). Admin stays out of scope.
>
> **The entire vendor data layer is already ported and verified** — `vendorsApi`,
> `servicesApi`, `bookingsApi`, and `reviewsApi` on mobile already expose every
> method the web vendor dashboard uses. This is therefore a **UI + navigation**
> effort, not an API effort.

---

## 1. How the web vendor side actually works (analysis)

The web app's whole vendor experience is a **single route** — `/dashboard/vendor`
(`frontend/src/pages/VendorDashboardPage.tsx`, ~1424 lines) — guarded by
`RequireAuth` + `RequireRole allowed={['vendor_owner','vendor_staff']}`. It is one
long scrolling page with a **sticky section nav** (scroll-spy) across three sections
and a summary strip on top.

### 1.1 Summary strip (4 tiles)
Derived client-side from the three queries below — no dedicated analytics endpoint:
- **Published services** — `services.length`.
- **Needs action** — count of bookings in `pending_payment | confirmed | in_service`.
- **Average service price** — mean of `priceAmount` over loaded services (ETB).
- **Profile status** — `vendor.status` (`draft`/`pending_verification`/`active`/`suspended`) or "Set up profile", plus the next booking time.

### 1.2 Section A — Booking Operations
- Query: `bookingsApi.list({ page, limit: 8 })` — **vendor-scoped by role on the backend** (same endpoint the customer uses; the server filters by the caller). Paginated, `staleTime 15s`.
- Each booking card shows: service name, start time (localized), vendor name + service price, **customer name + email**, optional customer notes, and a status chip (`bookingStatusLabelMap`).
- **Lifecycle actions**, derived from status via `getAllowedActions`:
  - `pending_payment` → **Confirm**, **Cancel**
  - `confirmed` → **Start**, **Cancel**, **No-show**
  - `in_service` → **Complete**
  - `completed` / `cancelled` / `no_show` → none
- Each maps to `bookingsApi.{confirm,start,complete,cancel,markNoShow}`. `cancel` sends `{ reasonCode: 'vendor_update', reasonText: '…' }`. On success → toast + invalidate `['bookings']`. Per-button pending/loading state.

### 1.3 Section B — Vendor Profile (create **or** update)
- Query: `vendorsApi.getMyVendor()` (`GET /vendors/me`, `retry:false`). A **404 means "no profile yet"** → render "Create Vendor Profile"; otherwise "Vendor Profile".
- Fields:
  - **Identity**: `displayName` (required), `legalBusinessName`, `description`.
  - **Categories**: comma-separated text input, parsed to `string[]` on blur.
  - **Location**: `city` (required), `countryCode` (required, default `ET`), timezone (**read-only** `Africa/Addis_Ababa`), location `description` (landmarks/floor/parking).
  - **Exact coordinates**: paste a Google Maps link or raw `lat, lng`. Parsed locally first (`parseGoogleMapsCoordinates` handles `@lat,lng`, `!3d..!4d`, `q=/ll=/center=` params, bare pairs); if it only looks like a URL, fall back to `vendorsApi.resolveMapLink(link)` which returns `{ coordinates, resolvedUrl }`. Manual lat/long inputs + a live map embed preview. **Coordinates are stored `[lng, lat]`** (GeoJSON order) — mind the swap.
  - **Profile photos**: up to **5**, each **≤ 2MB**, read as `data:<mime>;base64,…` URLs (`VendorImagePayload { data, contentType }`). Previews with remove; "Clear photos" sets `images: []`.
  - **Working hours**: 7 rows (Sun–Sat), each with `isEnabled` + `startTime`/`endTime` (saved in Addis time). Default: Mon–Fri 09:00–18:00 enabled.
  - **Blackout slots**: add/remove rows of `{ date, startTime, endTime, label }`.
- Submit: if a vendor exists → `updateMyVendor(payload)` (`PATCH /vendors/me`), else `create(payload)` (`POST /vendors`). On success → invalidate `['vendor','me']` + `['vendors']`.

### 1.4 Section C — Services CRUD
- Query: `servicesApi.list({ vendorId, page, limit: 10 })`, enabled once the vendor id is known.
- Editor form: `name` (required), `priceAmount` (required), `durationMinutes` (required), currency (**read-only** ETB), `description`, up to **5** photos (`VendorImagePayload[]`). (The web form omits buffers/deposit inputs even though the type supports them — they default to 0/`none`.)
- Create (`servicesApi.create`) vs edit (`servicesApi.update(id, …)`, loaded via "Edit"). Delete (`servicesApi.remove(id)`) with per-row pending state. Invalidate `['services']` on success.

### 1.5 Backend role nuance to respect
`GET /vendors/me`, service create, and service delete are gated to **`vendor_owner`** specifically (`backend/src/routes/vendor.routes.js`, `service.routes.js`), even though the web page route allows `vendor_staff` to *view* it. Mobile registration only creates `vendor_owner`, so **target `vendor_owner`**; treat `vendor_staff` as a read-mostly/future concern and don't assume `/vendors/me` works for staff.

---

## 2. What already exists on mobile (gap analysis)

**Already done — reuse as-is:**
- Full API layer: `src/api/{vendors,services,bookings,reviews}.api.ts` — every needed method is present (`getMyVendor`, `create`, `updateMyVendor`, `resolveMapLink`, service CRUD, booking transitions, `reviewsApi.listByVendor`).
- Ported types: `src/types/{vendor,service,booking,review}.ts` (verbatim from web).
- Design primitives: `Button`, `Screen`, `TextField`, `Sheet`, `Chip`, `Checkbox`, `StatusBadge`, `StarRating`, `Avatar`, `EmptyState`, `Skeleton`, `BackButton`, `SettingsRow`, `SearchBar`.
- `VendorGallery` (swipeable images), `VendorMap` (OSM tiles), `useHaptics`, `alert`/`AlertHost` (themed alert), `format` helpers, `bookingStatus.ts`, `image.ts` (`pickAvatar`).
- Navigation pattern to mirror: **outer Stack + inner `(tabs)`**, with detail/flow screens pushed *over* the tabs so pinned bottom bars aren't hidden by the absolute tab bar.

**Missing — what this plan builds:**
1. **Routing:** vendors currently dead-end at `/landing` after auth. `app/index.tsx`, `(public)/login.tsx`, `(public)/register.tsx` all send non-customers to `/landing`.
2. The entire `app/(vendor)/` route group (no vendor screens exist yet).
3. A **multi-image** picker (current `image.ts` only does single-avatar square crop) for vendor + service photos (≤5, ≤2MB, data-URL). Note the existing **dev-build caveat**: `expo-image-manipulator` needs a native rebuild (`npx expo run:ios`); picking is wrapped in try/catch until then.
4. Vendor-specific helpers: `getVendorBookingActions(status)` + action label/tone map (extend `bookingStatus.ts`).
5. Hooks: `useMyVendor`, `useUpsertVendor`, `useServices` already exists for listing — add `useUpsertService`/`useDeleteService`, and `useBookingTransition`.

---

## 3. Navigation design

Avoid href collisions with the customer group (Expo Router groups don't appear in the
URL, so `(customer)/booking/[id]` and a vendor `booking/[id]` would both resolve to
`/booking/:id`). Use **distinct segments**: `dashboard / orders / services / business`.

```
app/(vendor)/
  _layout.tsx                 # outer Stack (tabs is one screen; detail screens push over)
  (tabs)/
    _layout.tsx               # frosted Tabs: Dashboard · Bookings · Services · Business
    dashboard/index.tsx       # "Today" — summary tiles + needs-action + avatar→account
    orders/index.tsx          # bookings list + filters
    services/index.tsx        # services list + add
    business/index.tsx        # vendor profile (onboarding/edit) + reviews
  order/[id].tsx              # booking detail + lifecycle actions (push over tabs)
  service/edit.tsx            # create/edit a service (push over tabs or a full-screen Sheet)
  account/edit.tsx            # reuse the customer account-edit component
```

Post-auth routing: `vendor_owner`/`vendor_staff` → `/dashboard`. Root `app/index.tsx`
and both auth screens updated to branch on role. Root tab screens keep the
`insets.bottom + ~90` bottom padding to clear the absolute tab bar.

---

## 4. Phased plan (each phase ends at a both-simulators checkpoint)

### Phase V0 — Routing & vendor shell
- Route vendors to `/dashboard` from `app/index.tsx`, `(public)/login.tsx`, `(public)/register.tsx` (branch: `role === 'customer'` → `/explore`, vendor roles → `/dashboard`).
- Build `(vendor)/_layout.tsx` (outer Stack) + `(vendor)/(tabs)/_layout.tsx` (frosted tab bar, 4 tabs, icons e.g. `LayoutGrid`/`CalendarCheck`/`BriefcaseBusiness`/`Store`).
- Placeholder screens for each tab.
- **Checkpoint:** log in as a vendor → land on the vendor tabs; switch tabs; iOS + Android.

### Phase V1 — Dashboard ("Today")
- `useMyVendor` (getMyVendor, `retry:false`, expose `isVendorMissing` on 404).
- Large-title "Dashboard" with greeting + avatar (→ `account/edit`).
- Summary tiles (published services, needs-action, avg price, profile status + next booking) from vendor/services/bookings queries.
- Needs-action booking preview (tap → `order/[id]`). If no vendor profile yet → onboarding CTA card → Business tab.
- **Checkpoint:** tiles + preview render for a vendor with and without a profile.

### Phase V2 — Bookings & lifecycle
- `orders/index.tsx`: vendor bookings list (`useBookings`, vendor-scoped), status filter chips (All / Needs action / Upcoming / Completed / Cancelled), pagination or incremental load.
- Vendor booking card variant (customer name/email/notes + status badge).
- `order/[id].tsx`: detail with lifecycle actions; extend `bookingStatus.ts` with `getVendorBookingActions` + labels/tones. Cancel opens a reason `Sheet` (reasonText). Each action: confirm alert → haptics → mutate → invalidate `['bookings']`.
- **Checkpoint:** drive a booking confirm → start → complete; try cancel (with reason) and no-show; both simulators.

### Phase V3 — Services CRUD
- Extend `image.ts` with `pickImages({ max })` → `VendorImagePayload[]` (resize/compress ≤2MB, data-URL), reusing the manipulator caveat handling.
- `services/index.tsx`: list (vendor-scoped) with price/duration/photo, Edit + Delete (confirm alert).
- `service/edit.tsx`: create/edit form (name, price, duration, read-only ETB, description, ≤5 photos). `useUpsertService` + `useDeleteService`, invalidate `['services']`.
- **Checkpoint:** create a service (with photos), edit it, delete it; it appears on the customer vendor-detail; both simulators.

### Phase V4 — Business profile (onboarding + edit) & reviews
- `business/index.tsx`: grouped-inset, sectioned form mirroring web — identity, categories, photos (≤5), location (map-link resolve → coords, manual lat/long, description, `VendorMap` preview — remember `[lng, lat]`), working hours (7 rows, enable + times), blackout slots (add/remove). Create vs update via `isVendorMissing`.
- `useUpsertVendor` → invalidate `['vendor','me']` + `['vendors']`.
- Reviews section: `reviewsApi.listByVendor` (read-only, `ReviewItem` + `StarRating`).
- **Checkpoint:** create a profile from scratch, edit it, confirm it shows on customer Explore; both simulators.

### Phase V5 — Polish, parity sweep & QA
- States audit (loading/empty/error), safe areas, keyboard handling, Android hardware back, haptics/motion consistency, 60fps on lists.
- `npx expo lint` + `npx tsc --noEmit` clean; `expo export` sanity.
- Full vendor journey on iOS **and** Android.
- **Checkpoint:** end-to-end vendor journey (onboard → publish service → receive/advance a booking → read reviews) runs cleanly on both.

---

## 5. Design / UX notes (premium Apple feel)
- Each tab is a large-title scroll screen with the frosted tab bar; detail/editor screens push over the tabs (consistent with customer side).
- Prefer **grouped inset lists** for working hours and blackout slots; **bottom sheets** for the service editor and cancel-reason; **segmented control / chips** for booking filters.
- Lifecycle actions get confirm alerts (themed `AlertHost`) + success/impact haptics. Destructive (cancel/no-show/delete) use the destructive tone.
- Reuse the brand `ink / canvas / acid` tokens and existing primitives — no new design system.

## 6. Decisions / open questions
- **4 tabs vs 3:** plan uses 4 (Dashboard/Bookings/Services/Business); account/logout lives behind the Dashboard avatar. Collapse to 3 if the bar feels crowded.
- **Service editor:** full-screen pushed route vs bottom Sheet — leaning pushed route for the photo grid + keyboard room.
- **vendor_staff:** out of this pass (backend `/vendors/me` is `vendor_owner`-only; mobile only registers owners).
- **Multi-image picker** requires the dev-build rebuild for `expo-image-manipulator` (same caveat as avatars); displaying existing images works in Expo Go.

## 7. Definition of done (per phase)
1. `npx expo lint` passes. 2. `npx tsc --noEmit` passes. 3. Checkpoint runs on **both** simulators. 4. New Expo/RN APIs verified against SDK 58 docs. 5. Matches existing conventions (NativeWind, brand tokens, `src/` layout, distinct route segments).
