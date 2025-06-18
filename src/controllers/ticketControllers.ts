import { Request, Response, NextFunction } from 'express';
import { prisma } from '../configs/prisma';
import { createGithubIssue } from '../configs/github';
import logger from '../middlewares/logger';
import { APIError } from '../types/apiError';

export const postCreateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Creating a new ticket');
  const userId = req.user?.userId; // Assuming user ID is stored in req.user after auth middleware
  if (!userId) {
    logger.error('User ID not found in request');
    throw new APIError('User not authenticated', 401);
  }
  try {
    const { title, description, category } = req.body;
    const ghIssue: any = await createGithubIssue(title, description);
    
    if (!ghIssue || !ghIssue.html_url || !ghIssue.number) {
      logger.error('Failed to create GitHub issue');
      throw new APIError('Failed to create GitHub issue', 500);
    }
    logger.info(`GitHub issue created: ${ghIssue.html_url} with number ${ghIssue.number}`);
    // Creating ticket in DB
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category,
        userId,
        githubIssueUrl: ghIssue.html_url,
        githubIssueNumber: ghIssue.number,
        status: 'Open',
      }
    });
    logger.info(`Ticket created with ID: ${ticket.id}`);
    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(`Fetching ticket with ID: ${req.params.id}`);
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { replies: true },
    });
    if (!ticket) {
      logger.warn(`Ticket with ID ${req.params.id} not found`);
      throw new APIError('Ticket not found', 404);
    }
    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all tickets');
  try {
    const tickets = await prisma.ticket.findMany({
      include: { replies: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

export const postReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { replies: true },
    });
    if (!ticket) {
      logger.warn(`Ticket with ID ${req.params.id} not found`);
      throw new APIError('Ticket not found', 404);
    }
    const reply = await prisma.reply.create({
      data: {
        ticketId: ticket.id,
        userId: req.user?.userId,
        message: req.body.message
      }
    });
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        replies: {
          connect: { id: reply.id }
        }
      }
    });
    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      reply,
    });
  } catch (err) {
    next(err);
  }
};
