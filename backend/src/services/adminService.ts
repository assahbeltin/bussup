import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { busRepository } from '../repositories/busRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { tripRepository } from '../repositories/tripRepository';
import { userRepository } from '../repositories/userRepository';
import { Bus, BusStatus, BusType } from '../models/Bus';
import { Booking, BookingStatus } from '../models/Booking';
import { Trip } from '../models/Trip';
import { UserResponse } from '../models/User';
import { generateTicketNo, formatCurrency } from '../utils/ticketNo';
import { AppError } from '../middleware/errorHandler';

export interface AdminDashboardDTO {
  kpis: {
    totalRevenueFCFA: number;
    totalRevenueFormatted: string;
    activeBookingsCount: number;
    totalFleetCount: number;
    activeRoutesCount: number;
  };
  recentBookings: Booking[];
}

export class AdminService {
  async getDashboardOverview(): Promise<AdminDashboardDTO> {
    const allBookings = await bookingRepository.findAll();
    const allBuses = await busRepository.findAll();
    const allTrips = await tripRepository.findAll();

    const activeBookings = allBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Processing');
    const totalRevenueFCFA = allBookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.totalAmountFCFA, 0);

    const routesSet = new Set(allTrips.map((t) => `${t.fromCity}-${t.toCity}`));

