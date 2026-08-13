import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface PassengerInfo {
  seatId: string;
  fullName: string;
  phone: string;
  email: string;
  age: string;
}

export default function PassengerDetailsScreen() {
  const params = useLocalSearchParams<{
    busId?: string;
    agency?: string;
    from?: string;
    to?: string;
    seats?: string;
    seatCount?: string;
    totalAmount?: string;
    depart?: string;
    journeyTime?: string;
  }>();

  const tripId = params.busId || "TRIP-VAT-1";
  const agencyName = params.agency || "Vatican Express";
  const fromCity = params.from || "Douala";
  const toCity = params.to || "Yaoundé";
  const seatList = params.seats ? params.seats.split(", ") : ["3C"];
  const totalAmount = params.totalAmount || "FCFA 6,000";
  const departureDate = params.depart || "Today";
  const journeyTime = params.journeyTime || "Morning";

  // Initialize form state for each selected seat
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    seatList.map((seatId) => ({
      seatId,
      fullName: "",
      phone: "",
      email: "",
      age: "25",
    }))
  );

  const handleInputChange = (
    index: number,
    field: keyof PassengerInfo,
    value: string
  ) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleProceedToPayment = () => {
    // Form Validation: Ensure information is filled out
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName.trim() || !p.phone.trim()) {
        Alert.alert("Missing Information", "Please fill your information.");
        return;
      }
    }

    // Route to Payment Screen with absolute route path & full details
    router.push({
      pathname: "/payment",
      params: {
        busId: tripId,
        agency: agencyName,
        from: fromCity,
        to: toCity,
        seats: seatList.join(", "),
        totalAmount,
        depart: departureDate,
        primaryPassengerName: passengers[0]?.fullName ?? "",
        primaryPassengerPhone: passengers[0]?.phone ?? "",
        passengersJSON: JSON.stringify(passengers),
        journeyTime,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Passenger Details</Text>
          <Text style={styles.headerSubtitle}>
            {fromCity} → {toCity} • {seatList.length} Passenger(s)
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>ROUTE</Text>
                <Text style={styles.summaryVal}>
                  {fromCity} → {toCity}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.summaryLabel}>DATE</Text>
                <Text style={styles.summaryVal}>{departureDate}</Text>
              </View>
            </View>
          </View>

          {/* Passenger Input Cards */}
          {passengers.map((passenger, index) => (
            <View key={passenger.seatId} style={styles.passengerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.seatBadge}>
                  <Ionicons name="person" size={14} color="#2563EB" />
                  <Text style={styles.seatBadgeText}>
                    Seat {passenger.seatId} {index === 0 ? "(Primary)" : ""}
                  </Text>
                </View>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. John Nguimatsia"
                  placeholderTextColor="#94A3B8"
                  value={passenger.fullName}
                  onChangeText={(val) => handleInputChange(index, "fullName", val)}
                />
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+237 654 123 456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={passenger.phone}
                  onChangeText={(val) => handleInputChange(index, "phone", val)}
                />
              </View>

              {/* Email Input (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="john@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={passenger.email}
                  onChangeText={(val) => handleInputChange(index, "email", val)}
                />
              </View>
            </View>
          ))}

          {/* Boarding & Dropping Point Info */}
          <View style={styles.pointCard}>
            <View style={styles.pointRow}>
              <Ionicons name="location" size={20} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.pointLabel}>Boarding Point</Text>
                <Text style={styles.pointTitle}>{fromCity} Main Station</Text>
              </View>
              <Text style={styles.pointTime}>08:00 AM</Text>
            </View>

            <View style={styles.pointDivider} />

            <View style={styles.pointRow}>
              <Ionicons name="location-outline" size={20} color="#EF4444" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.pointLabel}>Dropping Point</Text>
                <Text style={styles.pointTitle}>{toCity} Mfoumdi</Text>
              </View>
              <Text style={styles.pointTime}>12:30 PM</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.fareLabel}>Total Fare</Text>
          <Text style={styles.totalPriceText}>{totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
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
  scrollContainer: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3B82F6",
    letterSpacing: 0.5,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
    marginTop: 2,
  },
  passengerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  seatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
  },
  inputGroup: {
    gap: 6,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  pointCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  pointTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  pointTime: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  pointDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
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
  fareLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
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
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});