import { tripRepository, TripSearchParams } from '../repositories/tripRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { seatHoldService } from './seatHoldService';
import { Trip, SeatStatus } from '../models/Trip';
import { AppError } from '../middleware/errorHandler';

export class TripService {
  async searchTrips(params: TripSearchParams): Promise<Trip[]> {
    return tripRepository.search(params);
  }

  async getTripById(id: string): Promise<Trip> {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }
    return trip;
  }

  async getSeatAvailability(
    tripId: string,
    departureDate: string,
    currentUserId?: string
  ): Promise<SeatStatus[]> {
    const trip = await this.getTripById(tripId);
    const bookedSeatIds = await bookingRepository.findBookedSeatsForTrip(tripId, departureDate);
    const heldSeats = seatHoldService.getActiveHolds(tripId, departureDate, currentUserId);
    const heldSeatIds = heldSeats.map((h) => h.seatId);

    // 80 Seats total (20 rows x 4 seats: A, B, C, D)
    const totalSeats = 80;
    const labels = ['A', 'B', 'C', 'D'];
    const rows = totalSeats / 4;
    const seats: SeatStatus[] = [];

    for (let r = 1; r <= rows; r++) {
      labels.forEach((label) => {
        const id = `${r}${label}`;
        const isBooked = bookedSeatIds.includes(id) || heldSeatIds.includes(id);
        seats.push({
          id,
          row: r,
          label,
          isBooked,
        });
      });
    }

    return seats;
  }
}

export const tripService = new TripService();
