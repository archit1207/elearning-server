import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please Login" });
    }

    const token = authHeader.split(" ")[1];

    const decodedData = jwt.verify(token, process.env.JWT_Secret);

    req.user = await User.findById(decodedData._id).select("-password");

    next();
  } catch (error) {
    return res.status(500).json({ message: "Token Expired, Please Login Again" });
  }
};

export const isAdmin = (req, res, next) => {
  try{
    if(req.user.role !== "admin")
      return res.status(403).json({
        message: "YOU ARE NOT ADMIN"
    });

    next();
  } catch(error) {
    res.status(500).json({
      message: error.message,
    });
  }
}