import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isAuth = async (req, res, next) => {
  try {
    // Read token from Authorization header OR cookies
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Please Login" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token Expired, Please Login Again" });
    }

    const userId = decoded.id || decoded._id || decoded.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "YOU ARE NOT ADMIN"
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}