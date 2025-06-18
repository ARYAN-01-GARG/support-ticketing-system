import { NextFunction, Request, Response } from "express";
import { RegisterRequest, LoginRequest } from "../types/authReq";
import logger from "../middlewares/logger";
import { APIError } from "../types/apiError";
import { prisma } from "../configs/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../helpers/genrateToken";


export const renderRegisterPage = (req: Request, res: Response) => {
  res.render('auth/register');
}

export const renderLoginPage = (req: Request, res: Response) => {
  res.render('auth/login');
}

export const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response, next : NextFunction) => {
  logger.info("Registering user...");
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      logger.warn("All fields are required for registration");
      res.status(400).render('auth/register', { error: "All fields are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      logger.warn(`User with email ${email} already exists`);
      res.status(409).render('auth/register', { error: "User already exists" });
      return;
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
      res.status(500).render('auth/register', { error: "User registration failed" });
      return;
    }
    logger.info(`User registered successfully: ${newUser.email}`);
    res.status(201).render('home/home', { message: "User registered successfully. Please log in." });
    } catch (error) {
    logger.error("Error during user registration", error);
    res.status(500).render('auth/register', { error: "Internal server error" });
    return;
    }
}

export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
  logger.info("Logging in user...");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn("Email and password are required");
      res.status(400).render('auth/login', { error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      logger.warn(`User with email ${email} not found`);
      res.status(404).render('auth/login', { error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn("Invalid password");
      res.status(401).render('auth/login', { error: "Invalid password" });
      return;
    }
    const token = generateToken(user.id, user.role);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    logger.info(`User logged in successfully: ${user.email}`);
    res.status(200).render('home/home', {
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    logger.error("Error during user login", error);
    res.status(500).render('auth/login', { error: "Internal server error" });
    return;
  }
}