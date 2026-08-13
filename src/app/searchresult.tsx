import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { searchTripsApi, TripApiItem } from "../services/api";

export default function SearchResultScreen() {
  // Receive search parameters passed from HomeScreen
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    depart?: string;
    returnDate?: string;
    passenger?: string;
    journeyTime?: string;
  }>();

  const fromCity = params.from || "Douala";
  const toCity = params.to || "Yaoundé";
  const departDate = params.depart || "Today";
  const passengerName = params.passenger || "Passenger";
  const journeyShift = params.journeyTime || "Morning";

  // Filter & Search Results State
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [results, setResults] = useState<TripApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchSearchTrips() {
      setLoading(true);
      const res = await searchTripsApi(fromCity, toCity, journeyShift);
      if (isMounted) {
        setLoading(false);
        if (res.success && res.data) {
          setResults(res.data);
        } else {
          setResults([]);
        }
      }
    }

    fetchSearchTrips();

    return () => {
      isMounted = false;
    };
  }, [fromCity, toCity, journeyShift]);

  const handleCancelSearch = () => {
    setIsCancelled(true);
    setResults([]);
  };

  const handleSelectBus = (busId: string, agencyName: string, price: string) => {
    router.push({
      pathname: "/seat-selection",
      params: {
        busId,
        agency: agencyName,
        from: fromCity,
        to: toCity,
        price,
        depart: departDate,
        passenger: passengerName,
        journeyTime: journeyShift,
      },
    });
  };

  // Filtered results
  const filteredResults = results.filter((item) => {
    if (selectedFilter === "VIP Only") {
      return item.busType.toLowerCase().includes("vip");
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {fromCity} → {toCity}
          </Text>
          <Text style={styles.headerSubtitle}>
            {departDate} • {passengerName} • {journeyShift}
          </Text>
        </View>

        <TouchableOpacity style={styles.cancelSearchHeaderBtn} onPress={handleCancelSearch}>
          <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Quick Filter Chips */}
      {!isCancelled && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {["All", "Earliest", "Cheapest", "VIP Only"].map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search Results Content */}
      <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Searching available buses...</Text>
          </View>
        ) : isCancelled || filteredResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Ionicons name="bus-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {isCancelled ? "Search Cancelled" : "No Buses Found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isCancelled
                ? "All search results have been cleared."
                : `No available buses found for ${fromCity} to ${toCity}. Try modifying your route or date.`}
            </Text>
            <TouchableOpacity
              style={styles.resetSearchBtn}
              onPress={() => router.replace("/home")}
            >
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.resetSearchBtnText}>New Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultCount}>
                Available Buses ({filteredResults.length})
              </Text>
              <TouchableOpacity onPress={handleCancelSearch}>
                <Text style={styles.clearAllLink}>Clear Results</Text>
              </TouchableOpacity>
            </View>

            {filteredResults.map((item) => (
              <View key={item.id} style={styles.busCard}>
                {/* Top Info Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.agencyRow}>
                    <View style={styles.agencyBadge}>
                      <Ionicons name="bus" size={16} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.agencyName}>{item.agencyName}</Text>
                      <Text style={styles.busType}>{item.busType}</Text>
                    </View>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                {/* Departure/Arrival Timeline */}
                <View style={styles.timelineRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{item.departureTime}</Text>
                    <Text style={styles.cityText}>{item.fromCity}</Text>
                  </View>

                  <View style={styles.durationBlock}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                    <View style={styles.lineGraphic}>
                      <View style={styles.dot} />
                      <View style={styles.line} />
                      <Ionicons name="bus-outline" size={14} color="#2563EB" />
                      <View style={styles.line} />
                      <View style={styles.dot} />
                    </View>
                    <Text style={styles.directText}>Direct</Text>
                  </View>

                  <View style={[styles.timeBlock, { alignItems: "flex-end" }]}>
                    <Text style={styles.timeText}>{item.arrivalTime}</Text>
                    <Text style={styles.cityText}>{item.toCity}</Text>
                  </View>
                </View>

                {/* Bottom Price & Action */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Price per seat</Text>
                    <Text style={styles.priceValue}>{item.priceFormatted}</Text>
                  </View>

                  <View style={styles.actionRight}>
                    <Text style={styles.seatsText}>Available Seats</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => handleSelectBus(item.id, item.agencyName, item.priceFormatted)}
                    >
                      <Text style={styles.selectBtnText}>Select Seats</Text>
                      <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
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
    paddingTop: 12,
    paddingBottom: 12,
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
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  cancelSearchHeaderBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  filterBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  resultsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clearAllLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  resultsList: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  agencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  agencyBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  agencyName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  busType: {
    fontSize: 11,
    color: "#64748B",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  timeBlock: {
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  cityText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  durationBlock: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  lineGraphic: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563EB",
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: "#CBD5E1",
  },
  directText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },
  actionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  seatsText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  selectBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Empty State & Cancel Search Styles
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  resetSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  resetSearchBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});