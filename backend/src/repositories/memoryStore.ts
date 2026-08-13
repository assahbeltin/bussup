import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Bus } from '../models/Bus';
import { Trip } from '../models/Trip';
import { Booking } from '../models/Booking';
import { City } from '../models/City';

export interface SeatHold {
  tripId: string;
  departureDate: string;
  seatId: string;
  userId: string;
  expiresAt: number;
}

class MemoryStore {
  public users: User[] = [];
  public buses: Bus[] = [];
  public trips: Trip[] = [];
  public bookings: Booking[] = [];
  public cities: City[] = [];
  public seatHolds: SeatHold[] = [];

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const salt = bcrypt.genSaltSync(10);

    // Seed Users
    this.users = [
      {
        id: 'usr-admin-1',
        fullName: 'System Admin',
        email: 'admin@busup.com',
        phone: '+237654321000',
        passwordHash: bcrypt.hashSync('admin123', salt),
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-pass-1',
        fullName: 'Jean Dupont',
        email: 'jean@example.com',
        phone: '+237654123456',
        passwordHash: bcrypt.hashSync('password123', salt),
        role: 'passenger',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-pass-2',
        fullName: 'Marie Sissoko',
        email: 'marie@example.com',
        phone: '+237699887766',
        passwordHash: bcrypt.hashSync('password123', salt),
        role: 'passenger',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed Cities
    this.cities = [
      {
        id: 'city-douala',
        name: 'Douala',
        region: 'Littoral',
        popularTerminals: [
          { id: 'term-dla-1', name: 'Village Carrefour Terminal', address: 'Carrefour Village, Douala' },
          { id: 'term-dla-2', name: 'Akwa Agency Terminal', address: 'Boulevard de la Liberté, Akwa' },
          { id: 'term-dla-3', name: 'Vatican Express Akwa Terminal', address: 'Akwa Centre, Douala' },
        ],
      },
      {
        id: 'city-yaounde',
        name: 'Yaoundé',
        region: 'Centre',
        popularTerminals: [
          { id: 'term-yde-1', name: 'Mvan Terminal', address: 'Mvan, Yaoundé' },
          { id: 'term-yde-2', name: 'Vatican Express Terminal', address: 'Mvan Agency, Yaoundé' },
          { id: 'term-yde-3', name: 'Biyem-Assi Central Station', address: 'Biyem-Assi, Yaoundé' },
        ],
      },
      {
        id: 'city-bamenda',
        name: 'Bamenda',
        region: 'North West',
        popularTerminals: [
          { id: 'term-bda-1', name: 'Vatican Main Station', address: 'Commercial Avenue, Bamenda' },
          { id: 'term-bda-2', name: 'Up Station Bus Terminal', address: 'Up Station, Bamenda' },
        ],
      },
      {
        id: 'city-bafoussam',
        name: 'Bafoussam',
        region: 'West',
        popularTerminals: [
          { id: 'term-bfm-1', name: 'Marché A Terminal', address: 'Centre Ville, Bafoussam' },
        ],
      },
      {
        id: 'city-kribi',
        name: 'Kribi',
        region: 'South',
        popularTerminals: [
          { id: 'term-krb-1', name: 'Kribi Central Station', address: 'Beachfront Road, Kribi' },
        ],
      },
      {
        id: 'city-garoua',
        name: 'Garoua',
        region: 'North',
        popularTerminals: [
          { id: 'term-gra-1', name: 'Garoua Main Station', address: 'Avenue de la Gare, Garoua' },
        ],
      },
      {
        id: 'city-maroua',
        name: 'Maroua',
        region: 'Far North',
        popularTerminals: [
          { id: 'term-mra-1', name: 'Maroua Central Terminal', address: 'Grand Marché, Maroua' },
        ],
      },
    ];

    // Seed Buses (Start Clean for Admin Registration)
    this.buses = [];

    // Seed Trips (Start Clean for Admin Registration)
    this.trips = [];

    // Seed Bookings (Start Clean for Admin Registration)
    this.bookings = [];
  }
}

export const memoryStore = new MemoryStore();
