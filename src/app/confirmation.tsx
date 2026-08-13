import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{
    bookingId?: string;
    pnr?: string;
    agency?: string;
    userName?: string;
    seats?: string;
    bus?: string;
    depart?: string;
    time?: string;
    from?: string;
    to?: string;
    totalAmount?: string;
    paymentMethod?: string;
    autoPrint?: string;
    journeyTime?: string;
  }>();

  const agencyName = params.agency || "Vatican Express";
  const passengerName = params.userName || "Jean Dupont";
  const seatNumbers = params.seats || "1A, 1B";
  const busDetails = params.bus || "BUS-VAT-101 (VIP Luxury Line)";
  const departureDate = params.depart || "Today";
  const departureTime = params.time || "07:30 AM";
  const journeyTime = params.journeyTime || "Morning";
  const fromCity = params.from || "Douala";
  const toCity = params.to || "Yaoundé";
  const amountPaid = params.totalAmount || "FCFA 12,000";
  const pnrNumber = params.pnr || "PNR-" + Math.floor(100000 + Math.random() * 900000);
  const paymentMethod = params.paymentMethod || "MTN Mobile Money";

  const handlePrint = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      Alert.alert(
        "Download / Print Receipt",
        `Receipt for ${passengerName} (${pnrNumber}) has been generated and ready for print/download.`
      );
    }
  };

  useEffect(() => {
    if (params.autoPrint === "true") {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [params.autoPrint]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "web" && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none !important; shadow: none !important; }
            }
          `
        }} />
      )}

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(tabs)/home")}>
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Booking Confirmation</Text>
          <Text style={styles.headerSubtitle}>Official Ticket Receipt</Text>
        </View>

        <TouchableOpacity style={styles.printHeaderBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.checkIconBadge}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your bus reservation with {agencyName} has been confirmed.
          </Text>
        </View>

        {/* Official Ticket Receipt Card */}
        <View style={styles.ticketCard} id="printable-receipt">
          {/* Receipt Top Agency Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.agencyBadgeRow}>
              <View style={styles.busIconBox}>
                <Ionicons name="bus" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.agencyTitle}>{agencyName}</Text>
                <Text style={styles.agencySubtext}>Official Travel Receipt</Text>
              </View>
            </View>

            <View style={styles.pnrBadge}>
              <Text style={styles.pnrLabel}>TICKET / PNR</Text>
              <Text style={styles.pnrValue}>{pnrNumber}</Text>
            </View>
          </View>

          <View style={styles.dividerDashed} />

          {/* Passenger & Route Grid */}
          <View style={styles.gridSection}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>PASSENGER NAME</Text>
                <Text style={styles.fieldValueBold}>{passengerName}</Text>
              </View>
              <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
                <Text style={styles.fieldLabel}>SEAT NUMBER(S)</Text>
                <Text style={styles.fieldValueBadge}>{seatNumbers}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>ROUTE</Text>
                <Text style={styles.fieldValue}>{fromCity} → {toCity}</Text>
              </View>
              <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
                <Text style={styles.fieldLabel}>DEPARTURE DATE</Text>
                <Text style={styles.fieldValue}>{departureDate}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>DEPARTURE TIME</Text>
                <Text style={styles.fieldValueBold}>{departureTime}</Text>
              </View>
              <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
                <Text style={styles.fieldLabel}>JOURNEY TIME</Text>
                <Text style={styles.fieldValueBold}>{journeyTime}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>ASSIGNED BUS</Text>
                <Text style={styles.fieldValue}>{busDetails}</Text>
              </View>
              <View style={[styles.gridItem, { alignItems: "flex-end" }]}>
                <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
                <Text style={styles.fieldValue}>{paymentMethod}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>AMOUNT PAID</Text>
                <Text style={styles.amountPaidValue}>{amountPaid}</Text>
              </View>
              <View style={[styles.gridItem, { alignItems: "flex-end" }]} />
            </View>
          </View>

          <View style={styles.dividerDashed} />

          {/* QR Code Payload Simulation */}
          <View style={styles.qrSection}>
            <View style={styles.qrCodeBox}>
              <Ionicons name="qr-code-outline" size={68} color="#0F172A" />
            </View>
            <View style={styles.qrInfoBlock}>
              <Text style={styles.qrTitle}>BOARDING QR CODE</Text>
              <Text style={styles.qrSubtitle}>
                Show this barcode to the driver at the terminal when boarding.
              </Text>
              <Text style={styles.statusConfirmed}>STATUS: VERIFIED & CONFIRMED</Text>
            </View>
          </View>

          {/* Warm Satisfying Welcome Message */}
          <View style={styles.welcomeBox}>
            <Ionicons name="heart" size={20} color="#E11D48" style={{ marginBottom: 4 }} />
            <Text style={styles.welcomeHeading}>Welcome Aboard!</Text>
            <Text style={styles.welcomeBody}>
              Thank you for choosing <Text style={{ fontWeight: "700" }}>{agencyName}</Text>! We are honored to serve you. Sit back, relax, and enjoy a safe, luxurious, and comfortable journey. We wish you a pleasant trip!
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.printMainBtn} onPress={handlePrint}>
            <Ionicons name="print" size={18} color="#FFFFFF" />
            <Text style={styles.printMainBtnText}>Print / Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)/my-bookings")}
          >
            <Ionicons name="ticket-outline" size={18} color="#2563EB" />
            <Text style={styles.secondaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  printHeaderBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // Success Banner
  successBanner: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  checkIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },

  // Ticket Receipt Card
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  agencyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  busIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  agencyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  agencySubtext: {
    fontSize: 11,
    color: "#64748B",
  },
  pnrBadge: {
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pnrLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
  },
  pnrValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },
  dividerDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },

  // Grid Info
  gridSection: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  fieldValueBold: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  fieldValueBadge: {
    fontSize: 13,
    fontWeight: "800",
    color: "#10B981",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  amountPaidValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
  },

  // QR Section
  qrSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  qrCodeBox: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  qrInfoBlock: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  qrSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 6,
  },
  statusConfirmed: {
    fontSize: 10,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 0.5,
  },

  // Welcome Box
  welcomeBox: {
    backgroundColor: "#FFF1F2",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECDD3",
    alignItems: "center",
  },
  welcomeHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#BE123C",
    marginBottom: 4,
  },
  welcomeBody: {
    fontSize: 12,
    color: "#9F1239",
    textAlign: "center",
    lineHeight: 18,
  },

  // Action Buttons
  actionButtonsContainer: {
    gap: 10,
    marginTop: 8,
  },
  printMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  printMainBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  secondaryBtnText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
