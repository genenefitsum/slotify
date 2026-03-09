const mongoose = require('mongoose');

const RULE_TARGET_TYPES = ['vendor', 'staff'];

const availabilityRuleSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: RULE_TARGET_TYPES,
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      maxlength: 80,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      index: true,
    },
    startMinuteOfDay: {
      type: Number,
      required: true,
      min: 0,
      max: 1439,
    },
    endMinuteOfDay: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },
    isBlackout: {
      type: Boolean,
      default: false,
      index: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      index: true,
    },
    effectiveTo: {
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

availabilityRuleSchema.path('endMinuteOfDay').validate(function validateRange(value) {
  return value > this.startMinuteOfDay;
}, 'Availability end minute must be greater than start minute.');

availabilityRuleSchema.path('effectiveTo').validate(function validateDates(value) {
  if (!value) {
    return true;
  }

  return value > this.effectiveFrom;
}, 'Availability effectiveTo must be later than effectiveFrom.');

availabilityRuleSchema.index({
  vendorId: 1,
  targetType: 1,
  targetId: 1,
  dayOfWeek: 1,
  effectiveFrom: 1,
  effectiveTo: 1,
});

const AvailabilityRule =
  mongoose.models.AvailabilityRule ||
  mongoose.model('AvailabilityRule', availabilityRuleSchema);

module.exports = {
  AvailabilityRule,
  RULE_TARGET_TYPES,
};
