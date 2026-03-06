const getCurrentUser = (req, res) => {
  res.json({ id: "me" });
};

module.exports = { getCurrentUser };
