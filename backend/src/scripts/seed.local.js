require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { connectDb } = require('../config/db');
const { User } = require('../models/User');
const { Vendor } = require('../models/Vendor');
const { Service } = require('../models/Service');
const { Review } = require('../models/Review');

const QA_PASSWORD = 'SlotifyPass123!';

const createSeedVendorImage = ({ title, accent, base }) => {
  const initials = title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="960" height="720" rx="48" fill="url(#bg)" />
      <circle cx="760" cy="140" r="120" fill="rgba(255,255,255,0.12)" />
      <circle cx="180" cy="560" r="180" fill="rgba(255,255,255,0.08)" />
      <text x="72" y="560" fill="#ffffff" font-family="Arial, sans-serif" font-size="88" font-weight="700">${title}</text>
      <text x="72" y="644" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="34">Book trusted local services on Slotify</text>
      <rect x="72" y="72" width="148" height="148" rx="32" fill="rgba(255,255,255,0.16)" />
      <text x="146" y="168" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="700">${initials}</text>
    </svg>
  `;

  return {
    data: Buffer.from(svg),
    contentType: 'image/svg+xml',
  };
};

const createWorkingHours = ({ saturday = false } = {}) => [
  { dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 6, isEnabled: saturday, startTime: '10:00', endTime: '16:00' },
];

const createBlackoutSlot = (date, startTime, endTime, label) => ({
  date,
  startTime,
  endTime,
  label,
});

const userFixtures = [
  {
    key: 'admin',
    email: 'admin@slotify.local',
    firstName: 'Aster',
    lastName: 'Admin',
    role: 'admin',
  },
  {
    key: 'customer',
    email: 'customer@slotify.local',
    firstName: 'Kaleb',
    lastName: 'Customer',
    role: 'customer',
  },
  {
    key: 'vendorOwner1',
    email: 'owner.one@slotify.local',
    firstName: 'Marta',
    lastName: 'Tesfaye',
    role: 'vendor_owner',
  },
  {
    key: 'vendorOwner2',
    email: 'owner.two@slotify.local',
    firstName: 'Bereket',
    lastName: 'Hailu',
    role: 'vendor_owner',
  },
  {
    key: 'vendorOwner3',
    email: 'owner.three@slotify.local',
    firstName: 'Ruth',
    lastName: 'Bekele',
    role: 'vendor_owner',
  },
  {
    key: 'vendorOwner4',
    email: 'owner.four@slotify.local',
    firstName: 'Samuel',
    lastName: 'Worku',
    role: 'vendor_owner',
  },
  {
    key: 'vendorOwner5',
    email: 'owner.five@slotify.local',
    firstName: 'Liya',
    lastName: 'Hailemariam',
    role: 'vendor_owner',
  },
  {
    key: 'vendorOwner6',
    email: 'owner.six@slotify.local',
    firstName: 'Nathan',
    lastName: 'Gebru',
    role: 'vendor_owner',
  },
];

const vendorFixtures = [
  {
    key: 'vendorA',
    ownerKey: 'vendorOwner1',
    displayName: 'Addis Grooming Studio',
    legalBusinessName: 'Addis Grooming Studio PLC',
    description:
      'Premium barbershop and grooming services in central Addis with fast booking and reliable staff.',
    categories: ['Barber', 'Grooming'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Addis Ababa',
      addressLine1: 'Bole Road',
      addressLine2: 'Near Edna Mall',
      description: 'Second floor, opposite the west parking entrance.',
      coordinates: [38.7924, 8.995],
    },
    workingHours: createWorkingHours({ saturday: true }),
    blackoutSlots: [createBlackoutSlot('2026-03-18', '13:00', '15:00', 'Team training block')],
    image: createSeedVendorImage({
      title: 'Addis Grooming Studio',
      accent: '#0f766e',
      base: '#134e4a',
    }),
    status: 'active',
  },
  {
    key: 'vendorB',
    ownerKey: 'vendorOwner2',
    displayName: 'Sheba Beauty Lounge',
    legalBusinessName: 'Sheba Beauty Lounge',
    description:
      'Beauty and wellness services for daily care, events, and corporate clients.',
    categories: ['Beauty', 'Spa'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Addis Ababa',
      addressLine1: 'Kazanchis',
      addressLine2: 'Near Hilton',
      description: 'Lobby level, next to the coffee bar.',
      coordinates: [38.7596, 9.0192],
    },
    workingHours: createWorkingHours({ saturday: true }),
    blackoutSlots: [createBlackoutSlot('2026-03-20', '11:00', '13:30', 'Private bridal booking')],
    image: createSeedVendorImage({
      title: 'Sheba Beauty Lounge',
      accent: '#be185d',
      base: '#831843',
    }),
    status: 'active',
  },
  {
    key: 'vendorC',
    ownerKey: 'vendorOwner3',
    displayName: 'Mekelle Glow Hub',
    legalBusinessName: 'Mekelle Glow Hub',
    description: 'Growing beauty brand preparing for verification and launch.',
    categories: ['Beauty'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Mekelle',
      addressLine1: 'Hawelti',
      addressLine2: 'Main Avenue',
      description: 'Ground floor studio beside the main avenue corner.',
      coordinates: [39.4753, 13.4967],
    },
    workingHours: createWorkingHours(),
    blackoutSlots: [],
    image: createSeedVendorImage({
      title: 'Mekelle Glow Hub',
      accent: '#9333ea',
      base: '#5b21b6',
    }),
    status: 'pending_verification',
  },
  {
    key: 'vendorD',
    ownerKey: 'vendorOwner4',
    displayName: 'Bole Wellness House',
    legalBusinessName: 'Bole Wellness House PLC',
    description:
      'Massage, skin care, and recovery-focused treatments in a calm modern studio.',
    categories: ['Spa', 'Wellness'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Addis Ababa',
      addressLine1: 'Bole Medhanialem',
      addressLine2: 'Behind Friendship Mall',
      description: 'Quiet courtyard entrance with on-site parking.',
      coordinates: [38.7872, 8.9984],
    },
    workingHours: createWorkingHours({ saturday: true }),
    blackoutSlots: [createBlackoutSlot('2026-03-22', '09:00', '12:00', 'Equipment maintenance')],
    image: createSeedVendorImage({
      title: 'Bole Wellness House',
      accent: '#0284c7',
      base: '#075985',
    }),
    status: 'active',
  },
  {
    key: 'vendorE',
    ownerKey: 'vendorOwner5',
    displayName: 'Piazza Legal Desk',
    legalBusinessName: 'Piazza Legal Desk',
    description:
      'Accessible legal consultation for documentation, compliance, and startup advisory.',
    categories: ['Legal', 'Consulting'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Addis Ababa',
      addressLine1: 'Piazza',
      addressLine2: 'Arada District',
      description: 'Suite 4, above the stationery store on the main road.',
      coordinates: [38.7469, 9.0392],
    },
    workingHours: createWorkingHours(),
    blackoutSlots: [createBlackoutSlot('2026-03-19', '14:00', '16:00', 'Court filing window')],
    image: createSeedVendorImage({
      title: 'Piazza Legal Desk',
      accent: '#b45309',
      base: '#78350f',
    }),
    status: 'active',
  },
  {
    key: 'vendorF',
    ownerKey: 'vendorOwner6',
    displayName: 'Sarbet Photo Atelier',
    legalBusinessName: 'Sarbet Photo Atelier',
    description:
      'Portrait, event, and brand photography with guided styling and quick delivery.',
    categories: ['Photography', 'Creative'],
    timezone: 'Africa/Addis_Ababa',
    location: {
      countryCode: 'ET',
      city: 'Addis Ababa',
      addressLine1: 'Sarbet',
      addressLine2: 'Near main square',
      description: 'Top floor studio with elevator access.',
      coordinates: [38.7524, 8.9808],
    },
    workingHours: createWorkingHours({ saturday: true }),
    blackoutSlots: [createBlackoutSlot('2026-03-21', '15:00', '18:00', 'On-location shoot')],
    image: createSeedVendorImage({
      title: 'Sarbet Photo Atelier',
      accent: '#ea580c',
      base: '#9a3412',
    }),
    status: 'active',
  },
];

const serviceFixturesByVendor = {
  vendorA: [
    {
      name: 'Classic Haircut',
      description: 'A clean and modern haircut tailored to your style.',
      durationMinutes: 45,
      priceAmount: 450,
      currency: 'ETB',
      depositType: 'none',
      depositValue: 0,
    },
    {
      name: 'Haircut + Beard Trim',
      description: 'Full grooming package with beard shaping.',
      durationMinutes: 60,
      priceAmount: 700,
      currency: 'ETB',
      depositType: 'fixed',
      depositValue: 200,
    },
  ],
  vendorB: [
    {
      name: 'Express Facial',
      description: 'Quick skin-refresh facial for everyday care.',
      durationMinutes: 40,
      priceAmount: 800,
      currency: 'ETB',
      depositType: 'percentage',
      depositValue: 20,
    },
    {
      name: 'Bridal Makeup Session',
      description: 'Event-focused makeup session with consultation.',
      durationMinutes: 120,
      priceAmount: 2800,
      currency: 'ETB',
      depositType: 'fixed',
      depositValue: 800,
    },
  ],
  vendorD: [
    {
      name: 'Deep Tissue Massage',
      description: 'Recovery-focused massage session for tension release and mobility.',
      durationMinutes: 75,
      priceAmount: 1600,
      currency: 'ETB',
      depositType: 'percentage',
      depositValue: 25,
    },
    {
      name: 'Glow Facial Ritual',
      description: 'Multi-step facial for hydration, exfoliation, and brightening.',
      durationMinutes: 60,
      priceAmount: 1400,
      currency: 'ETB',
      depositType: 'none',
      depositValue: 0,
    },
  ],
  vendorE: [
    {
      name: 'Contract Review Session',
      description: 'A focused consultation to review agreements and identify key risks.',
      durationMinutes: 50,
      priceAmount: 2200,
      currency: 'ETB',
      depositType: 'fixed',
      depositValue: 600,
    },
    {
      name: 'Business Registration Guidance',
      description: 'Step-by-step advisory for startup registration and compliance setup.',
      durationMinutes: 90,
      priceAmount: 3200,
      currency: 'ETB',
      depositType: 'fixed',
      depositValue: 1000,
    },
  ],
  vendorF: [
    {
      name: 'Portrait Session',
      description: 'Guided studio portraits with light retouching and delivery.',
      durationMinutes: 60,
      priceAmount: 1800,
      currency: 'ETB',
      depositType: 'percentage',
      depositValue: 30,
    },
    {
      name: 'Event Coverage',
      description: 'Short-format event photography for celebrations and launches.',
      durationMinutes: 180,
      priceAmount: 6500,
      currency: 'ETB',
      depositType: 'fixed',
      depositValue: 2000,
    },
  ],
};

const reviewFixturesByVendor = {
  vendorA: [
    { rating: 5, comment: 'Professional team and very clean studio.' },
    { rating: 4, comment: 'Great service and easy scheduling.' },
  ],
  vendorB: [
    { rating: 5, comment: 'Loved the service quality and punctuality.' },
    { rating: 4, comment: 'Friendly staff and excellent results.' },
  ],
  vendorD: [
    { rating: 5, comment: 'Relaxing atmosphere and excellent massage technique.' },
    { rating: 5, comment: 'Clean space, punctual team, and great facial service.' },
  ],
  vendorE: [
    { rating: 4, comment: 'Clear legal advice and very practical next steps.' },
    { rating: 5, comment: 'Professional consultation with strong follow-through.' },
  ],
  vendorF: [
    { rating: 5, comment: 'Great direction during the shoot and beautiful final photos.' },
    { rating: 4, comment: 'Fast delivery and a smooth studio experience.' },
  ],
};

const upsertUsers = async () => {
  const passwordHash = await bcrypt.hash(QA_PASSWORD, 12);
  const usersByKey = {};

  for (const fixture of userFixtures) {
    const doc = await User.findOneAndUpdate(
      { email: fixture.email },
      {
        $set: {
          email: fixture.email,
          provider: 'local',
          passwordHash,
          firstName: fixture.firstName,
          lastName: fixture.lastName,
          role: fixture.role,
          status: 'active',
          deletedAt: null,
          emailVerifiedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    usersByKey[fixture.key] = doc;
  }

  return usersByKey;
};

const upsertVendors = async (usersByKey) => {
  const vendorsByKey = {};

  for (const fixture of vendorFixtures) {
    const ownerUser = usersByKey[fixture.ownerKey];

    const doc = await Vendor.findOneAndUpdate(
      { ownerUserId: ownerUser._id },
      {
        $set: {
          ownerUserId: ownerUser._id,
          displayName: fixture.displayName,
          image: fixture.image,
          legalBusinessName: fixture.legalBusinessName,
          description: fixture.description,
          workingHours: fixture.workingHours,
          blackoutSlots: fixture.blackoutSlots,
          categories: fixture.categories,
          timezone: fixture.timezone,
          location: {
            countryCode: fixture.location.countryCode,
            city: fixture.location.city,
            addressLine1: fixture.location.addressLine1,
            addressLine2: fixture.location.addressLine2,
            description: fixture.location.description,
            coordinates: {
              type: 'Point',
              coordinates: fixture.location.coordinates,
            },
          },
          status: fixture.status,
          deletedAt: null,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    vendorsByKey[fixture.key] = doc;
  }

  return vendorsByKey;
};

const resetAndSeedServices = async (vendorsByKey) => {
  const serviceVendorKeys = Object.keys(serviceFixturesByVendor);
  const activeVendorIds = serviceVendorKeys.map((key) => vendorsByKey[key]._id);

  await Service.deleteMany({ vendorId: { $in: activeVendorIds } });

  const docs = [];
  for (const [vendorKey, fixtures] of Object.entries(serviceFixturesByVendor)) {
    const vendor = vendorsByKey[vendorKey];

    for (const fixture of fixtures) {
      docs.push({
        vendorId: vendor._id,
        name: fixture.name,
        description: fixture.description,
        durationMinutes: fixture.durationMinutes,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        priceAmount: fixture.priceAmount,
        currency: fixture.currency,
        depositType: fixture.depositType,
        depositValue: fixture.depositValue,
        isActive: true,
      });
    }
  }

  if (docs.length > 0) {
    await Service.insertMany(docs);
  }
};

const resetAndSeedReviews = async (vendorsByKey, usersByKey) => {
  const customer = usersByKey.customer;
  const reviewVendorKeys = Object.keys(reviewFixturesByVendor);
  const activeVendorIds = reviewVendorKeys.map((key) => vendorsByKey[key]._id);

  await Review.deleteMany({ vendorId: { $in: activeVendorIds } });

  const docs = [];
  for (const [vendorKey, fixtures] of Object.entries(reviewFixturesByVendor)) {
    const vendor = vendorsByKey[vendorKey];

    for (const fixture of fixtures) {
      docs.push({
        bookingId: new mongoose.Types.ObjectId(),
        customerUserId: customer._id,
        vendorId: vendor._id,
        staffId: null,
        rating: fixture.rating,
        comment: fixture.comment,
        status: 'published',
      });
    }
  }

  if (docs.length > 0) {
    await Review.insertMany(docs);
  }
};

const recalculateVendorRatings = async (vendorsByKey) => {
  const vendorIds = Object.values(vendorsByKey).map((vendor) => vendor._id);
  const reviews = await Review.find({
    vendorId: { $in: vendorIds },
    status: 'published',
  })
    .select({ vendorId: 1, rating: 1 })
    .lean();

  const totals = new Map();
  for (const review of reviews) {
    const key = String(review.vendorId);
    const item = totals.get(key) || { count: 0, sum: 0 };
    item.count += 1;
    item.sum += review.rating;
    totals.set(key, item);
  }

  for (const vendor of Object.values(vendorsByKey)) {
    const key = String(vendor._id);
    const item = totals.get(key);
    const reviewCount = item ? item.count : 0;
    const averageRating = item ? Math.round((item.sum / item.count) * 10) / 10 : 0;

    await Vendor.updateOne(
      { _id: vendor._id },
      {
        $set: {
          reviewCount,
          averageRating,
        },
      }
    );
  }
};

const printSummary = async () => {
  const [userCount, vendorCount, serviceCount, reviewCount] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    Vendor.countDocuments({ deletedAt: null }),
    Service.countDocuments({ deletedAt: null }),
    Review.countDocuments({}),
  ]);

  console.log('');
  console.log('Seed completed successfully.');
  console.log(`Users: ${userCount}`);
  console.log(`Vendors: ${vendorCount}`);
  console.log(`Services: ${serviceCount}`);
  console.log(`Reviews: ${reviewCount}`);
  console.log('');
  console.log('Test credentials (local):');
  console.log(`- admin@slotify.local / ${QA_PASSWORD} (admin)`);
  console.log(`- customer@slotify.local / ${QA_PASSWORD} (customer)`);
  console.log(`- owner.one@slotify.local / ${QA_PASSWORD} (vendor_owner)`);
  console.log(`- owner.two@slotify.local / ${QA_PASSWORD} (vendor_owner)`);
  console.log(`- owner.four@slotify.local / ${QA_PASSWORD} (vendor_owner)`);
  console.log(`- owner.five@slotify.local / ${QA_PASSWORD} (vendor_owner)`);
  console.log(`- owner.six@slotify.local / ${QA_PASSWORD} (vendor_owner)`);
};

const run = async () => {
  try {
    await connectDb();

    const usersByKey = await upsertUsers();
    const vendorsByKey = await upsertVendors(usersByKey);
    await resetAndSeedServices(vendorsByKey);
    await resetAndSeedReviews(vendorsByKey, usersByKey);
    await recalculateVendorRatings(vendorsByKey);
    await printSummary();
  } catch (error) {
    console.error('Local seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void run();
