import { Router } from "express";
import { authMiddleware, verifyRole } from "../middlewares/authMiddleware";
import { assignTicket, closeTicket, getAdminTickets, getAgentTickets, updateTicketStatus } from "../controllers/userControllers";
// import { getAgentTickets, updateTicketStatus, getAdminTickets, assignTicket, closeTicket, getAdminDashboard } from '../controllers/adminController';

const router = Router();


// Agent routes
router.get('/agent/tickets/', authMiddleware, verifyRole('agent'), getAgentTickets);
router.post('/agent/tickets/:id/status',
  authMiddleware,
  verifyRole('admin'),
  updateTicketStatus
);

// Admin routes
router.get('/admin/tickets/', authMiddleware, verifyRole('admin'), getAdminTickets);
router.post('/admin/tickets/:id/assign',
  authMiddleware,
  verifyRole('admin'),
  assignTicket
);
router.post('/admin/tickets/:id/close',
  authMiddleware,
  verifyRole('admin'),
  closeTicket
);

export default router;
