import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getAllTickets, getTicketById, postCreateTicket, postReply } from '../controllers/ticketControllers';

const router = Router();

router.get('/', authMiddleware , getAllTickets);
router.post('/create', authMiddleware, postCreateTicket);
router.get('/:id', authMiddleware, getTicketById);
router.post('/:id/reply', authMiddleware, postReply);

export default router;