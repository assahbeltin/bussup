import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Interface for Bus object
interface BusItem {
  id: string;
  agency: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  departureStation: string;
  arrivalStation: string;
  price: string;
  occupiedSeats: number[];
}

// Sample Available Buses Data
const SAMPLE_BUSES: BusItem[] = [
  {
    id: "bus_101",
    agency: "Busup VIP",
    departureTime: "10:30",
    arrivalTime: "19:00",
    duration: "8h 30m",
    departureStation: "Yaoundé Express",
    arrivalStation: "Douala Central",
    price: "7,500 XAF",
    occupiedSeats: [3, 4, 12, 15, 16, 22, 23, 40, 41, 55, 60, 78],
  },
  {
    id: "bus_102",
    agency: "Busup Executive",
    departureTime: "15:30",
    arrivalTime: "23:50",
    duration: "8h 20m",
    departureStation: "Yaoundé Express",
    arrivalStation: "Douala Central",
    price: "8,000 XAF",
    occupiedSeats: [1, 2, 5, 8, 19, 20, 31, 32, 65, 66, 79, 80],
  },
  {
    id: "bus_103",
    agency: "Busup Night Line",
    departureTime: "21:00",
    arrivalTime: "05:15",
    duration: "8h 15m",
    departureStation: "Yaoundé Express",
    arrivalStation: "Douala Central",
    price: "7,000 XAF",
    occupiedSeats: [10, 11, 14, 25, 26, 37, 38, 49, 50, 70],
  },
];

// Generate 80 seats array
const TOTAL_SEATS = 80;
const ALL_SEATS = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);

