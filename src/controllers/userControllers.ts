import { NextFunction, Request, Response } from 'express';
import { prisma } from '../configs/prisma';
import { closeGithubIssue } from '../configs/github';
import { APIError } from '../types/apiError';
import logger from '../middlewares/logger';

export const getAgentTickets = async (req: Request, res: Response, next: NextFunction) => {
  logger.info('Fetching tickets for agent');
  try {
    const agentId = req.user?.userId;
    const tickets = await prisma.ticket.findMany({
      where: { assignedToId: agentId },
    });
    if (!tickets || tickets.length === 0) {
      logger.warn('No tickets found for agent', { agentId });
      throw new APIError('No tickets found', 404);
    }
    res.status(200).json({
      success: true,
      message: 'Tickets fetched successfully',
      tickets: tickets
    });
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Updating ticket status', { ticketId: req.params.id });
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      res.status(404).send('Ticket not found');
      return;
    }
    if (req.body.status === 'Resolved' && ticket.githubIssueNumber) {
      await closeGithubIssue(ticket.githubIssueNumber);
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...ticket,
        status: req.body.status,
      },
    });
    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info('Fetching admin tickets');
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        assignedTo: true,
      },
    });
    const agents = await prisma.user.findMany({
      where: { role: 'agent' },
      select: {
        id: true,
        name: true,
      },
    });
    if (!tickets) {
      logger.warn('No tickets found for admin');
      throw new APIError('No tickets found', 404);
    }
    logger.info('Tickets fetched successfully', { count: tickets.length });
    if(!agents) {
      logger.warn('No agents found');
      throw new APIError('No agents found', 404);
    }
    logger.info('Agents fetched successfully', { count: agents.length });
    res.status(200).json({
      success: true,
      message: 'Tickets fetched successfully',
      tickets: tickets,
      agents: agents
    });

  } catch (err) {
    next(err);
  }
};

export const assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      logger.warn('Ticket not found', { ticketId: req.params.id });
      throw new APIError('Ticket not found', 404);
    }
    const agentId = req.body.agentId;
    if (!agentId) {
      logger.warn('Agent ID not provided for ticket assignment', { ticketId: req.params.id });
      throw new APIError('Agent ID is required', 400);
    }
    const agent = await prisma.user.findUnique({
      where: { id: agentId, role: 'agent' },
    });
    if (!agent) {
      logger.warn('Agent not found', { agentId });
      throw new APIError('Agent not found', 404);
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        assignedToId: agentId,
      },
    });
    logger.info('Ticket assigned successfully', { ticketId: req.params.id, agentId });
    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket: updatedTicket
    });
  } catch (err) {
    next(err);
  }
};

export const closeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      logger.warn('Ticket not found', { ticketId: req.params.id });
      throw new APIError('Ticket not found', 404);
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status: 'Resolved',
      },
    });
    logger.info('Ticket closed successfully', { ticketId: req.params.id });
    if (ticket.githubIssueNumber) {
      await closeGithubIssue(ticket.githubIssueNumber);
    }
    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      ticket: updatedTicket
    });
  } catch (err) {
    next(err);
  }
};
