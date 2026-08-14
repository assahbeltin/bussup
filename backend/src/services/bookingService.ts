import { v4 as uuidv4 } from 'uuid';
import { bookingRepository } from '../repositories/bookingRepository';
import { tripRepository } from '../repositories/tripRepository';
import { seatHoldService } from './seatHoldService';
import { Booking, CreateBookingDTO } from '../models/Booking';
import { generateTicketNo, formatCurrency } from '../utils/ticketNo';
import { AppError } from '../middleware/errorHandler';

export class BookingService {
  async createBooking(userId: string, dto: CreateBookingDTO): Promise<Booking> {
    const trip = await tripRepository.findById(dto.tripId);
    if (!trip) {
      throw new AppError('Selected trip not found', 404);
    }

    if (!dto.seats || dto.seats.length === 0) {
      throw new AppError('At least one seat must be selected', 400);
    }

    // Verify seat availability
    const alreadyBooked = await bookingRepository.findBookedSeatsForTrip(
      dto.tripId,
      dto.departureDate
    );

    const conflictingSeats = dto.seats.filter((seatId) => alreadyBooked.includes(seatId));
    if (conflictingSeats.length > 0) {
      throw new AppError(
        `Seat(s) ${conflictingSeats.join(', ')} are already booked by another passenger`,
        409
      );
    }

    const ticketNo = generateTicketNo();
    const totalAmount = dto.seats.length * trip.priceFCFA;

    const newBooking: Booking = {
      id: `bk-${uuidv4()}`,
      ticketNo,
      userId,
      tripId: trip.id,
      agencyName: trip.agencyName,
      fromCity: trip.fromCity,
      fromTerminal: trip.fromTerminal,
      toCity: trip.toCity,
      toTerminal: trip.toTerminal,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      departureDate: dto.departureDate,
      seatIds: dto.seats,
      totalAmountFCFA: totalAmount,
      totalAmountFormatted: formatCurrency(totalAmount),
      status: dto.paymentMethod === 'ON_BOARD' ? 'Processing' : 'Confirmed',
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === 'ON_BOARD' ? 'PENDING' : 'COMPLETED',
      paymentPhoneOrCard: dto.paymentAccount,
      receiptImage: dto.receiptImage,
      passengers: dto.passengers,
      qrPayload: `BUSUP:${ticketNo}:${trip.id}:SEATS:${dto.seats.join(',')}`,
      createdAt: new Date().toISOString(),
    };

    const createdBooking = await bookingRepository.create(newBooking);

    // Release temporary seat holds as seats are now permanently booked
    seatHoldService.releaseSeats(dto.tripId, dto.departureDate, dto.seats, userId);

    return createdBooking;
  }

  async getUserBookings(userId: string, email?: string): Promise<Booking[]> {
    return bookingRepository.findByUserId(userId, email);
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking ticket not found', 404);
    }
    return booking;
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.getBookingById(id);
    if (booking.userId !== userId) {
      throw new AppError('Unauthorized to cancel this booking', 403);
    }

    if (booking.status === 'Cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    const updated = await bookingRepository.updateStatus(booking.id, 'Cancelled');
    if (!updated) {
      throw new AppError('Failed to update booking status', 500);
    }

    return updated;
  }
}

export const bookingService = new BookingService();
