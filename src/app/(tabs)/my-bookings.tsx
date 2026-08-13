import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyBookingsApi } from "../../services/api";

interface Booking {
  id: string;
  ticketNo: string;
  company: string;
  badge: "Confirmed" | "Processing" | "Completed" | "Cancelled";
  price: string;
  fromCity: string;
  fromTerminal: string;
  toCity: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  seat: string;
  journeyTime?: string;
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserBookings = async () => {
    const res = await getMyBookingsApi();
    if (res && res.success && Array.isArray(res.data)) {
      const mapped: Booking[] = res.data.map((b: any) => ({
        id: b.id,
        ticketNo: b.ticketNo || b.ticket_no || "#TRV-00000",
        company: b.agencyName || b.agency_name || "Vatican Express",
        badge: b.status || "Processing",
        price: b.totalAmountFormatted || `${b.totalAmountFCFA || 6000} FCFA`,
        fromCity: b.fromCity || b.from_city || "Douala",
        fromTerminal: b.fromTerminal || b.from_terminal || "Village Terminal",
        toCity: b.toCity || b.to_city || "Yaoundé",
        toTerminal: b.toTerminal || b.to_terminal || "Mvan Terminal",
        departureTime: b.departureTime || b.departure_time || "07:30 AM",
        arrivalTime: b.arrivalTime || b.arrival_time || "11:30 AM",
        date: b.departureDate || b.departure_date || "Today",
        seat: `Seat ${(Array.isArray(b.seatIds) ? b.seatIds.join(", ") : b.seatIds) || "1A"}`,
      }));
      setBookings(mapped);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchUserBookings();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "Upcoming") return item.badge === "Confirmed" || item.badge === "Processing";
    if (activeTab === "Completed") return item.badge === "Completed";
    return item.badge === "Cancelled";
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Ionicons name="bus-outline" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>BUSUP</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
        }
      >
        {/* Screen Title Banner */}
        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>My Bookings</Text>
          <Text style={styles.screenSubtitle}>
            {loading ? "Syncing with database..." : `You have ${bookings.length} trip reservation${bookings.length === 1 ? "" : "s"}.`}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabBar}>
          {(["Upcoming", "Completed", "Cancelled"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bookings List */}
        <View style={styles.listSection}>
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} trips found</Text>
            </View>
          ) : (
            filteredBookings.map((item) => (
              <View key={item.id} style={styles.card}>
                {/* Header: Status badge, Ticket #, Company & Price */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <View
                      style={[
                        styles.badge,
                        item.badge === "Confirmed"
                          ? styles.badgeConfirmed
                          : styles.badgeProcessing,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.badge === "Confirmed"
                            ? styles.badgeTextConfirmed
                            : styles.badgeTextProcessing,
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                    <Text style={styles.ticketNo}>{item.ticketNo}</Text>
                  </View>

                  <Text style={styles.priceText}>{item.price}</Text>
                </View>

                <Text style={styles.companyName}>{item.company}</Text>

                {/* Route Flow */}
                <View style={styles.routeContainer}>
                  {/* Origin */}
                  <View style={styles.routePoint}>
                    <View style={[styles.dot, styles.dotOrigin]} />
                    <View style={styles.routeInfo}>
                      <Text style={styles.cityName}>{item.fromCity}</Text>
                      <Text style={styles.terminalName}>{item.fromTerminal}</Text>
                      <Text style={styles.timeText}>{item.departureTime}</Text>
                    </View>
                  </View>

                  {/* Destination */}
                  <View style={styles.routePoint}>
                    <View style={[styles.dot, styles.dotDestination]} />
                    <View style={styles.routeInfo}>
                      <Text style={styles.cityName}>{item.toCity}</Text>
                      <Text style={styles.terminalName}>{item.toTerminal}</Text>
                      <Text style={styles.timeText}>{item.arrivalTime}</Text>
                    </View>
                  </View>
                </View>

                {/* Card Footer Info & View Ticket / Details Button */}
                <View style={styles.cardFooter}>
                  <View style={styles.metaInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>{item.date}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>{item.seat}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/confirmation",
                        params: {
                          bookingId: item.id,
                          pnr: item.ticketNo,
                          agency: item.company,
                          totalAmount: item.price,
                          from: item.fromCity,
                          to: item.toCity,
                          depart: item.date,
                          time: item.departureTime,
                          seats: item.seat.replace("Seat ", ""),
                          journeyTime: item.journeyTime || "Morning",
                        },
                      })
                    }
                  >
                    <Ionicons name="print-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Print Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#2563EB",
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeConfirmed: {
    backgroundColor: "#DCFCE7",
  },
  badgeProcessing: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTextConfirmed: {
    color: "#166534",
  },
  badgeTextProcessing: {
    color: "#92400E",
  },
  ticketNo: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  routeContainer: {
    gap: 12,
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  dotOrigin: {
    backgroundColor: "#2563EB",
  },
  dotDestination: {
    backgroundColor: "#10B981",
  },
  routeInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  terminalName: {
    fontSize: 12,
    color: "#64748B",
  },
  timeText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  metaDivider: {
    fontSize: 11,
    color: "#CBD5E1",
    marginHorizontal: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});