import { Request, Response, NextFunction } from 'express';
import { prisma } from '../configs/prisma';
import { createGithubIssue } from '../configs/github';
import logger from '../middlewares/logger';

export const postCreateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Creating a new ticket');
  const userId = req.user?.userId;
  if (!userId) {
    logger.error('User ID not found in request');
    res.status(401).render('auth/login', { success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const { title, description, category } = req.body;
    const ghIssue: any = await createGithubIssue(title, description);
    
    if (!ghIssue || !ghIssue.html_url || !ghIssue.number) {
      logger.error('Failed to create GitHub issue');
      res.status(500).render('error', { success: false, error: 'Failed to create GitHub issue' });
      return;
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
    res.status(201).render('tickets/create', { message: 'Ticket created successfully', ticket: ticket });
  } catch (err) {
    logger.error('Error creating ticket', err);
    res.status(500).render('error', { success: false, error: 'Internal server error' });
    return;
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info(`Fetching ticket with ID: ${req.params.id}`);
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { replies: {
          include: { user: true }
      } },
    });
    if (!ticket) {
      logger.warn(`Ticket with ID ${req.params.id} not found`);
      res.status(404).render('tickets/detail', { success: false, error: 'Ticket not found', ticket: null });
      return;
    
    }
    res.status(200).render('tickets/detail', {
      success: true,
      ticket,
    });
  } catch (err) {
    logger.error(`Error fetching ticket with ID ${req.params.id}`, err);
    res.status(500).render('tickets/detail', { success: false, error: 'Internal server error', ticket: null });
    return;
  }
};

export const getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching all tickets');
  try {
    const tickets = await prisma.ticket.findMany({
      include: { replies: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).render('tickets/list', {
      success: true,
      tickets,
    });
  } catch (err) {
    logger.error('Error fetching all tickets', err);
    res.status(500).render('tickets/list', { success: false, error: 'Internal server error', tickets: [] });
    return;
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
      res.status(404).render('tickets/detail', { success: false, error: 'Ticket not found', ticket: null });
      return;
    }
    const reply = await prisma.reply.create({
      data: {
        ticketId: ticket.id,
        userId: req.user?.userId,
        message: req.body.message
      }
    });
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      include: { replies: {
          include: { user: true }
      } },
      data: {
        replies: {
          connect: { id: reply.id }
        }

      }
    });
    res.status(201).render('tickets/detail', {
      success: true,
      message: 'Reply posted successfully',
      ticket: updatedTicket,
    });
  } catch (err) {
    logger.error('Error posting reply', err);
    res.status(500).render('error', { success: false, error: 'Internal server error', ticket: null });
    return;
  }
};

export const renderTicketCreatePage = (req: Request, res: Response) => {
  res.render('tickets/create');
}