    const recentBookings = [...allBookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      kpis: {
        totalRevenueFCFA,
        totalRevenueFormatted: formatCurrency(totalRevenueFCFA),
        activeBookingsCount: activeBookings.length,
        totalFleetCount: allBuses.length,
        activeRoutesCount: routesSet.size,
      },
      recentBookings,
    };
  }

  async getFleet(): Promise<Bus[]> {
    return busRepository.findAll();
  }

  async addBus(
    agencyName: string,
    busNumber: string,
    type: BusType,
    driverName: string,
    totalSeats: number = 80,
    fromCity?: string,
    toCity?: string,
    departureTime?: string,
    priceFCFA?: number
  ): Promise<Bus> {
    const busId = `BUS-${Math.floor(100 + Math.random() * 900)}`;
    const routeStr = (fromCity && toCity) ? `${fromCity} → ${toCity}` : 'Yaoundé → Douala';

    const newBus: Bus = {
      id: busId,
      agencyName: agencyName || 'General Express',
      busNumber,
      type: type || 'VIP Luxury Line',
      totalSeats: totalSeats || 80,
      driverName,
      status: 'Available',
      currentRoute: routeStr,
    };

    const savedBus = await busRepository.create(newBus);

    // Auto-create matching searchable trip for user homepage search
    const tripId = `TRIP-${busId}`;
    const price = Number(priceFCFA) || 6000;
    const origin = fromCity || 'Yaoundé';
    const dest = toCity || 'Douala';

    const newTrip: Trip = {
      id: tripId,
      busId: busId,
      agencyName: savedBus.agencyName,
      rating: 4.8,
      reviewsCount: 1,
      fromCity: origin,
      fromTerminal: `${origin} Central Terminal`,
      toCity: dest,
      toTerminal: `${dest} Main Station`,
      departureTime: departureTime || '07:30 AM',
      arrivalTime: '01:30 PM',
      duration: '6h 00m',
      busType: savedBus.type,
      priceFCFA: price,
      priceFormatted: `${price.toLocaleString()} FCFA`,
      journeyShift: 'Morning',
      amenities: ['Air Conditioning', 'Free WiFi', 'Power Outlets', 'Reclining Seats'],
    };

    await tripRepository.create(newTrip);

    return savedBus;
  }

  async updateBusStatus(id: string, status: BusStatus): Promise<Bus> {
    const updated = await busRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError('Bus not found', 404);
    }
    return updated;
  }

  async getAllBookings(): Promise<Booking[]> {
    return bookingRepository.findAll();
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const updated = await bookingRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError('Booking not found', 404);
    }
    return updated;
  }

  async revokeBooking(id: string): Promise<boolean> {
    return bookingRepository.delete(id);
  }

  async deleteAllBookings(): Promise<boolean> {
    return bookingRepository.deleteAll();
  }

  async createManualBooking(payload: {
    tripId: string;
    fullName: string;
    email: string;
    phone: string;
    seatId?: string;
    paymentMethod?: string;
    status?: BookingStatus;
    departureDate?: string;
  }): Promise<Booking> {
    const trip = await tripRepository.findById(payload.tripId);
    if (!trip) {
      throw new AppError('Selected trip schedule not found', 404);
    }

    let user = await userRepository.findByEmail(payload.email);
    if (!user) {
      user = await userRepository.create({
        id: `usr-${uuidv4()}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        passwordHash: bcrypt.hashSync('Password123', 10),
        role: 'passenger',
        createdAt: new Date().toISOString(),
      });
    }

    const ticketNo = generateTicketNo();
    const totalAmount = trip.priceFCFA;
    const seatId = payload.seatId || '1A';
    const payMethod = (payload.paymentMethod as any) || 'MTN';

    const newBooking: Booking = {
      id: `bk-${uuidv4()}`,
      ticketNo,
      userId: user.id,
      tripId: trip.id,
      agencyName: trip.agencyName,
      fromCity: trip.fromCity,
      fromTerminal: trip.fromTerminal,
      toCity: trip.toCity,
      toTerminal: trip.toTerminal,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      departureDate: payload.departureDate || 'Today',
      seatIds: [seatId],
      totalAmountFCFA: totalAmount,
      totalAmountFormatted: formatCurrency(totalAmount),
      status: payload.status || (payMethod === 'ON_BOARD' ? 'Processing' : 'Confirmed'),
      paymentMethod: payMethod,
      paymentStatus: payMethod === 'ON_BOARD' ? 'PENDING' : 'COMPLETED',
      paymentPhoneOrCard: payload.phone,
      passengers: [
        {
          seatId: seatId,
          fullName: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          age: '30',
        },
      ],
      qrPayload: `BUSUP:${ticketNo}:${trip.id}:SEATS:${seatId}`,
      createdAt: new Date().toISOString(),
    };

    return bookingRepository.create(newBooking);
  }

  async getAllTrips(): Promise<Trip[]> {
    return tripRepository.findAll();
  }

  async createTrip(dto: {
    agencyName?: string;
    busId: string;
    fromCity: string;
    fromTerminal: string;
    toCity: string;
    toTerminal: string;
    departureTime: string;
    arrivalTime: string;
    duration?: string;
    busType?: string;
    priceFCFA: number;
    journeyShift?: string;
    amenities?: string[];
  }): Promise<Trip> {
    const tripId = `TRIP-${Math.floor(100 + Math.random() * 900)}`;
    const priceFCFA = Number(dto.priceFCFA) || 6000;
    const newTrip: Trip = {
      id: tripId,
      busId: dto.busId || 'BUS-VAT-101',
      agencyName: dto.agencyName || 'Vatican Express',
      rating: 4.8,
      reviewsCount: 120,
      fromCity: dto.fromCity,
      fromTerminal: dto.fromTerminal || 'Central Station',
      toCity: dto.toCity,
      toTerminal: dto.toTerminal || 'Central Station',
      departureTime: dto.departureTime,
      arrivalTime: dto.arrivalTime,
      duration: dto.duration || '3h 30m',
      busType: dto.busType || 'VIP Executive',
      priceFCFA,
      priceFormatted: formatCurrency(priceFCFA),
      journeyShift: (dto.journeyShift as any) || 'Morning',
      amenities: dto.amenities || ['AC', 'WiFi', 'Charging'],
    };
    return tripRepository.create(newTrip);
  }

  async updateTrip(id: string, dto: Partial<Trip>): Promise<Trip> {
    if (dto.priceFCFA) {
      dto.priceFormatted = formatCurrency(Number(dto.priceFCFA));
    }
    const updated = await tripRepository.update(id, dto);
    if (!updated) {
      throw new AppError('Trip not found', 404);
    }
    return updated;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const success = await tripRepository.delete(id);
    if (!success) {
      throw new AppError('Trip not found or failed to delete', 404);
    }
    return true;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await userRepository.findAll();
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
    }));
  }

  async deleteUser(id: string): Promise<boolean> {
    return userRepository.delete(id);
  }
}

export const adminService = new AdminService();
