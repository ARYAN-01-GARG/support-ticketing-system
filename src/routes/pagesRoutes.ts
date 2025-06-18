import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, verifyRole } from '../middlewares/authMiddleware';
import { getAllTickets, getTicketById } from '../controllers/ticketControllers';

const router = Router();

// Auth pages




// // Agent pages
// router.get('/agent/tickets', authMiddleware, verifyRole('agent'), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const agentId = req.user?.userId;
//     const tickets = await prisma.ticket.findMany({ where: { assignedToId: agentId } });
//     res.render('agent/tickets', { tickets });
//   } catch (err) {
//     res.render('agent/tickets', { tickets: [], error: 'Failed to fetch tickets' });
//   }
// });

// // Admin pages
// router.get('/admin/tickets', authMiddleware, verifyRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const tickets = await prisma.ticket.findMany({ include: { assignedTo: true } });
//     const agents = await prisma.user.findMany({ where: { role: 'agent' } });
//     res.render('admin/tickets', { tickets, agents });
//   } catch (err) {
//     res.render('admin/tickets', { tickets: [], agents: [], error: 'Failed to fetch tickets' });
//   }
// });
// router.get('/admin/dashboard', authMiddleware, verifyRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const tickets = await prisma.ticket.findMany();
//     const open = tickets.filter(t => t.status === 'Open').length;
//     const inProgress = tickets.filter(t => t.status === 'InProgress').length;
//     const resolved = tickets.filter(t => t.status === 'Resolved').length;
//     const categoryStats: Record<string, number> = {};
//     tickets.forEach(t => {
//       if (t.category) categoryStats[t.category] = (categoryStats[t.category] || 0) + 1;
//     });
//     res.render('admin/dashboard', { open, inProgress, resolved, categoryStats });
//   } catch (err) {
//     res.render('admin/dashboard', { open: 0, inProgress: 0, resolved: 0, categoryStats: {}, error: 'Failed to load dashboard' });
//   }
// });

// // Ticket pages
// router.get('/tickets', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.userId;
//     const tickets = await prisma.ticket.findMany({ where: { userId } });
//     res.render('tickets/list', { tickets });
//   } catch (err) {
//     res.render('tickets/list', { tickets: [], error: 'Failed to fetch tickets' });
//   }
// });
// router.get('/tickets/create', authMiddleware, (req: Request, res: Response) => {
//   res.render('tickets/create');
// });
// router.get('/tickets/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const ticket = await prisma.ticket.findUnique({
//       where: { id: req.params.id },
//       include: { replies: { include: { user: true } } }
//     });
//     if (!ticket) return res.render('tickets/detail', { error: 'Ticket not found' });
//     res.render('tickets/detail', { ticket });
//   } catch (err) {
//     res.render('tickets/detail', { error: 'Failed to fetch ticket' });
//   }
// });

export default router;
