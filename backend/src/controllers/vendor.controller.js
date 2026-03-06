const listVendors = (req, res) => {
  res.json([]);
};

const getVendorById = (req, res) => {
  res.json({ id: req.params.id });
};

module.exports = { listVendors, getVendorById };
