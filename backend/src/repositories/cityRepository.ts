import { supabase, dbPool } from '../db/client';
import { City, Terminal } from '../models/City';
import { memoryStore } from './memoryStore';

export class CityRepository {
  async findAll(): Promise<City[]> {
    try {
      const { data: citiesData, error: citiesErr } = await supabase.from('cities').select('*').order('name', { ascending: true });
      const { data: terminalsData, error: termErr } = await supabase.from('terminals').select('*');

      if (!citiesErr && citiesData && citiesData.length > 0) {
        const terminalsMap: Record<string, Terminal[]> = {};
        if (terminalsData) {
          terminalsData.forEach((t: any) => {
            const cityId = t.city_id;
            if (!terminalsMap[cityId]) {
              terminalsMap[cityId] = [];
            }
            terminalsMap[cityId].push({
              id: t.id,
              name: t.name,
              address: t.address,
            });
          });
        }

        return citiesData.map((c: any) => ({
          id: c.id,
          name: c.name,
          region: c.region,
          popularTerminals: terminalsMap[c.id] || [],
        }));
      }
    } catch (error) {
      console.warn('[DB] Supabase query for cities failed, using memoryStore:', (error as Error).message);
    }
    return memoryStore.cities;
  }

  async findById(id: string): Promise<City | null> {
    const cities = await this.findAll();
    return cities.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase()) || null;
  }
}

export const cityRepository = new CityRepository();
