import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/tripService';
import { seatHoldService } from '../services/seatHoldService';

export class TripController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, journeyShift } = req.query;
      const trips = await tripService.searchTrips({
        from: from as string,
        to: to as string,
        journeyShift: journeyShift as string,
      });

      return res.status(200).json({
        success: true,
        count: trips.length,
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trip = await tripService.getTripById(id);
      return res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const departureDate = (req.query.date as string) || 'Today';
      const userId = req.query.userId as string | undefined;
      const seats = await tripService.getSeatAvailability(id, departureDate, userId);

      return res.status(200).json({
        success: true,
        tripId: id,
        departureDate,
        totalSeats: seats.length,
        availableSeats: seats.filter((s) => !s.isBooked).length,
        data: seats,
      });
    } catch (error) {
      next(error);
    }
  }

  async holdSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, seatIds, userId } = req.body;
      const result = await seatHoldService.holdSeats(
        id,
        date || 'Today',
        seatIds || [],
        userId || 'guest-1'
      );
      if (!result.success) {
        return res.status(409).json({
          success: false,
          conflictSeats: result.conflictSeats,
          message: `Seat(s) ${result.conflictSeats?.join(', ')} already reserved or booked`,
        });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async releaseSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, seatIds, userId } = req.body;
      const result = seatHoldService.releaseSeats(
        id,
        date || 'Today',
        seatIds,
        userId || 'guest-1'
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const tripController = new TripController();
