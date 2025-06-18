import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getAllTickets, getTicketById, postCreateTicket, postReply, renderTicketCreatePage } from '../controllers/ticketControllers';

const router = Router();

router.get('/create', authMiddleware, renderTicketCreatePage);
router.get('/', authMiddleware , getAllTickets);
router.get('/:id', authMiddleware, getTicketById);
router.post('/create', authMiddleware, postCreateTicket);
router.post('/:id/reply', authMiddleware, postReply);

export default router;