import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  TextInput,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { getCurrentUser, subscribeAuth } from "../../services/authStore";

// Safe fallback image if an individual image is missing
const fallbackImage = require("@/assets/images/city1.jpg");

const safeRequire = (path: any) => {
  try {
    return path;
  } catch (e) {
    return fallbackImage;
  }
};

// 10 Regions of Cameroon
const REGIONS_OF_CAMEROON = [
  { id: "1", name: "Center (Yaoundé)", image: safeRequire(require("@/assets/images/city1.jpg")) },
  { id: "2", name: "Littoral (Douala)", image: safeRequire(require("@/assets/images/city2.jpg")) },
  { id: "3", name: "West (Bafoussam)", image: safeRequire(require("@/assets/images/city3.jpg")) },
  { id: "4", name: "North West (Bamenda)", image: safeRequire(require("@/assets/images/city4.jpg")) },
  { id: "5", name: "South West (Buea)", image: safeRequire(require("@/assets/images/city5.jpg")) },
  { id: "6", name: "South (Ebolowa)", image: safeRequire(require("@/assets/images/city6.jpg")) },
  { id: "7", name: "East (Bertoua)", image: safeRequire(require("@/assets/images/city7.jpg")) },
  { id: "8", name: "Adamawa (Ngaoundéré)", image: safeRequire(require("@/assets/images/city8.jpg")) },
  { id: "9", name: "North (Garoua)", image: safeRequire(require("@/assets/images/city9.jpg")) },
  { id: "10", name: "Far North (Maroua)", image: safeRequire(require("@/assets/images/city10.jpg")) },
];

