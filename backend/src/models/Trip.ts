export type JourneyShift = 'Morning' | 'Afternoon' | 'Night';

export interface Trip {
  id: string; // e.g. "TRIP-1"
  busId: string;
  agencyName: string;
  rating: number;
  reviewsCount: number;
  fromCity: string;
  fromTerminal: string;
  toCity: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busType: string;
  priceFCFA: number;
  priceFormatted: string; // "FCFA 6,000"
  journeyShift: JourneyShift;
  amenities: string[];
}

export interface SeatStatus {
  id: string; // e.g. "1A", "3C"
  row: number;
  label: string; // 'A', 'B', 'C', 'D'
  isBooked: boolean;
}
