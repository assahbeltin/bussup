import { supabase, dbPool } from '../db/client';
import { Booking, BookingStatus } from '../models/Booking';
import { memoryStore } from './memoryStore';

export class BookingRepository {
  async create(booking: Booking): Promise<Booking> {
    try {
      const supabaseBooking = {
        id: booking.id,
        ticket_no: booking.ticketNo,
        user_id: booking.userId,
        trip_id: booking.tripId,
        agency_name: booking.agencyName,
        from_city: booking.fromCity,
        from_terminal: booking.fromTerminal,
        to_city: booking.toCity,
        to_terminal: booking.toTerminal,
        departure_time: booking.departureTime,
        arrival_time: booking.arrivalTime,
        departure_date: booking.departureDate,
        seat_ids: booking.seatIds,
        total_amount_fcfa: booking.totalAmountFCFA,
        total_amount_formatted: booking.totalAmountFormatted,
        status: booking.status,
        payment_method: booking.paymentMethod,
        payment_status: booking.paymentStatus,
        payment_phone_or_card: booking.paymentPhoneOrCard || null,
        qr_payload: booking.qrPayload,
        created_at: booking.createdAt,
      };

      const { error: bookingError } = await supabase.from('bookings').insert(supabaseBooking);

      if (!bookingError) {
        console.log(`[Supabase] Successfully saved booking ${booking.ticketNo} to Supabase bookings table`);
        if (booking.passengers && booking.passengers.length > 0) {
          const passengerRows = booking.passengers.map((p) => ({
            booking_id: booking.id,
            seat_id: p.seatId,
            full_name: p.fullName,
            phone: p.phone,
            email: p.email,
            age: p.age,
          }));
          await supabase.from('passengers').insert(passengerRows);
        }
        memoryStore.bookings.push(booking);
        return booking;
      } else {
        console.warn('[Supabase] Insert error for booking:', bookingError.message);
      }
    } catch (err) {
      console.warn('[Supabase] Insert exception for booking:', (err as Error).message);
    }

    try {
      const query = `
        INSERT INTO bookings (
          id, ticket_no, user_id, trip_id, agency_name, from_city, from_terminal,
          to_city, to_terminal, departure_time, arrival_time, departure_date,
          seat_ids, total_amount_fcfa, total_amount_formatted, status,
          payment_method, payment_status, payment_phone_or_card, qr_payload, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
      `;
      const values = [
        booking.id,
        booking.ticketNo,
        booking.userId,
        booking.tripId,
        booking.agencyName,
        booking.fromCity,
        booking.fromTerminal,
        booking.toCity,
        booking.toTerminal,
        booking.departureTime,
        booking.arrivalTime,
        booking.departureDate,
        booking.seatIds,
        booking.totalAmountFCFA,
        booking.totalAmountFormatted,
        booking.status,
        booking.paymentMethod,
        booking.paymentStatus,
        booking.paymentPhoneOrCard || null,
        booking.qrPayload,
        booking.createdAt,
      ];
      await dbPool.query(query, values);
    } catch (error) {
      // ignore
    }

    memoryStore.bookings.push(booking);
    return booking;
  }

