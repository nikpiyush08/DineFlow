const User = require('../models/User'); // Adjust path if your models folder is elsewhere
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new Restaurant Owner
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create and save the new user
    user = new User({ 
      name, 
      email, 
      passwordHash, 
      role: 'owner' // Defaulting to owner for the MVP
    });
    
    await user.save();
    res.status(201).json({ message: 'Owner registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Log in an existing User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a secure token valid for 7 days
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role, email: user.email } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};