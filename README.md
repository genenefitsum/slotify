# Slotify

Appointment booking where the database, not the application, guarantees one winner per slot.

Live demo: https://slotify-online.vercel.app

Personal project built January to March 2026. No production users.

## No double bookings

Checking availability and then inserting a booking leaves a window where two
requests can both pass the check. Instead, confirming a booking writes a
uniqueness-constrained lock for that exact vendor and time, so the database
decides. If two people confirm the same slot at once, only one write succeeds.
The other person is told the slot is unavailable and picks another time.

The tradeoff is a worse moment for the loser, who finds out after confirming
rather than never being shown the slot. In exchange, silent double-booking is
impossible. Locks release on cancellation, completion or no-show.

## Availability

Vendors set a weekly template plus single-date blackouts, not recurrence rules.
An annual holiday must be re-entered each year, and a lunch break has to be
carved out as a blackout in the middle of the day.

## Timezones

Everything is pinned to Africa/Addis_Ababa, and local time converts to UTC with
a fixed minus three offset. That is correct only because Ethiopia is permanently
UTC+3 with no daylight saving. It breaks in any DST zone. This is a deliberate
shortcut scoped to one market.

## Stack

MongoDB, Express, React, Node
