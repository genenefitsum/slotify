require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { connectDb } = require('../config/db');
const { User } = require('../models/User');
const { Vendor } = require('../models/Vendor');

const QA_PASSWORD = 'SlotifyPass123!';

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');

const createWorkingHours = ({ saturday = false } = {}) => [
  { dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 6, isEnabled: saturday, startTime: '10:00', endTime: '16:00' },
];

const vendorFixtures = [
  {
    owner: {
      email: 'owner.one@slotify.seed',
      firstName: 'Marta',
      lastName: 'Tesfaye',
    },
    vendor: {
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
        coordinates: { type: 'Point', coordinates: [38.7924, 8.995] },
      },
      workingHours: createWorkingHours({ saturday: true }),
      status: 'active',
    },
  },
  {
    owner: {
      email: 'owner.two@slotify.seed',
      firstName: 'Bereket',
      lastName: 'Hailu',
    },
    vendor: {
      displayName: 'Sheba Beauty Lounge',
      legalBusinessName: 'Sheba Beauty Lounge',
      description: 'Beauty and wellness services for daily care, events, and corporate clients.',
      categories: ['Beauty', 'Spa'],
      timezone: 'Africa/Addis_Ababa',
      location: {
        countryCode: 'ET',
        city: 'Addis Ababa',
        addressLine1: 'Kazanchis',
        addressLine2: 'Near Hilton',
        description: 'Lobby level, next to the coffee bar.',
        coordinates: { type: 'Point', coordinates: [38.7596, 9.0192] },
      },
      workingHours: createWorkingHours({ saturday: true }),
      status: 'active',
    },
  },
  {
    owner: {
      email: 'owner.three@slotify.seed',
      firstName: 'Ruth',
      lastName: 'Bekele',
    },
    vendor: {
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
        coordinates: { type: 'Point', coordinates: [39.4753, 13.4967] },
      },
      workingHours: createWorkingHours(),
      status: 'pending_verification',
    },
  },
  {
    owner: {
      email: 'owner.four@slotify.seed',
      firstName: 'Samuel',
      lastName: 'Worku',
    },
    vendor: {
      displayName: 'Bole Wellness House',
      legalBusinessName: 'Bole Wellness House PLC',
      description: 'Massage, skin care, and recovery-focused treatments in a calm modern studio.',
      categories: ['Spa', 'Wellness'],
      timezone: 'Africa/Addis_Ababa',
      location: {
        countryCode: 'ET',
        city: 'Addis Ababa',
        addressLine1: 'Bole Medhanialem',
        addressLine2: 'Behind Friendship Mall',
        description: 'Quiet courtyard entrance with on-site parking.',
        coordinates: { type: 'Point', coordinates: [38.7872, 8.9984] },
      },
      workingHours: createWorkingHours({ saturday: true }),
      status: 'active',
    },
  },
  {
    owner: {
      email: 'owner.five@slotify.seed',
      firstName: 'Liya',
      lastName: 'Hailemariam',
    },
    vendor: {
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
        coordinates: { type: 'Point', coordinates: [38.7469, 9.0392] },
      },
      workingHours: createWorkingHours(),
      status: 'active',
    },
  },
  {
    owner: {
      email: 'owner.six@slotify.seed',
      firstName: 'Nathan',
      lastName: 'Gebru',
    },
    vendor: {
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
        coordinates: { type: 'Point', coordinates: [38.7524, 8.9808] },
      },
      workingHours: createWorkingHours({ saturday: true }),
      status: 'active',
    },
  },
];

const upsertVendorOwner = async (owner, passwordHash) => {
  const email = owner.email.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (!existing) {
    return User.create({
      email,
      provider: 'local',
      passwordHash,
      firstName: owner.firstName,
      lastName: owner.lastName,
      role: 'vendor_owner',
      status: 'active',
    });
  }

  existing.firstName = owner.firstName;
  existing.lastName = owner.lastName;
  existing.role = 'vendor_owner';
  existing.status = 'active';

  if (!existing.passwordHash) {
    existing.provider = 'local';
    existing.passwordHash = passwordHash;
  }

  await existing.save();
  return existing;
};

const upsertVendor = async (ownerUserId, vendorData) => {
  const existing = await Vendor.findOne({ ownerUserId });

  if (!existing) {
    return Vendor.create({
      ownerUserId,
      ...vendorData,
    });
  }

  Object.assign(existing, vendorData);
  await existing.save();
  return existing;
};

const run = async () => {
  await connectDb();

  if (!shouldApply) {
    console.log('Preview mode only. No writes performed.');
    console.log(`Would seed ${vendorFixtures.length} vendors and ${vendorFixtures.length} vendor owners.`);
    console.log('Run with --apply to execute writes: npm run seed:vendors -- --apply');
    return;
  }

  const passwordHash = await bcrypt.hash(QA_PASSWORD, 12);

  let createdOwners = 0;
  let createdVendors = 0;

  for (const fixture of vendorFixtures) {
    const ownerBefore = await User.findOne({ email: fixture.owner.email.toLowerCase().trim() }).lean();
    const owner = await upsertVendorOwner(fixture.owner, passwordHash);
    if (!ownerBefore) {
      createdOwners += 1;
    }

    const vendorBefore = await Vendor.findOne({ ownerUserId: owner._id }).lean();
    await upsertVendor(owner._id, fixture.vendor);
    if (!vendorBefore) {
      createdVendors += 1;
    }
  }

  console.log('Vendor seed completed.');
  console.table({
    ownerUsersProcessed: vendorFixtures.length,
    ownerUsersCreated: createdOwners,
    vendorsProcessed: vendorFixtures.length,
    vendorsCreated: createdVendors,
    loginPasswordForSeedOwners: QA_PASSWORD,
  });
};

run()
  .catch((error) => {
    console.error('Vendor seed failed.');
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // no-op
    }
  });
