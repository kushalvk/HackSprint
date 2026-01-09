const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { email, firstName, lastName, username, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ email, firstName, lastName, username, password, role });
    await user.save();
    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
};