export default function AvailableBusesScreen() {
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    depart?: string;
    passenger?: string;
    journeyTime?: string;
  }>();

  // Selected Bus & Modal State
  const [selectedBus, setSelectedBus] = useState<BusItem | null>(null);
  const [seatModalVisible, setSeatModalVisible] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [chosenSeat, setChosenSeat] = useState<number | null>(null);

  // Dynamic Occupied Seats state for local seat locking
  const [busySeatsMap, setBusySeatsMap] = useState<Record<string, number[]>>({
    bus_101: SAMPLE_BUSES[0].occupiedSeats,
    bus_102: SAMPLE_BUSES[1].occupiedSeats,
    bus_103: SAMPLE_BUSES[2].occupiedSeats,
  });

  // Open Seat Selection Modal
  const handleOpenSeatPicker = (bus: BusItem) => {
    setSelectedBus(bus);
    setChosenSeat(null);
    setSeatModalVisible(true);
  };

  // Handle Seat Tap
  const handleSelectSeat = (seatNum: number, isTaken: boolean) => {
    if (isTaken) {
      Alert.alert("Seat Unavailable", `Seat #${seatNum} is already booked and cannot be chosen.`);
      return;
    }
    setChosenSeat(seatNum);
  };

  // Confirm Seat and Lock it in State -> Shows "Seat Secured" Pop-up
  const handleConfirmSeat = () => {
    if (!chosenSeat || !selectedBus) return;

    setBusySeatsMap((prev) => ({
      ...prev,
      [selectedBus.id]: [...(prev[selectedBus.id] || []), chosenSeat],
    }));

    setSeatModalVisible(false);
    setSuccessModalVisible(true);
  };

  // Proceed to Checkout from Success Pop-up
  const handleProceedToCheckout = () => {
    setSuccessModalVisible(false);
    if (!selectedBus || !chosenSeat) return;

    router.push({
      pathname: "../checkout",
      params: {
        busId: selectedBus.id,
        agency: selectedBus.agency,
        seatNumber: chosenSeat,
        price: selectedBus.price,
        from: params.from || "Yaoundé",
        to: params.to || "Douala",
        passenger: params.passenger || "Passenger",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.appTitle}>Available Buses</Text>
          <Text style={styles.appSubtitle}>
            {params.from || "Origin"} ➔ {params.to || "Destination"}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Sub-Header Route Banner */}
        <View style={styles.routeBanner}>
          <Text style={styles.routeBannerTitle}>Select Your Trip</Text>
          <Text style={styles.routeBannerSub}>
            {params.depart || "Today"} • {params.journeyTime || "Morning"} Journey
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Bus Cards List */}
          {SAMPLE_BUSES.map((bus) => {
            const currentTakenSeats = busySeatsMap[bus.id] || [];
            const remainingSeats = TOTAL_SEATS - currentTakenSeats.length;

            return (
              <View key={bus.id} style={styles.busCard}>
                {/* Agency Tag */}
                <View style={styles.agencyRow}>
                  <View style={styles.agencyBadge}>
                    <Ionicons name="bus-outline" size={14} color="#2563EB" />
                    <Text style={styles.agencyName}>{bus.agency}</Text>
                  </View>
                  <Text style={styles.seatsLeftText}>{remainingSeats} / 80 Seats Free</Text>
                </View>

                {/* Schedule Info */}
                <View style={styles.scheduleRow}>
                  <View>
                    <Text style={styles.timeLabel}>Departure</Text>
                    <Text style={styles.timeValue}>{bus.departureTime}</Text>
                    <Text style={styles.stationText}>{bus.departureStation}</Text>
                  </View>

                  <View style={styles.durationContainer}>
                    <Text style={styles.durationText}>{bus.duration}</Text>
                    <View style={styles.arrowLine}>
                      <View style={styles.dot} />
                      <View style={styles.line} />
                      <Ionicons name="chevron-forward" size={12} color="#2563EB" />
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.timeLabel}>Arrival</Text>
                    <Text style={styles.timeValue}>{bus.arrivalTime}</Text>
                    <Text style={styles.stationText}>{bus.arrivalStation}</Text>
                  </View>
                </View>

                {/* Price & Select Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.priceText}>{bus.price}</Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.selectBtn}
                    onPress={() => handleOpenSeatPicker(bus)}
                  >
                    <Text style={styles.selectBtnText}>Select Seat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ---------------- 80-SEAT SELECTION POPUP MODAL ---------------- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={seatModalVisible}
        onRequestClose={() => setSeatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose a Seat</Text>
                <Text style={styles.modalSub}>{selectedBus?.agency} (80 Seats)</Text>
              </View>
              <TouchableOpacity onPress={() => setSeatModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Seat Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.seatLegendBox, styles.seatAvailable]} />
                <Text style={styles.legendText}>Available</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.seatLegendBox, styles.seatSelected]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.seatLegendBox, styles.seatOccupied]}>
                  <Ionicons name="lock-closed" size={10} color="#94A3B8" />
                </View>
                <Text style={styles.legendText}>Taken</Text>
              </View>
            </View>

            {/* Bus Layout Front Indicator */}
            <View style={styles.driverSection}>
              <Ionicons name="hardware-chip-outline" size={16} color="#2563EB" />
              <Text style={styles.driverText}>FRONT / DRIVER CABIN</Text>
            </View>

            {/* 80 Seats Grid List */}
            <FlatList
              data={ALL_SEATS}
              keyExtractor={(item) => item.toString()}
              numColumns={4}
              contentContainerStyle={styles.seatGridContainer}
              columnWrapperStyle={styles.seatColumnWrapper}
              renderItem={({ item: seatNum }) => {
                const currentTaken = selectedBus ? busySeatsMap[selectedBus.id] || [] : [];
                const isTaken = currentTaken.includes(seatNum);
                const isSelected = chosenSeat === seatNum;
                const isAisle = seatNum % 4 === 2;

                return (
                  <TouchableOpacity
                    disabled={isTaken}
                    activeOpacity={0.7}
                    onPress={() => handleSelectSeat(seatNum, isTaken)}
                    style={[
                      styles.seatBox,
                      isTaken && styles.seatOccupied,
                      isSelected && styles.seatSelected,
                      isAisle && { marginRight: 20 },
                    ]}
                  >
                    {isTaken ? (
                      <Ionicons name="lock-closed" size={12} color="#94A3B8" />
                    ) : (
                      <Text
                        style={[
                          styles.seatNumber,
                          isSelected && styles.selectedSeatNumber,
                        ]}
                      >
                        {seatNum}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* Modal Bottom Confirm Button */}
            <TouchableOpacity
              disabled={!chosenSeat}
              onPress={handleConfirmSeat}
              activeOpacity={0.85}
              style={[styles.confirmBtn, !chosenSeat && styles.disabledBtn]}
            >
              <Text style={styles.confirmBtnText}>
                {chosenSeat ? `Confirm Seat #${chosenSeat}` : "Tap a Seat to Select"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------------- "SEAT SECURED!" POPUP MODAL ---------------- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Ionicons name="checkmark-circle" size={54} color="#10B981" />
            </View>

            <Text style={styles.successTitle}>Seat Secured!</Text>
            <Text style={styles.successSubtitle}>
              Your seat has been reserved and locked in.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bus Agency:</Text>
                <Text style={styles.summaryValue}>{selectedBus?.agency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Seat Number:</Text>
                <Text style={[styles.summaryValue, { color: "#2563EB", fontSize: 16 }]}>
                  #{chosenSeat}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Departure:</Text>
                <Text style={styles.summaryValue}>{selectedBus?.departureTime}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleProceedToCheckout}
              activeOpacity={0.85}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#2563EB",
  },
  backBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  appSubtitle: {
    color: "#DBEAFE",
    fontSize: 11,
    marginTop: 1,
  },
  notificationBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  routeBanner: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeBannerTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },
  routeBannerSub: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  agencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  agencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  agencyName: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },
  seatsLeftText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "700",
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  timeLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
  },
  timeValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginVertical: 1,
  },
  stationText: {
    color: "#64748B",
    fontSize: 11,
  },
  durationContainer: {
    alignItems: "center",
  },
  durationText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  arrowLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2563EB",
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: "#BFDBFE",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  priceText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  selectBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  /* SEAT PICKER MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  modalSub: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seatLegendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  legendText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  driverText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  seatGridContainer: {
    paddingBottom: 10,
  },
  seatColumnWrapper: {
    justifyContent: "center",
    marginBottom: 8,
  },
  seatBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  seatAvailable: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  seatOccupied: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },
  seatSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  seatNumber: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "700",
  },
  selectedSeatNumber: {
    color: "#FFFFFF",
  },
  confirmBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  disabledBtn: {
    backgroundColor: "#94A3B8",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* SUCCESS MODAL STYLES */
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  successIconBox: {
    marginBottom: 10,
  },
  successTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  successSubtitle: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 12,
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
});