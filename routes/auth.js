const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const jwt = require("jsonwebtoken");
const JWT_SECRET = "Harryisagood$boy";
const fetchuser=require('../middleware/fetchuser');
//Route 1:  Create a user using: POST "/api/auth".
router.post(
  "/createuser",
  [
    // Express Validator Middleware
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    let success=false;
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    // No validation errors, proceed to create a user
    try {
      // Hash the password using bcryptjs
      const salt = await bcrypt.genSalt(10); // You can adjust the salt rounds as needed
      req.body.password = await bcrypt.hash(req.body.password, salt);

      const user = new User(req.body);
      await user.save();
      const data ={
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authtoken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
//Route 2:Authenticate a User using:POST "/api/auth/login.No login required"

router.post(
  "/login",
  [
    // Express Validator Middleware
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credentials" });
      }
      const passwordcom = await bcrypt.compare(password, user.password);
      if (!passwordcom) {
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authtoken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 3: Authenticate a User using:POST "/api/auth/getuser".Login required
router.post("/getuser", fetchuser,async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId }).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
