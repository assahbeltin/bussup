import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await adminService.getDashboardOverview();
      return res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFleet(req: Request, res: Response, next: NextFunction) {
    try {
      const fleet = await adminService.getFleet();
      return res.status(200).json({
        success: true,
        count: fleet.length,
        data: fleet,
      });
    } catch (error) {
      next(error);
    }
  }

  async addBus(req: Request, res: Response, next: NextFunction) {
    try {
      const { agencyName, busNumber, type, driverName, totalSeats, fromCity, toCity, departureTime, priceFCFA } = req.body;
      if (!busNumber || !type || !driverName) {
        return res.status(400).json({ success: false, message: 'Bus number, type, and driver name are required' });
      }

      const bus = await adminService.addBus(
        agencyName,
        busNumber,
        type,
        driverName,
        totalSeats || 80,
        fromCity,
        toCity,
        departureTime,
        priceFCFA ? Number(priceFCFA) : undefined
      );

      return res.status(201).json({
        success: true,
        message: 'Bus added to fleet successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBusStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const bus = await adminService.updateBusStatus(id, status);
      return res.status(200).json({
        success: true,
        message: 'Bus status updated successfully',
        data: bus,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await adminService.getAllBookings();
      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const booking = await adminService.updateBookingStatus(id, status);
      return res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.revokeBooking(id);
      return res.status(200).json({
        success: true,
        message: 'Booking revoked and deleted from database successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      await adminService.deleteAllBookings();
      return res.status(200).json({
        success: true,
        message: 'All bookings deleted from database successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createManualBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId, fullName, email, phone, seatId, paymentMethod, status, departureDate } = req.body;
      if (!tripId || !fullName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'tripId, fullName, email, and phone are required',
        });
      }

      const booking = await adminService.createManualBooking({
        tripId,
        fullName,
        email,
        phone,
        seatId: seatId || '1A',
        paymentMethod: paymentMethod || 'MTN',
        status,
        departureDate,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered into system and booking scheduled successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await adminService.getAllTrips();
      return res.status(200).json({
        success: true,
        count: trips.length,
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromCity, toCity, departureTime, arrivalTime, priceFCFA } = req.body;
      if (!fromCity || !toCity || !departureTime || !arrivalTime || !priceFCFA) {
        return res.status(400).json({
          success: false,
          message: 'fromCity, toCity, departureTime, arrivalTime, and priceFCFA are required',
        });
      }

      const trip = await adminService.createTrip(req.body);
      return res.status(201).json({
        success: true,
        message: 'Trip scheduled successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trip = await adminService.updateTrip(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Trip updated successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteTrip(id);
      return res.status(200).json({
        success: true,
        message: 'Trip deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      return res.status(200).json({
        success: true,
        message: 'User account deleted from database successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
