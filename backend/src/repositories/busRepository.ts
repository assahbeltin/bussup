import { supabase, dbPool } from '../db/client';
import { Bus, BusStatus } from '../models/Bus';
import { memoryStore } from './memoryStore';

export class BusRepository {
  async findAll(): Promise<Bus[]> {
    try {
      const { data, error } = await supabase.from('buses').select('*').order('id', { ascending: true });

      if (!error && data) {
        return data.map((b: any) => ({
          id: b.id,
          agencyName: b.agency_name,
          busNumber: b.bus_number,
          type: b.type,
          totalSeats: b.total_seats,
          driverName: b.driver_name,
          status: b.status,
          currentRoute: b.current_route,
        }));
      }
    } catch (err) {
      console.warn('[DB] Supabase query for buses failed:', (err as Error).message);
    }
    return memoryStore.buses;
  }

  async findById(id: string): Promise<Bus | null> {
    try {
      const { data, error } = await supabase.from('buses').select('*').eq('id', id).maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          agencyName: data.agency_name,
          busNumber: data.bus_number,
          type: data.type,
          totalSeats: data.total_seats,
          driverName: data.driver_name,
          status: data.status,
          currentRoute: data.current_route,
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase query for bus by ID failed:', (err as Error).message);
    }
    return memoryStore.buses.find((b) => b.id === id) || null;
  }

  async create(bus: Bus): Promise<Bus> {
    try {
      const supabaseBus = {
        id: bus.id,
        agency_name: bus.agencyName,
        bus_number: bus.busNumber,
        type: bus.type,
        total_seats: bus.totalSeats,
        driver_name: bus.driverName,
        status: bus.status,
        current_route: bus.currentRoute,
      };

      const { error } = await supabase.from('buses').insert(supabaseBus);

      if (!error) {
        memoryStore.buses.push(bus);
        return bus;
      }
    } catch (err) {
      console.warn('[DB] Supabase insert bus failed:', (err as Error).message);
    }

    memoryStore.buses.push(bus);
    return bus;
  }

  async updateStatus(id: string, status: BusStatus): Promise<Bus | null> {
    try {
      const { data, error } = await supabase
        .from('buses')
        .update({ status })
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (!error && data) {
        const memBus = memoryStore.buses.find((b) => b.id === id);
        if (memBus) memBus.status = status;
        return {
          id: data.id,
          agencyName: data.agency_name,
          busNumber: data.bus_number,
          type: data.type,
          totalSeats: data.total_seats,
          driverName: data.driver_name,
          status: data.status,
          currentRoute: data.current_route,
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase update bus status failed:', (err as Error).message);
    }

    const bus = memoryStore.buses.find((b) => b.id === id);
    if (!bus) return null;
    bus.status = status;
    return bus;
  }
}

export const busRepository = new BusRepository();
