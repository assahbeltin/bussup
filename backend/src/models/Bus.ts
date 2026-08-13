export type BusStatus = 'Available' | 'On Route' | 'Maintenance';
export type BusType = 'VIP Classic (A/C, WiFi)' | 'Executive Direct' | 'Premium VIP' | 'Standard Comfort' | 'Luxury VIP' | 'Semi-VIP' | 'Standard';

export interface Bus {
  id: string; // e.g. BUS-101
  agencyName: string; // e.g. General Express, Finexs Voyages, Touristique Express, Buca Voyages
  busNumber: string;
  type: BusType;
  totalSeats: number;
  driverName: string;
  status: BusStatus;
  currentRoute?: string;
}
