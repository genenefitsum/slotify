const mongoose = require('mongoose');

const DEPOSIT_TYPES = ['none', 'fixed', 'percentage'];
const serviceImageSchema = new mongoose.Schema(
	{
		data: Buffer,
		contentType: String,
		publicId: String,
		secureUrl: String,
	},
	{
		_id: false,
	}
);

const serviceSchema = new mongoose.Schema(
	{
		vendorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Vendor',
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 140,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 2000,
		},
		durationMinutes: {
			type: Number,
			required: true,
			min: 5,
			max: 1440,
		},
		bufferBeforeMinutes: {
			type: Number,
			default: 0,
			min: 0,
			max: 240,
		},
		bufferAfterMinutes: {
			type: Number,
			default: 0,
			min: 0,
			max: 240,
		},
		priceAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			required: true,
			uppercase: true,
			minlength: 3,
			maxlength: 3,
		},
		depositType: {
			type: String,
			enum: DEPOSIT_TYPES,
			default: 'none',
		},
		depositValue: {
			type: Number,
			default: 0,
			min: 0,
		},
		images: {
			type: [serviceImageSchema],
			default: [],
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		deletedAt: {
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

serviceSchema.path('depositValue').validate(function validateDeposit(value) {
	if (this.depositType === 'none') {
		return value === 0;
	}

	if (this.depositType === 'percentage') {
		return value > 0 && value <= 100;
	}

	if (this.depositType === 'fixed') {
		return value <= this.priceAmount;
	}

	return false;
}, 'Invalid deposit configuration for service.');

serviceSchema.index({ vendorId: 1, isActive: 1, name: 1 });

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

module.exports = {
	Service,
	DEPOSIT_TYPES,
};
