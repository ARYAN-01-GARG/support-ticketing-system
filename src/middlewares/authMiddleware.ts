/// <reference types="../types/express" />
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";
import { APIError } from "../types/apiError";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info("Verifying authentication...");
  try {
    const token = req.cookies.token;
    // const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      logger.warn("No token provided");
      throw new APIError("No token provided", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT secret is not defined");
      throw new APIError("Internal server error", 500);
    }

    const user = jwt.verify(token, secret) as { userId: string; role: "customer" | "admin" | "agent" };
    if (!user) {
      logger.warn("Invalid token");
      throw new APIError("Invalid token", 401);
    }

    logger.info("User authenticated:", user);
    req.user = { userId: user.userId, role: user.role }; 

    next();
  } catch (error) {
    next(error);
  }
}

export const verifyRole = (role: ("customer" | "admin" | "agent")) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole) {
      logger.warn("User role not found");
      res.status(403).send("User role not found");
      return;
    }
    if (userRole !== role) {
      logger.warn(`Forbidden: User role ${userRole} does not match required role ${role}`);
      res.status(403).send("Forbidden");
      return;
    }
    next();
  };
};
