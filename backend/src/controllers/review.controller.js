const listReviews = (req, res) => {
  res.json([]);
};

const createReview = (req, res) => {
  res.status(201).json({ message: "Review created" });
};

module.exports = { listReviews, createReview };
