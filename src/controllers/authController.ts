import { NextFunction, Request, Response } from "express";
import { RegisterRequest, LoginRequest } from "../types/authReq";
import logger from "../middlewares/logger";
import { APIError } from "../types/apiError";
import { prisma } from "../configs/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../helpers/genrateToken";

export const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response, next : NextFunction) => {
  logger.info("Registering user...");
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw new APIError("All fields are required", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      logger.warn(`User with email ${email} already exists`);
      throw new APIError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    if (!newUser) {
      logger.error("User registration failed");
      throw new APIError("User registration failed", 500);
    }
    logger.info(`User registered successfully: ${newUser.email}`);
    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
    } catch (error) {
      next(error);
    }
}

export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
  logger.info("Logging in user...");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn("Email and password are required");
      throw new APIError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      logger.warn(`User with email ${email} not found`);
      throw new APIError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn("Invalid password");
      throw new APIError("Invalid password", 401);
    }
    const token = generateToken(user.id, user.role);
    logger.info(`User logged in successfully: ${user.email}`);
    res.status(200).json({ 
      success: true,
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
}