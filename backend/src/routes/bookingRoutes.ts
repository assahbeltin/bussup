import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, (req, res, next) => bookingController.create(req, res, next));
router.get('/my-bookings', requireAuth, (req, res, next) => bookingController.getMyBookings(req, res, next));
router.get('/:id', optionalAuth, (req, res, next) => bookingController.getById(req, res, next));
router.post('/:id/cancel', requireAuth, (req, res, next) => bookingController.cancel(req, res, next));

export default router;
