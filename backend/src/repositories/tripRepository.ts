import { supabase, dbPool } from '../db/client';
import { Trip } from '../models/Trip';
import { memoryStore } from './memoryStore';

export interface TripSearchParams {
  from?: string;
  to?: string;
  journeyShift?: string;
}

const normalize = (str: string) =>
  (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export class TripRepository {
  async search(params: TripSearchParams): Promise<Trip[]> {
    try {
      const { data, error } = await supabase.from('trips').select('*').order('price_fcfa', { ascending: true });

      if (!error && data) {
        const mapped = data.map((t: any) => ({
          id: t.id,
          busId: t.bus_id,
          agencyName: t.agency_name,
          rating: Number(t.rating) || 4.5,
          reviewsCount: t.reviews_count || 0,
          fromCity: t.from_city,
          fromTerminal: t.from_terminal,
          toCity: t.to_city,
          toTerminal: t.to_terminal,
          departureTime: t.departure_time,
          arrivalTime: t.arrival_time,
          duration: t.duration,
          busType: t.bus_type,
          priceFCFA: t.price_fcfa,
          priceFormatted: t.price_formatted,
          journeyShift: t.journey_shift,
          amenities: t.amenities || [],
        }));

        return mapped.filter((trip) => {
          if (params.from) {
            const pFrom = normalize(params.from);
            const tFrom = normalize(trip.fromCity);
            if (!tFrom.includes(pFrom) && !pFrom.includes(tFrom)) return false;
          }
          if (params.to) {
            const pTo = normalize(params.to);
            const tTo = normalize(trip.toCity);
            if (!tTo.includes(pTo) && !pTo.includes(tTo)) return false;
          }
          if (
            params.journeyShift &&
            params.journeyShift !== 'All' &&
            normalize(trip.journeyShift) !== normalize(params.journeyShift)
          ) {
            return false;
          }
          return true;
        });
      }
    } catch (err) {
      console.warn('[DB] Supabase search query for trips failed:', (err as Error).message);
    }

    return memoryStore.trips.filter((trip) => {
      if (params.from) {
        const pFrom = normalize(params.from);
        const tFrom = normalize(trip.fromCity);
        if (!tFrom.includes(pFrom) && !pFrom.includes(tFrom)) return false;
      }
      if (params.to) {
        const pTo = normalize(params.to);
        const tTo = normalize(trip.toCity);
        if (!tTo.includes(pTo) && !pTo.includes(tTo)) return false;
      }
      if (
        params.journeyShift &&
        params.journeyShift !== 'All' &&
        normalize(trip.journeyShift) !== normalize(params.journeyShift)
      ) {
        return false;
      }
      return true;
    });
  }

  async findById(id: string): Promise<Trip | null> {
    try {
      const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          busId: data.bus_id,
          agencyName: data.agency_name,
          rating: Number(data.rating) || 4.5,
          reviewsCount: data.reviews_count || 0,
          fromCity: data.from_city,
          fromTerminal: data.from_terminal,
          toCity: data.to_city,
          toTerminal: data.to_terminal,
          departureTime: data.departure_time,
          arrivalTime: data.arrival_time,
          duration: data.duration,
          busType: data.bus_type,
          priceFCFA: data.price_fcfa,
          priceFormatted: data.price_formatted,
          journeyShift: data.journey_shift,
          amenities: data.amenities || [],
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase query for trip by ID failed:', (err as Error).message);
    }

    return memoryStore.trips.find((t) => t.id === id) || null;
  }

  async findAll(): Promise<Trip[]> {
    try {
      const { data, error } = await supabase.from('trips').select('*').order('id', { ascending: true });

      if (!error && data) {
        return data.map((t: any) => ({
          id: t.id,
          busId: t.bus_id,
          agencyName: t.agency_name,
          rating: Number(t.rating) || 4.5,
          reviewsCount: t.reviews_count || 0,
          fromCity: t.from_city,
          fromTerminal: t.from_terminal,
          toCity: t.to_city,
          toTerminal: t.to_terminal,
          departureTime: t.departure_time,
          arrivalTime: t.arrival_time,
          duration: t.duration,
          busType: t.bus_type,
          priceFCFA: t.price_fcfa,
          priceFormatted: t.price_formatted,
          journeyShift: t.journey_shift,
          amenities: t.amenities || [],
        }));
      }
    } catch (err) {
      console.warn('[DB] Supabase query for all trips failed:', (err as Error).message);
    }

    return memoryStore.trips;
  }

  async create(trip: Trip): Promise<Trip> {
    try {
      if (trip.busId) {
        const { data: busExists } = await supabase.from('buses').select('id').eq('id', trip.busId).maybeSingle();
        if (!busExists) {
          await supabase.from('buses').insert({
            id: trip.busId,
            agency_name: trip.agencyName || 'Vatican Express',
            bus_number: trip.busId,
            type: trip.busType || 'VIP Luxury Line',
            total_seats: 80,
            driver_name: 'Assigned Driver',
            status: 'Available',
            current_route: `${trip.fromCity} → ${trip.toCity}`,
          });
        }
      }

      const supabaseTrip = {
        id: trip.id,
        bus_id: trip.busId,
        agency_name: trip.agencyName,
        rating: trip.rating,
        reviews_count: trip.reviewsCount,
        from_city: trip.fromCity,
        from_terminal: trip.fromTerminal,
        to_city: trip.toCity,
        to_terminal: trip.toTerminal,
        departure_time: trip.departureTime,
        arrival_time: trip.arrivalTime,
        duration: trip.duration,
        bus_type: trip.busType,
        price_fcfa: trip.priceFCFA,
        price_formatted: trip.priceFormatted,
        journey_shift: trip.journeyShift,
        amenities: trip.amenities,
      };

      const { error } = await supabase.from('trips').insert(supabaseTrip);

      if (!error) {
        console.log(`[Supabase] Successfully saved trip ${trip.id} (${trip.fromCity} -> ${trip.toCity}) to Supabase trips table`);
        memoryStore.trips.push(trip);
        return trip;
      } else {
        console.warn('[Supabase] Insert error for trip:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase] Supabase insert for trip failed:', (err as Error).message);
    }

    memoryStore.trips.push(trip);
    return trip;
  }

  async update(id: string, partial: Partial<Trip>): Promise<Trip | null> {
    const index = memoryStore.trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      memoryStore.trips[index] = { ...memoryStore.trips[index], ...partial };
    }

    try {
      const dbUpdate: any = {};
      if (partial.agencyName) dbUpdate.agency_name = partial.agencyName;
      if (partial.busId) dbUpdate.bus_id = partial.busId;
      if (partial.fromCity) dbUpdate.from_city = partial.fromCity;
      if (partial.fromTerminal) dbUpdate.from_terminal = partial.fromTerminal;
      if (partial.toCity) dbUpdate.to_city = partial.toCity;
      if (partial.toTerminal) dbUpdate.to_terminal = partial.toTerminal;
      if (partial.departureTime) dbUpdate.departure_time = partial.departureTime;
      if (partial.arrivalTime) dbUpdate.arrival_time = partial.arrivalTime;
      if (partial.duration) dbUpdate.duration = partial.duration;
      if (partial.busType) dbUpdate.bus_type = partial.busType;
      if (partial.priceFCFA) dbUpdate.price_fcfa = partial.priceFCFA;
      if (partial.priceFormatted) dbUpdate.price_formatted = partial.priceFormatted;
      if (partial.journeyShift) dbUpdate.journey_shift = partial.journeyShift;
      if (partial.amenities) dbUpdate.amenities = partial.amenities;

      const { data, error } = await supabase.from('trips').update(dbUpdate).eq('id', id).select('*').maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          busId: data.bus_id,
          agencyName: data.agency_name,
          rating: Number(data.rating) || 4.5,
          reviewsCount: data.reviews_count || 0,
          fromCity: data.from_city,
          fromTerminal: data.from_terminal,
          toCity: data.to_city,
          toTerminal: data.to_terminal,
          departureTime: data.departure_time,
          arrivalTime: data.arrival_time,
          duration: data.duration,
          busType: data.bus_type,
          priceFCFA: data.price_fcfa,
          priceFormatted: data.price_formatted,
          journeyShift: data.journey_shift,
          amenities: data.amenities || [],
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase update for trip failed:', (err as Error).message);
    }

    return memoryStore.trips.find((t) => t.id === id) || null;
  }

  async delete(id: string): Promise<boolean> {
    memoryStore.trips = memoryStore.trips.filter((t) => t.id !== id);
    try {
      await supabase.from('trips').delete().eq('id', id);
      return true;
    } catch (err) {
      console.warn('[DB] Supabase delete for trip failed:', (err as Error).message);
      return true;
    }
  }
}

export const tripRepository = new TripRepository();
