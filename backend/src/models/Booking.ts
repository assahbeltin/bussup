export type BookingStatus = 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'MTN' | 'ORANGE' | 'CARD' | 'ON_BOARD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PassengerInfo {
  seatId: string;
  fullName: string;
  phone: string;
  email: string;
  age: string;
}

export interface Booking {
  id: string; // internal UUID or string ID
  ticketNo: string; // e.g. "#TRV-98210" or "#BK-8902"
  userId: string;
  tripId: string;
  agencyName: string;
  fromCity: string;
  fromTerminal: string;
  toCity: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  seatIds: string[]; // e.g. ["14A", "14B"]
  totalAmountFCFA: number;
  totalAmountFormatted: string; // "15,000 FCFA"
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentPhoneOrCard?: string;
  passengers: PassengerInfo[];
  qrPayload: string;
  createdAt: string;
}

export interface CreateBookingDTO {
  tripId: string;
  departureDate: string;
  seats: string[];
  passengers: PassengerInfo[];
  paymentMethod: PaymentMethod;
  paymentAccount?: string; // Phone number for MoMo or Card number
}
