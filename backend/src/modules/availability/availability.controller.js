const { listAvailableSlotsByVendorService } = require('./availability.service');
const { validateListSlotsQuery } = require('./availability.validator');

const listSlots = async (req, res, next) => {
	try {
		const query = validateListSlotsQuery(req.query || {});
		const data = await listAvailableSlotsByVendorService(query);
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	listSlots,
};
