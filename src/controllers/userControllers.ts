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
      res.status(404).render('agent/tickets', {
        success: false,
        error: 'No tickets found for agent',
        tickets: []
      });
      return;
    }
    res.status(200).render('agent/tickets', {
      success: true,
      message: 'Tickets fetched successfully',
      tickets: tickets
    });
  } catch (err) {
    logger.error('Error fetching agent tickets', { error: err });
    res.status(500).render('agent/tickets', {
      success: false,
      error: 'Failed to fetch tickets',
      tickets: []
    });
    return;
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
    res.status(200);
    res.redirect('/agent/tickets');
    return;
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
    });
    if (!tickets) {
      logger.warn('No tickets found for admin');
      res.status(404).render('admin/tickets', { tickets: [], agents: [], error: 'No tickets found' });
      return;
    }
    logger.info('Tickets fetched successfully', { count: tickets.length });
    if(!agents) {
      logger.warn('No agents found');
      res.status(404).render('admin/tickets', { tickets: [], agents: [], error: 'No agents found' });
      return;
    }
    logger.info('Agents fetched successfully', { count: agents.length });
    res.status(200).render('admin/tickets', {
      success: true,
      message: 'Tickets fetched successfully',
      tickets: tickets,
      agents: agents
    });

  } catch (err) {
    logger.error('Error fetching admin tickets', { error: err });
    res.status(500).render('admin/tickets', { tickets: [], agents: [], error: 'Failed to fetch tickets' });
    return;
  }
};

export const assignTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      logger.warn('Ticket not found', { ticketId: req.params.id });
      res.status(404).render('admin/tickets', { tickets: [], agents: [], error: 'Ticket not found' });
      return;
    }
    const agentId = req.body.agentId;
    if (!agentId) {
      logger.warn('Agent ID not provided for ticket assignment', { ticketId: req.params.id });
      res.status(400).render('admin/tickets', { tickets: [], agents: [], error: 'Agent ID is required' });
      return;
    }
    const agent = await prisma.user.findUnique({
      where: { id: agentId, role: 'agent' },
    });
    if (!agent) {
      logger.warn('Agent not found', { agentId });
      res.status(404).render('admin/tickets', { tickets: [], agents: [], error: 'Agent not found' });
      return;
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        assignedToId: agentId,
      },
    });
    logger.info('Ticket assigned successfully', { ticketId: req.params.id, agentId });
    res.status(200)
    res.redirect('/admin/tickets');
    return;
  } catch (err) {
    logger.error('Error assigning ticket', { error: err });
    res.status(500).render('admin/tickets', { tickets: [], agents: [], error: 'Failed to assign ticket' });
    return;
  }
};

export const closeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) {
      logger.warn('Ticket not found', { ticketId: req.params.id });
      res.status(404).render('admin/tickets', { tickets: [], agents: [], error: 'Ticket not found' });
      return;
    }
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status: 'Resolved',
      },
    });
    logger.info('Ticket closed successfully', { ticketId: req.params.id });
    if (ticket.githubIssueNumber) {
      await closeGithubIssue(ticket.githubIssueNumber);
    }
    res.status(200);
    res.redirect('/admin/tickets');
    return;
  } catch (err) {
    logger.error('Error closing ticket', { error: err });
    res.status(500).render('admin/tickets', { tickets: [], agents: [], error: 'Failed to close ticket' });
    return;
  }
};
