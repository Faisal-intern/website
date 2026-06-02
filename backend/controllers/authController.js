const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const login = async (req, res) => {
  try {
    console.log('Login function called');
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let user = await User.findOne({ email });
    
    // If user not found and email looks like a roll number, try student email format
    if (!user && /^\d+$/.test(email)) {
      const studentEmail = `${email}@student.com`;
      console.log('Trying student email format:', studentEmail);
      user = await User.findOne({ email: studentEmail });
    }

    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (isMatch) {
      // Include student-specific info in token if role is student
      const tokenPayload = { id: user._id, role: user.role };
      
      if (user.role === 'student') {
        const Result = require('../models/Result');
        const studentResult = await Result.findOne({ student: user._id });
        if (studentResult) {
          tokenPayload.rollNo = studentResult.rollNo;
          tokenPayload.enrolmentNo = studentResult.enrolmentNo;
        }
      }

      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '30d' }),
      };
      console.log('Login successful:', response);
      res.json(response);
    } else {
      console.log('Invalid password');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Add dummy users for testing
const addDummyUsers = async () => {
  try {
    console.log('Adding dummy users...');
    const users = [
      {
        name: 'Admin User',
        email: 'admin@asssr',
        password: 'admin',
        role: 'admin',
      },
      {
        name: 'Teacher User',
        email: 'teacher',
        password: 'teacher',
        role: 'teacher',
      },
      {
        name: 'Student User',
        email: 'student',
        password: 'student',
        role: 'student',
        dateOfBirth: new Date('2000-01-01'),
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }
    console.log('Dummy users created successfully');
  } catch (error) {
    console.error('Error creating dummy users:', error);
  }
};

module.exports = { login, addDummyUsers }; 