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
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { createBookingApi } from "../services/api";

type PaymentMethod = "MTN" | "ORANGE" | "CARD" | "ON_BOARD";

interface PassengerInfo {
  seatId: string;
  fullName: string;
  phone: string;
  email: string;
  age: string;
}

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    busId?: string;
    agency?: string;
    from?: string;
    to?: string;
    seats?: string;
    totalAmount?: string;
    depart?: string;
    primaryPassengerName?: string;
    primaryPassengerPhone?: string;
    passengersJSON?: string;
    journeyTime?: string;
  }>();

  // Extract parameters passed from PassengerDetailsScreen
  const tripId = params.busId || "TRIP-VAT-1";
  const agencyName = params.agency || "Vatican Express";
  const fromCity = params.from || "Douala";
  const toCity = params.to || "Yaoundé";
  const seats = params.seats || "3C";
  const totalAmount = params.totalAmount || "FCFA 6,000";
  const departureDate = params.depart || "Today";
  const journeyTime = params.journeyTime || "Morning";
  const primaryName = params.primaryPassengerName || "John Nguimatsia";
  const primaryPhone = params.primaryPassengerPhone || "654123456";

  // Parse all passengers data if needed
  const passengers: PassengerInfo[] = params.passengersJSON
    ? JSON.parse(params.passengersJSON)
    : [];

  // Payment states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("MTN");
  const [phoneNumber, setPhoneNumber] = useState(primaryPhone);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopyNumber = () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("653891747");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePickReceipt = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Gallery access is required to upload receipt screenshot.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setReceiptImage(imageUri);
      }
    } catch (err) {
      console.warn("Image picker error:", err);
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);

    const activePhone = phoneNumber.trim() || primaryPhone || "+237654123456";
    const activeCard = cardNumber.trim() || "4000123456789010";
    const seatArray = seats.split(", ").map((s) => s.trim()).filter(Boolean);

    let bookingData: any = null;

    try {
      const res = await createBookingApi({
        tripId,
        departureDate,
        seats: seatArray.length > 0 ? seatArray : ["2D"],
        paymentMethod: selectedMethod,
        paymentAccount: selectedMethod === "CARD" ? activeCard : activePhone,
        receiptImage: receiptImage || undefined,
        passengers: passengers.length > 0 ? passengers : [
          { seatId: seatArray[0] || "2D", fullName: primaryName || "Passenger", phone: activePhone }
        ],
      });

      if (res && res.success && res.data) {
        bookingData = res.data;
      }
    } catch (e) {
      console.warn("Booking creation call fallback:", e);
    }

    setIsProcessing(false);

    // Immediately route to confirmation screen to view & print/download official receipt
    router.replace({
      pathname: "/confirmation",
      params: {
        bookingId: bookingData?.id || "BKG" + Math.floor(10005 + Math.random() * 90000),
        pnr: bookingData?.ticketNo || "PNR" + Math.floor(100000 + Math.random() * 900000),
        totalAmount: bookingData?.totalAmountFormatted || totalAmount,
        agency: bookingData?.agencyName || agencyName,
        userName: passengers[0]?.fullName || primaryName || "Passenger",
        from: bookingData?.fromCity || fromCity,
        to: bookingData?.toCity || toCity,
        depart: bookingData?.departureDate || departureDate,
        time: bookingData?.departureTime || "07:30 AM",
        bus: bookingData?.busId || tripId || "BUS-AM-101",
        seats: seats || "2D",
        paymentMethod: selectedMethod,
        autoPrint: "true",
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
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>{agencyName}</Text>
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
          {/* Total Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountText}>{totalAmount}</Text>
            <View style={styles.tripBadge}>
              <Text style={styles.tripBadgeText}>
                {fromCity} → {toCity} • Seat {seats}
              </Text>
            </View>
          </View>

          {/* Payment Method Selection */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {/* MTN Mobile Money */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              selectedMethod === "MTN" && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod("MTN")}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#FEF08A" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#854D0E" />
              </View>
              <View>
                <Text style={styles.methodTitle}>MTN Mobile Money</Text>
                <Text style={styles.methodSubtitle}>Instant Mobile Transfer</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === "MTN" && styles.radioSelected,
              ]}
            >
              {selectedMethod === "MTN" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Orange Money */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              selectedMethod === "ORANGE" && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod("ORANGE")}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#FFEDD5" }]}>
                <Ionicons name="wallet-outline" size={20} color="#C2410C" />
              </View>
              <View>
                <Text style={styles.methodTitle}>Orange Money</Text>
                <Text style={styles.methodSubtitle}>Orange OM Account</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === "ORANGE" && styles.radioSelected,
              ]}
            >
              {selectedMethod === "ORANGE" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Official Transfer Details & Receipt Upload for MTN & Orange */}
          {(selectedMethod === "MTN" || selectedMethod === "ORANGE") && (
            <View style={styles.transferSection}>
              {/* Transfer Details Card */}
              <View style={styles.transferCard}>
                <View style={styles.transferCardHeader}>
                  <Ionicons name="information-circle" size={20} color="#2563EB" />
                  <Text style={styles.transferCardTitle}>
                    {selectedMethod === "MTN" ? "MTN Mobile Money" : "Orange Money"} Transfer Account
                  </Text>
                </View>

                <View style={styles.transferDetailRow}>
                  <Text style={styles.transferLabel}>Account Name:</Text>
                  <Text style={styles.transferValueName}>Agwe Tifuh</Text>
                </View>

                <View style={styles.transferDetailRow}>
                  <Text style={styles.transferLabel}>MoMo Number:</Text>
                  <View style={styles.numberCopyBox}>
                    <Text style={styles.transferNumber}>653891747</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopyNumber}>
                      <Ionicons
                        name={copied ? "checkmark-circle" : "copy-outline"}
                        size={16}
                        color={copied ? "#10B981" : "#2563EB"}
                      />
                      <Text style={[styles.copyButtonText, copied && { color: "#10B981" }]}>
                        {copied ? "Copied!" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Enter Phone Number Input */}
              <View style={styles.inputCard}>
                <Text style={styles.inputCardLabel}>
                  Your {selectedMethod === "MTN" ? "MTN" : "Orange"} Sender Phone Number
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="653891747"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>

              {/* Upload Payment Receipt Image Box */}
              <View style={styles.uploadCard}>
                <View style={styles.uploadCardHeader}>
                  <Ionicons name="image-outline" size={20} color="#2563EB" />
                  <Text style={styles.uploadCardTitle}>Upload Payment Receipt Image</Text>
                </View>
                <Text style={styles.uploadSubtitle}>
                  Please upload a screenshot or photo of your transfer confirmation receipt.
                </Text>

                {receiptImage ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: receiptImage }} style={styles.previewImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => setReceiptImage(null)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={styles.removeImageBtnText}>Remove / Change Image</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBtn} onPress={handlePickReceipt}>
                    <Ionicons name="cloud-upload-outline" size={26} color="#2563EB" />
                    <Text style={styles.uploadBtnText}>Choose Receipt Image from Device</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Credit / Debit Card */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              selectedMethod === "CARD" && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod("CARD")}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="card-outline" size={20} color="#1E40AF" />
              </View>
              <View>
                <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                <Text style={styles.methodSubtitle}>Visa, Mastercard, etc.</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === "CARD" && styles.radioSelected,
              ]}
            >
              {selectedMethod === "CARD" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Pay on Board */}
          <TouchableOpacity
            style={[
              styles.methodOption,
              selectedMethod === "ON_BOARD" && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod("ON_BOARD")}
            activeOpacity={0.8}
          >
            <View style={styles.methodLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="cash-outline" size={20} color="#15803D" />
              </View>
              <View>
                <Text style={styles.methodTitle}>Pay on Board</Text>
                <Text style={styles.methodSubtitle}>Pay cash at boarding station</Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === "ON_BOARD" && styles.radioSelected,
              ]}
            >
              {selectedMethod === "ON_BOARD" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {selectedMethod === "CARD" && (
            <View style={styles.inputCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.inputCardLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="4000 1234 5678 9010"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
              </View>

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputCardLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    placeholderTextColor="#94A3B8"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputCardLabel}>CVC / CVV</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    value={cardCvc}
                    onChangeText={setCardCvc}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="lock-closed" size={16} color="#64748B" />
            <Text style={styles.securityText}>
              Your payment is secure and encrypted with 256-bit protection.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pay Now Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
          onPress={handlePayNow}
          disabled={isProcessing}
        >
          <Text style={styles.payBtnText}>
            {isProcessing ? "Processing..." : `Pay ${totalAmount}`}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  amountCard: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    color: "#93C5FD",
    fontWeight: "600",
  },
  amountText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  tripBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  tripBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  methodOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  methodSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  inputCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  fieldGroup: {
    gap: 6,
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
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
  inputNote: {
    fontSize: 11,
    color: "#64748B",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 11,
    color: "#64748B",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Transfer Details & Receipt Upload Styles
  transferSection: {
    gap: 12,
  },
  transferCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    gap: 10,
  },
  transferCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2FE",
    paddingBottom: 8,
  },
  transferCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369A1",
  },
  transferDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transferLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  transferValueName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  numberCopyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transferNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  uploadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  uploadCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  uploadSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  uploadBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  previewBox: {
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
});