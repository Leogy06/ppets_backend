import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import express, { Request } from "express";

configDotenv();

const secret_token = process.env.JWT_SECRET;

if (!secret_token) {
  throw new Error(
    "JWT_SECRET token is not defined in the environment variables"
  );
}

interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  is_active: number;
  role: number;
}
export const generateToken = (user: Partial<User>) => {
  return jwt.sign({ id: user.id, username: user.username }, secret_token, {
    expiresIn: "8h",
  });
};

export interface CustomRequest extends Request {
  user?: any;
}

export const protectRoute = (
  req: CustomRequest,
  res: express.Response,
  next: express.NextFunction
): any => {
  const token = req.cookies.accessToken;

  console.log("token: ", token);

  if (!token) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const decoded = jwt.verify(token, secret_token) as jwt.JwtPayload; // Use access token secret

    // Convert expiration to milliseconds
    const expirationTime = decoded.exp ? decoded.exp * 1000 : 0;

    const today = new Date().getTime();

    if (expirationTime < today) {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }

    req.user = decoded; // Store user data for later use
    next();
  } catch (error) {
    res.status(403).json({
      message: "Session expired or Invalid Token, Login Again.",
      error,
    });
  }
};
