import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { bookingService } from '../services/bookingService';
import { userRepository } from '../repositories/userRepository';
import { AuthenticatedRequest } from '../middleware/auth';

export class BookingController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { tripId, departureDate, seats, passengers, paymentMethod, paymentAccount } = req.body;

      let userId = req.user?.userId;
      if (!userId) {
        const guestEmail = (passengers && passengers[0]?.email) || 'guest@busup.cm';
        let user = await userRepository.findByEmail(guestEmail);
        if (!user) {
          user = await userRepository.create({
            id: `usr-${uuidv4()}`,
            fullName: (passengers && passengers[0]?.fullName) || 'Guest Passenger',
            email: guestEmail,
            phone: (passengers && passengers[0]?.phone) || paymentAccount || '+237600000000',
            passwordHash: bcrypt.hashSync('GuestPassword123', 10),
            role: 'passenger',
            createdAt: new Date().toISOString(),
          });
        }
        userId = user.id;
      }

      const booking = await bookingService.createBooking(userId, {
        tripId,
        departureDate: departureDate || 'Today',
        seats: seats || ['1A'],
        passengers: passengers || [],
        paymentMethod: paymentMethod || 'MTN',
        paymentAccount,
        receiptImage: req.body.receiptImage,
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const email = (req.query.email as string) || req.user.email;
      const bookings = await bookingService.getUserBookings(req.user.userId, email);
      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, Next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      Next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const cancelledBooking = await bookingService.cancelBooking(id, req.user.userId);

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: cancelledBooking,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
