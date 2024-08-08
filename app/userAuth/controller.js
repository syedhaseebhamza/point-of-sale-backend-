require("dotenv").config();
const User = require("./model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// async function signUp(req, res) {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, password: hashedPassword });
//     await newUser.save();
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

module.exports = { login };
