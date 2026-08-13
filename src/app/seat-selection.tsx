import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSeatsApi, holdSeatsApi, releaseSeatsApi, SeatApiItem } from "../services/api";
import { getCurrentUser } from "../services/authStore";

const TOTAL_SEATS = 80;

const generateInitialSeats = (): SeatApiItem[] => {
  const seats: SeatApiItem[] = [];
  const labels = ["A", "B", "C", "D"];
  const rows = TOTAL_SEATS / 4;

  for (let r = 1; r <= rows; r++) {
    labels.forEach((label) => {
      seats.push({
        id: `${r}${label}`,
        row: r,
        label,
        isBooked: false,
      });
    });
  }
  return seats;
};

export default function SeatSelectionScreen() {
  const params = useLocalSearchParams<{
    busId?: string;
    agency?: string;
    from?: string;
    to?: string;
    price?: string;
    depart?: string;
    passenger?: string;
    journeyTime?: string;
  }>();

  const tripId = params.busId || "TRIP-VAT-1";
  const agencyName = params.agency || "Vatican Express";
  const fromCity = params.from || "Douala";
  const toCity = params.to || "Yaoundé";
  const departDate = params.depart || "Today";
  const journeyTime = params.journeyTime || "Morning";
  const unitPrice = parseInt((params.price || "6000").replace(/[^0-9]/g, ""), 10) || 6000;

  const currentUser = getCurrentUser();
  const userId = currentUser.id;

  const [seats, setSeats] = useState<SeatApiItem[]>(generateInitialSeats());
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const selectedSeatsRef = useRef<string[]>([]);
  selectedSeatsRef.current = selectedSeatIds;
  const isProceedingRef = useRef<boolean>(false);

  const loadSeats = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    const res = await getSeatsApi(tripId, departDate, userId);
    if (showLoadingSpinner) setLoading(false);

    if (res.success && res.data && res.data.length > 0) {
      setSeats(res.data);

      // Check if any seat selected by current user was recently booked by another user
      const bookedIds = new Set(res.data.filter((s) => s.isBooked).map((s) => s.id));
      const newlyConflictSeats = selectedSeatsRef.current.filter((id) => bookedIds.has(id));

      if (newlyConflictSeats.length > 0) {
        // Deselect taken seats
        setSelectedSeatIds((prev) => prev.filter((id) => !bookedIds.has(id)));
        Alert.alert(
          "Seat Conflict Detected",
          `Seat(s) ${newlyConflictSeats.join(", ")} were just taken by another passenger for ${departDate}.`
        );
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadSeats(true);

    // Auto Refresh / Polling every 3 seconds to keep seat status synchronized across users
    const timer = setInterval(() => {
      if (isMounted) {
        loadSeats(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (!isProceedingRef.current) {
        releaseSeatsApi(tripId, departDate, undefined, userId);
      }
    };
  }, [tripId, departDate, userId]);

  // Toggle Seat Selection & Real-Time Holds
  const handleSeatPress = async (seat: SeatApiItem) => {
    if (seat.isBooked) {
      Alert.alert(
        "Seat Unavailable",
        `Seat ${seat.id} is already booked or reserved for ${departDate} by another passenger.`
      );
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      // Unselect seat
      const nextSeatIds = selectedSeatIds.filter((id) => id !== seat.id);
      setSelectedSeatIds(nextSeatIds);
      await holdSeatsApi(tripId, departDate, nextSeatIds, userId);
    } else {
      // Select seat
      const nextSeatIds = [...selectedSeatIds, seat.id];
      const holdRes = await holdSeatsApi(tripId, departDate, nextSeatIds, userId);

      if (!holdRes.success) {
        const conflictList = holdRes.conflictSeats?.join(", ") || seat.id;
        Alert.alert(
          "Seat Taken",
          `Seat(s) ${conflictList} was just taken by another passenger.`
        );
        loadSeats(false);
        return;
      }

      setSelectedSeatIds(nextSeatIds);
    }
  };

  const totalPrice = selectedSeatIds.length * unitPrice;

  const handleProceedToPassengerDetails = () => {
    if (selectedSeatIds.length === 0) {
      Alert.alert("No Seat Selected", "Please select at least one seat to proceed.");
      return;
    }

    isProceedingRef.current = true;

    router.push({
      pathname: "../passenger-details",
      params: {
        busId: tripId,
        agency: agencyName,
        from: fromCity,
        to: toCity,
        seats: selectedSeatIds.join(", "),
        seatCount: selectedSeatIds.length,
        totalAmount: `FCFA ${totalPrice.toLocaleString()}`,
        depart: departDate,
        passenger: params.passenger || "Passenger",
        journeyTime,
      },
    });
  };

  // Group seats into rows of 4 for grid rendering
  const rowsCount = TOTAL_SEATS / 4;
  const rowsArray = Array.from({ length: rowsCount }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{agencyName}</Text>
          <Text style={styles.headerSubtitle}>
            {fromCity} → {toCity} • Select Seats
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Legend Indicator */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.seatBox, styles.seatAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.seatBox, styles.seatSelected]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.legendText}>Selected</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.seatBox, styles.seatBooked]}>
            <Ionicons name="close" size={12} color="#94A3B8" />
          </View>
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {/* Bus Layout Body (Scrollable) */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.busFrame}>
          {/* Driver Cabin Indicator */}
          <View style={styles.driverSection}>
            <View style={styles.steeringBadge}>
              <Ionicons name="hardware-chip-outline" size={18} color="#64748B" />
              <Text style={styles.driverText}>DRIVER</Text>
            </View>
            <Text style={styles.doorText}>ENTRANCE</Text>
          </View>

          {/* 80 Seats Grid Render */}
          {rowsArray.map((rowNum) => {
            const rowSeats = seats.filter((s) => s.row === rowNum);
            const leftSeats = rowSeats.slice(0, 2); // A, B
            const rightSeats = rowSeats.slice(2, 4); // C, D

            return (
              <View key={rowNum} style={styles.rowLayout}>
                {/* Row Label Left */}
                <Text style={styles.rowNumberText}>{rowNum}</Text>

                {/* Left Side (Seats A & B) */}
                <View style={styles.seatPair}>
                  {leftSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    return (
                      <TouchableOpacity
                        key={seat.id}
                        activeOpacity={seat.isBooked ? 1 : 0.7}
                        style={[
                          styles.seat,
                          seat.isBooked && styles.seatBooked,
                          isSelected && styles.seatSelected,
                        ]}
                        onPress={() => handleSeatPress(seat)}
                      >
                        <Text
                          style={[
                            styles.seatText,
                            seat.isBooked && styles.seatBookedText,
                            isSelected && styles.seatSelectedText,
                          ]}
                        >
                          {seat.id}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Aisle Spacer */}
                <View style={styles.aisle}>
                  <Text style={styles.aisleText}>AISLE</Text>
                </View>

                {/* Right Side (Seats C & D) */}
                <View style={styles.seatPair}>
                  {rightSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    return (
                      <TouchableOpacity
                        key={seat.id}
                        activeOpacity={seat.isBooked ? 1 : 0.7}
                        style={[
                          styles.seat,
                          seat.isBooked && styles.seatBooked,
                          isSelected && styles.seatSelected,
                        ]}
                        onPress={() => handleSeatPress(seat)}
                      >
                        <Text
                          style={[
                            styles.seatText,
                            seat.isBooked && styles.seatBookedText,
                            isSelected && styles.seatSelectedText,
                          ]}
                        >
                          {seat.id}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Summary Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.seatsSelectedLabel}>
            Seats ({selectedSeatIds.length}):{" "}
            <Text style={styles.selectedListText}>
              {selectedSeatIds.length > 0 ? selectedSeatIds.join(", ") : "None"}
            </Text>
          </Text>
          <Text style={styles.totalPriceText}>
            FCFA {totalPrice.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueBtn,
            selectedSeatIds.length === 0 && styles.disabledBtn,
          ]}
          onPress={handleProceedToPassengerDetails}
          disabled={selectedSeatIds.length === 0}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seatBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  seatAvailable: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  seatSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  seatBooked: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E1",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  busFrame: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  driverSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  steeringBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  driverText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  doorText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowNumberText: {
    width: 20,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textAlign: "center",
  },
  seatPair: {
    flexDirection: "row",
    gap: 8,
  },
  seat: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  seatText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
  },
  seatSelectedText: {
    color: "#FFFFFF",
  },
  seatBookedText: {
    color: "#94A3B8",
  },
  aisle: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  aisleText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#CBD5E1",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  seatsSelectedLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  selectedListText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 2,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  disabledBtn: {
    backgroundColor: "#94A3B8",
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});