import { PrismaClient } from "@prisma/client";
import logger from "../middlewares/logger";

const prisma = new PrismaClient();

async function connectToDB() {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully");
  } catch (error) {
    logger.error("Error connecting to database", error);
    throw error;
  }
}

export { prisma, connectToDB };