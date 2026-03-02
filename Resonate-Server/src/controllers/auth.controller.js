import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // matches cookie maxAge (7 days)
  });
};

const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};


export const registerUser = async (req, res) => {
  try {
    const { uid, email, name: tokenName } = req.user;
    const {
      dateOfBirth,
      weightKg,
      goals,
      phone,
      gender,
      heightCm,
      dietType,
      hasMedicalCondition,
      medicalConditions,
      menstrualProfile,
      name
    } = req.body;

    const existingUser = await User.findOne({ firebaseUid: uid });
    if (existingUser) {
      return res.json({ message: "User already registered!" });
    }

    const user = await User.create({
      firebaseUid: uid,
      email,
      name: name || tokenName,
      phone,
      dateOfBirth,
      weightKg,
      goals,
      gender,
      heightCm,
      dietType,
      hasMedicalCondition,
      medicalConditions,
      menstrualProfile
    });

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.json({ message: "User Registered", user, isAdmin: user.role === "admin" });

  } catch (error) {
    logger.error("Auth", "registerUser error", { error: error.message });
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // isAdmin flag lets the client gate admin UI without hardcoding email in the JS bundle
    return res.json({ message: "Login Success", user, isAdmin: user.role === "admin" });

  } catch (error) {
    logger.error("Auth", "loginUser error", { error: error.message });
    return res.status(500).json({ error: "Internal server error" });
  }
};
