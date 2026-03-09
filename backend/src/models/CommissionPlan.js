const mongoose = require('mongoose');

const COMMISSION_TYPES = ['percentage', 'fixed'];

const commissionPlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 80,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    type: {
      type: String,
      enum: COMMISSION_TYPES,
      required: true,
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxFeeAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    activeFrom: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    activeTo: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commissionPlanSchema.path('value').validate(function validatePlanValue(value) {
  if (this.type === 'percentage') {
    return value > 0 && value <= 100;
  }

  return value >= 0;
}, 'Commission plan value is invalid for selected type.');

commissionPlanSchema.path('activeTo').validate(function validateDates(value) {
  if (!value) {
    return true;
  }

  return value > this.activeFrom;
}, 'Commission activeTo must be later than activeFrom.');

commissionPlanSchema.index(
  { isDefault: 1 },
  { partialFilterExpression: { isDefault: true }, unique: true }
);

const CommissionPlan =
  mongoose.models.CommissionPlan || mongoose.model('CommissionPlan', commissionPlanSchema);

module.exports = {
  CommissionPlan,
  COMMISSION_TYPES,
};
