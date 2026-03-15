require('dotenv').config();

const { connectDb } = require('../config/db');
const { User } = require('../models/User');

const main = async () => {
  const emailArg = process.argv[2];
  const email = String(emailArg || '').trim().toLowerCase();

  if (!email) {
    throw new Error('Usage: npm run promote:admin -- user@example.com');
  }

  await connectDb();

  const user = await User.findOne({ email, deletedAt: null });
  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  user.role = 'admin';

  if (user.status !== 'active') {
    user.status = 'active';
  }

  await user.save();

  console.log(`Promoted ${email} to admin successfully.`);
  process.exit(0);
};

main().catch((error) => {
  console.error(error.message || 'Failed to promote user to admin.');
  process.exit(1);
});