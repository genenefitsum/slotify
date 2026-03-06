const listBookings = (req, res) => {
  res.json([]);
};

const createBooking = (req, res) => {
  res.status(201).json({ message: "Booking created" });
};

module.exports = { listBookings, createBooking };
