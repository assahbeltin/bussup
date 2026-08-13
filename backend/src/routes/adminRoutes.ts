import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/fleet', (req, res, next) => adminController.getFleet(req, res, next));
router.post('/fleet', (req, res, next) => adminController.addBus(req, res, next));
router.patch('/fleet/:id/status', (req, res, next) => adminController.updateBusStatus(req, res, next));
router.get('/bookings', (req, res, next) => adminController.getBookings(req, res, next));
router.post('/bookings/manual', (req, res, next) => adminController.createManualBooking(req, res, next));
router.delete('/bookings/all', (req, res, next) => adminController.deleteAllBookings(req, res, next));
router.patch('/bookings/:id/status', (req, res, next) => adminController.updateBookingStatus(req, res, next));
router.delete('/bookings/:id', (req, res, next) => adminController.revokeBooking(req, res, next));
router.get('/trips', (req, res, next) => adminController.getTrips(req, res, next));
router.post('/trips', (req, res, next) => adminController.createTrip(req, res, next));
router.patch('/trips/:id', (req, res, next) => adminController.updateTrip(req, res, next));
router.delete('/trips/:id', (req, res, next) => adminController.deleteTrip(req, res, next));
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));

export default router;