  async findByUserId(userId: string, email?: string): Promise<Booking[]> {
    try {
      const bookingIds = new Set<string>();

      const { data: userBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId);
      if (userBookings) userBookings.forEach((b: any) => bookingIds.add(b.id));

      if (email) {
        const { data: pBookings } = await supabase
          .from('passengers')
          .select('booking_id')
          .ilike('email', email.trim());
        if (pBookings) pBookings.forEach((p: any) => bookingIds.add(p.booking_id));
      }

      if (bookingIds.size > 0) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, passengers(*)')
          .in('id', Array.from(bookingIds))
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            ticketNo: b.ticket_no,
            userId: b.user_id,
            tripId: b.trip_id,
            agencyName: b.agency_name,
            fromCity: b.from_city,
            fromTerminal: b.from_terminal,
            toCity: b.to_city,
            toTerminal: b.to_terminal,
            departureTime: b.departure_time,
            arrivalTime: b.arrival_time,
            departureDate: b.departure_date,
            seatIds: b.seat_ids || [],
            totalAmountFCFA: b.total_amount_fcfa,
            totalAmountFormatted: b.total_amount_formatted,
            status: b.status,
            paymentMethod: b.payment_method,
            paymentStatus: b.payment_status,
            paymentPhoneOrCard: b.payment_phone_or_card,
            passengers: Array.isArray(b.passengers)
              ? b.passengers.map((p: any) => ({
                  seatId: p.seat_id,
                  fullName: p.full_name,
                  phone: p.phone,
                  email: p.email,
                  age: p.age,
                }))
              : [],
            qrPayload: b.qr_payload,
            createdAt: b.created_at,
          }));
        }
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for user bookings:', (err as Error).message);
    }

    return memoryStore.bookings.filter(
      (b) => b.userId === userId || (email && b.passengers?.some((p) => p.email?.toLowerCase() === email.toLowerCase()))
    );
  }

  async findById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, passengers(*)')
        .or(`id.eq.${id},ticket_no.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          ticketNo: data.ticket_no,
          userId: data.user_id,
          tripId: data.trip_id,
          agencyName: data.agency_name,
          fromCity: data.from_city,
          fromTerminal: data.from_terminal,
          toCity: data.to_city,
          toTerminal: data.to_terminal,
          departureTime: data.departure_time,
          arrivalTime: data.arrival_time,
          departureDate: data.departure_date,
          seatIds: data.seat_ids || [],
          totalAmountFCFA: data.total_amount_fcfa,
          totalAmountFormatted: data.total_amount_formatted,
          status: data.status,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status,
          paymentPhoneOrCard: data.payment_phone_or_card,
          passengers: Array.isArray(data.passengers)
            ? data.passengers.map((p: any) => ({
                seatId: p.seat_id,
                fullName: p.full_name,
                phone: p.phone,
                email: p.email,
                age: p.age,
              }))
            : [],
          qrPayload: data.qr_payload,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for findById booking:', (err as Error).message);
    }

    return memoryStore.bookings.find((b) => b.id === id || b.ticketNo === id) || null;
  }

  async findBookedSeatsForTrip(tripId: string, departureDate: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('seat_ids, status, departure_date')
        .eq('trip_id', tripId)
        .neq('status', 'Cancelled');

      if (!error && data) {
        const bookedSeats: string[] = [];
        data.forEach((b: any) => {
          if (
            b.departure_date &&
            b.departure_date.toLowerCase() === departureDate.toLowerCase() &&
            Array.isArray(b.seat_ids)
          ) {
            bookedSeats.push(...b.seat_ids);
          }
        });
        if (bookedSeats.length > 0) return bookedSeats;
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for booked seats:', (err as Error).message);
    }

    const activeBookings = memoryStore.bookings.filter(
      (b) =>
        b.tripId === tripId &&
        b.departureDate.toLowerCase() === departureDate.toLowerCase() &&
        b.status !== 'Cancelled'
    );
    const bookedSeats: string[] = [];
    activeBookings.forEach((b) => bookedSeats.push(...b.seatIds));
    return bookedSeats;
  }

  async findAll(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, passengers(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((b: any) => ({
          id: b.id,
          ticketNo: b.ticket_no,
          userId: b.user_id,
          tripId: b.trip_id,
          agencyName: b.agency_name,
          fromCity: b.from_city,
          fromTerminal: b.from_terminal,
          toCity: b.to_city,
          toTerminal: b.to_terminal,
          departureTime: b.departure_time,
          arrivalTime: b.arrival_time,
          departureDate: b.departure_date,
          seatIds: b.seat_ids || [],
          totalAmountFCFA: b.total_amount_fcfa,
          totalAmountFormatted: b.total_amount_formatted,
          status: b.status,
          paymentMethod: b.payment_method,
          paymentStatus: b.payment_status,
          paymentPhoneOrCard: b.payment_phone_or_card,
          passengers: Array.isArray(b.passengers)
            ? b.passengers.map((p: any) => ({
                seatId: p.seat_id,
                fullName: p.full_name,
                phone: p.phone,
                email: p.email,
                age: p.age,
              }))
            : [],
          qrPayload: b.qr_payload,
          createdAt: b.created_at,
        }));
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for findAll bookings:', (err as Error).message);
    }

    return memoryStore.bookings;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .or(`id.eq.${id},ticket_no.eq.${id}`)
        .select('*, passengers(*)')
        .maybeSingle();

      if (!error && data) {
        const updated: Booking = {
          id: data.id,
          ticketNo: data.ticket_no,
          userId: data.user_id,
          tripId: data.trip_id,
          agencyName: data.agency_name,
          fromCity: data.from_city,
          fromTerminal: data.from_terminal,
          toCity: data.to_city,
          toTerminal: data.to_terminal,
          departureTime: data.departure_time,
          arrivalTime: data.arrival_time,
          departureDate: data.departure_date,
          seatIds: data.seat_ids || [],
          totalAmountFCFA: data.total_amount_fcfa,
          totalAmountFormatted: data.total_amount_formatted,
          status: data.status,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status,
          paymentPhoneOrCard: data.payment_phone_or_card,
          passengers: Array.isArray(data.passengers)
            ? data.passengers.map((p: any) => ({
                seatId: p.seat_id,
                fullName: p.full_name,
                phone: p.phone,
                email: p.email,
                age: p.age,
              }))
            : [],
          qrPayload: data.qr_payload,
          createdAt: data.created_at,
        };

        const memBooking = memoryStore.bookings.find((b) => b.id === id || b.ticketNo === id);
        if (memBooking) memBooking.status = status;
        return updated;
      }
    } catch (err) {
      console.warn('[DB] Supabase update status failed for booking:', (err as Error).message);
    }

    const booking = memoryStore.bookings.find((b) => b.id === id || b.ticketNo === id);
    if (!booking) return null;
    booking.status = status;
    return booking;
  }

  async delete(id: string): Promise<boolean> {
    memoryStore.bookings = memoryStore.bookings.filter((b) => b.id !== id && b.ticketNo !== id);
    try {
      await supabase
        .from('bookings')
        .delete()
        .or(`id.eq.${id},ticket_no.eq.${id}`);
      return true;
    } catch (err) {
      console.warn('[DB] Supabase delete for booking failed:', (err as Error).message);
      return true;
    }
  }

  async deleteAll(): Promise<boolean> {
    memoryStore.bookings = [];
    try {
      await supabase.from('passengers').delete().neq('id', 0);
      await supabase.from('bookings').delete().neq('id', '');
      return true;
    } catch (err) {
      console.warn('[DB] Supabase deleteAll bookings failed:', (err as Error).message);
      return true;
    }
  }
}

export const bookingRepository = new BookingRepository();
