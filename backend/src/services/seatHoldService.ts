import { memoryStore, SeatHold } from '../repositories/memoryStore';
import { bookingRepository } from '../repositories/bookingRepository';

const HOLD_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class SeatHoldService {
  private pruneExpired(): void {
    const now = Date.now();
    memoryStore.seatHolds = memoryStore.seatHolds.filter((hold) => hold.expiresAt >= now);
  }

  public getActiveHolds(tripId: string, departureDate: string, excludeUserId?: string): SeatHold[] {
    this.pruneExpired();
    return memoryStore.seatHolds.filter((hold) => {
      if (hold.tripId !== tripId || hold.departureDate !== departureDate) {
        return false;
      }
      if (excludeUserId && hold.userId === excludeUserId) {
        return false;
      }
      return true;
    });
  }

  public async holdSeats(
    tripId: string,
    departureDate: string,
    seatIds: string[],
    userId: string
  ): Promise<{ success: boolean; conflictSeats?: string[] }> {
    this.pruneExpired();

    // Check committed bookings
    const bookedSeatIds = await bookingRepository.findBookedSeatsForTrip(tripId, departureDate);

    // Check active holds by different users
    const activeOtherHolds = this.getActiveHolds(tripId, departureDate, userId);
    const heldByOthers = new Set(activeOtherHolds.map((h) => h.seatId));

    const conflictSeats: string[] = [];
    for (const seatId of seatIds) {
      if (bookedSeatIds.includes(seatId) || heldByOthers.has(seatId)) {
        conflictSeats.push(seatId);
      }
    }

    if (conflictSeats.length > 0) {
      return { success: false, conflictSeats };
    }

    // Replace current user's holds for this trip and date
    memoryStore.seatHolds = memoryStore.seatHolds.filter(
      (hold) => !(hold.tripId === tripId && hold.departureDate === departureDate && hold.userId === userId)
    );

    const now = Date.now();
    for (const seatId of seatIds) {
      memoryStore.seatHolds.push({
        tripId,
        departureDate,
        seatId,
        userId,
        expiresAt: now + HOLD_TTL_MS,
      });
    }

    return { success: true };
  }

  public releaseSeats(
    tripId: string,
    departureDate: string,
    seatIds?: string[],
    userId?: string
  ): { success: boolean } {
    this.pruneExpired();

    memoryStore.seatHolds = memoryStore.seatHolds.filter((hold) => {
      const isTargetTripAndDate = hold.tripId === tripId && hold.departureDate === departureDate;
      if (!isTargetTripAndDate) {
        return true;
      }

      if (userId && hold.userId !== userId) {
        return true;
      }

      if (!seatIds || seatIds.length === 0) {
        // Release ALL holds for this user on this trip & date
        return false;
      }

      // Release specific seatIds
      return !seatIds.includes(hold.seatId);
    });

    return { success: true };
  }
}

export const seatHoldService = new SeatHoldService();