export default function HomeScreen() {
  // Signed-in User State
  const [userName, setUserName] = useState<string>(() => getCurrentUser().fullName);

  useEffect(() => {
    setUserName(getCurrentUser().fullName);
    const unsubscribe = subscribeAuth(() => {
      setUserName(getCurrentUser().fullName);
    });
    return unsubscribe;
  }, []);

  // Router search params from region selection
  const params = useLocalSearchParams<{ fromRegion?: string; toRegion?: string }>();

  // Destination States
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");

  useEffect(() => {
    if (params.fromRegion !== undefined) setFromLocation(params.fromRegion);
    if (params.toRegion !== undefined) setToLocation(params.toRegion);
  }, [params.fromRegion, params.toRegion]);

  // Date States
  const [departDateText, setDepartDateText] = useState<string>("");

  // Native & Custom Calendar Picker States
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const [showDepartPicker, setShowDepartPicker] = useState<boolean>(false);

  // Custom Calendar Month View State
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const monthName = currentViewDate.toLocaleString('default', { month: 'long' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  const isMinMonth =
    year < todayZero.getFullYear() ||
    (year === todayZero.getFullYear() && month <= todayZero.getMonth());

  const handleSelectDay = (dayNum: number) => {
    const selected = new Date(year, month, dayNum);
    const selectedZero = new Date(year, month, dayNum);
    selectedZero.setHours(0, 0, 0, 0);

    if (selectedZero < todayZero) {
      return;
    }

    setPickerDate(selected);
    const formatted = selected.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setDepartDateText(formatted);
    setShowDepartPicker(false);
  };

  // Journey Time Shift State ("Morning" | "Night")
  const [journeyShift, setJourneyShift] = useState<"Morning" | "Night">("Morning");

  // Date Selection Handler for Native Mobile Picker
  const onDepartChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDepartPicker(false);
    if (selectedDate) {
      const selectedZero = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      if (selectedZero < todayZero) {
        return;
      }
      setPickerDate(selectedDate);
      setDepartDateText(selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    }
  };

  // Location Swap Handler
  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Route to Buses Page
  const handleGoToAvailableBuses = () => {
    router.push({
      pathname: "/buses",
      params: {
        from: fromLocation || "Select Origin",
        to: toLocation || "Select Destination",
        depart: departDateText || new Date().toLocaleDateString(),
        returnDate: "One Way",
        passenger: userName,
        journeyTime: journeyShift,
      },
    });
  };

  // Search Buses Handler
  const handleSearchBuses = async () => {
    router.push({
      pathname: "/searchresult",
      params: {
        from: fromLocation || "Douala",
        to: toLocation || "Yaoundé",
        depart: departDateText || new Date().toLocaleDateString(),
        returnDate: "One Way",
        passenger: userName,
        journeyTime: journeyShift,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Blue Top Header Section */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Ionicons name="bus-outline" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>BUSUP</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title / Hero Banner */}
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.heroSubtitle}>Where are you traveling next?</Text>
        </View>

        {/* Search & Booking Form Card */}
        <View style={styles.card}>
          <View style={styles.inputStack}>
            {/* From Destination */}
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() =>
                router.push({
                  pathname: "/select-region",
                  params: { type: "from", currentFrom: fromLocation, currentTo: toLocation },
                })
              }
            >
              <Ionicons name="location-outline" size={18} color="#2563EB" />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>FROM</Text>
                <Text style={[styles.inputText, !fromLocation && styles.placeholderText]}>
                  {fromLocation ? fromLocation : "Select Origin"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Swap Floating Button */}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap} activeOpacity={0.8}>
              <Ionicons name="swap-vertical" size={16} color="#2563EB" />
            </TouchableOpacity>

            {/* To Destination */}
            <TouchableOpacity
              style={styles.inputBox}
              onPress={() =>
                router.push({
                  pathname: "/select-region",
                  params: { type: "to", currentFrom: fromLocation, currentTo: toLocation },
                })
              }
            >
              <Ionicons name="navigate-outline" size={18} color="#2563EB" />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>TO</Text>
                <Text style={[styles.inputText, !toLocation && styles.placeholderText]}>
                  {toLocation ? toLocation : "Select Destination"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Depart Date Input */}
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowDepartPicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputLabel}>DEPARTURE DATE</Text>
              <Text style={[styles.inputText, !departDateText && styles.placeholderText]}>
                {departDateText ? departDateText : "Select Departure Date"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>

          {/* Interactive Modal Calendar Popup for Web & Mobile */}
          <Modal
            visible={showDepartPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDepartPicker(false)}
          >
            <TouchableOpacity
              style={styles.calendarModalOverlay}
              activeOpacity={1}
              onPress={() => setShowDepartPicker(false)}
            >
              <TouchableOpacity style={styles.calendarCard} activeOpacity={1}>
                {/* Header Month / Year & Nav */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={[styles.calNavBtn, isMinMonth && styles.calNavBtnDisabled]}
                    disabled={isMinMonth}
                    onPress={() => setCurrentViewDate(new Date(year, month - 1, 1))}
                  >
                    <Ionicons name="chevron-back" size={18} color={isMinMonth ? "#CBD5E1" : "#0F172A"} />
                  </TouchableOpacity>

                  <Text style={styles.calendarTitle}>
                    {monthName} {year}
                  </Text>

                  <TouchableOpacity
                    style={styles.calNavBtn}
                    onPress={() => setCurrentViewDate(new Date(year, month + 1, 1))}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {/* Days of Week Header */}
                <View style={styles.weekRow}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                    <Text key={dayName} style={styles.weekDayText}>
                      {dayName}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCell} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const thisDate = new Date(year, month, dayNum);
                    const thisDateZero = new Date(year, month, dayNum);
                    thisDateZero.setHours(0, 0, 0, 0);

                    const isPast = thisDateZero < todayZero;
                    const isToday = thisDate.toDateString() === todayZero.toDateString();
                    const isSelected = thisDate.toDateString() === pickerDate.toDateString();

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        disabled={isPast}
                        style={[
                          styles.dayCell,
                          isToday && styles.todayCell,
                          isSelected && styles.selectedCell,
                          isPast && styles.disabledCell,
                        ]}
                        onPress={() => handleSelectDay(dayNum)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText,
                            isToday && !isSelected && styles.todayText,
                            isPast && styles.disabledDayText,
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Action Buttons */}
                <View style={styles.calendarFooter}>
                  <TouchableOpacity
                    style={styles.todayBtn}
                    onPress={() => {
                      const today = new Date();
                      setCurrentViewDate(today);
                      handleSelectDay(today.getDate());
                    }}
                  >
                    <Text style={styles.todayBtnText}>Today</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeCalendarBtn}
                    onPress={() => setShowDepartPicker(false)}
                  >
                    <Text style={styles.closeCalendarText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Passenger Details */}
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={16} color="#2563EB" />
            <Text style={styles.inputText}>Passenger: {userName}</Text>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: "auto" }} />
          </View>

          {/* Journey Time Selector */}
          <View style={styles.shiftContainer}>
            <Text style={styles.shiftLabel}>Journey Time:</Text>
            <View style={styles.shiftOptions}>
              <TouchableOpacity
                style={[styles.shiftBtn, journeyShift === "Morning" && styles.activeShiftBtn]}
                onPress={() => setJourneyShift("Morning")}
              >
                <Ionicons
                  name="sunny-outline"
                  size={14}
                  color={journeyShift === "Morning" ? "#FFFFFF" : "#64748B"}
                />
                <Text
                  style={[
                    styles.shiftBtnText,
                    journeyShift === "Morning" && styles.activeShiftText,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shiftBtn, journeyShift === "Night" && styles.activeShiftBtn]}
                onPress={() => setJourneyShift("Night")}
              >
                <Ionicons
                  name="moon-outline"
                  size={14}
                  color={journeyShift === "Night" ? "#FFFFFF" : "#64748B"}
                />
                <Text
                  style={[
                    styles.shiftBtnText,
                    journeyShift === "Night" && styles.activeShiftText,
                  ]}
                >
                  Night
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Buses Quick Select */}
          <TouchableOpacity style={styles.availableBusBox} onPress={handleGoToAvailableBuses}>
            <Ionicons name="bus-outline" size={18} color="#2563EB" />
            <Text style={styles.availableBusText}>View Available Buses</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>

          {/* Primary Action Search Button */}
          <TouchableOpacity activeOpacity={0.88} onPress={handleSearchBuses} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search Buses →</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Routes Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {REGIONS_OF_CAMEROON.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={styles.regionCard}
              onPress={() => router.push({ pathname: "/select-region", params: { type: "to" } })}
            >
              <Image source={region.image} style={styles.regionImage} />
              <View style={styles.cardOverlay}>
                <Text style={styles.regionName}>{region.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#2563EB",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  iconBtn: {
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
  heroSection: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputStack: {
    position: "relative",
    gap: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    gap: 10,
  },
  inputTextContainer: {
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 1,
  },
  inputText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "500",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  swapButton: {
    position: "absolute",
    right: 14,
    top: 34,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  shiftContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  shiftLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  shiftOptions: {
    flexDirection: "row",
    gap: 8,
  },
  shiftBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  activeShiftBtn: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  shiftBtnText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  activeShiftText: {
    color: "#FFFFFF",
  },
  availableBusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  availableBusText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  searchBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  carousel: {
    flexDirection: "row",
    marginBottom: 30,
  },
  regionCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  regionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  regionName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  // Modal Calendar Styles
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  calendarCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  calNavBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  calNavBtnDisabled: {
    opacity: 0.4,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  weekDayText: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  selectedCell: {
    backgroundColor: "#2563EB",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  todayText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  disabledCell: {
    opacity: 0.35,
    backgroundColor: "#F8FAFC",
  },
  disabledDayText: {
    color: "#94A3B8",
  },
  calendarFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  todayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  todayBtnText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  closeCalendarBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  closeCalendarText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});