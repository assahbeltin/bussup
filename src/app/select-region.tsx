import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const REGIONS = [
  "Center (Yaoundé)",
  "Littoral (Douala)",
  "West (Bafoussam)",
  "North West (Bamenda)",
  "South West (Buea)",
  "South (Ebolowa)",
  "East (Bertoua)",
  "Adamawa (Ngaoundéré)",
  "North (Garoua)",
  "Far North (Maroua)",
];

export default function SelectRegionScreen() {
  const { type, currentFrom, currentTo } = useLocalSearchParams<{
    type?: string;
    currentFrom?: string;
    currentTo?: string;
  }>();

  const handleSelect = (regionName: string) => {
    // Pass back both regions so selecting one does not clear the other
    if (type === "from") {
      router.push({
        pathname: "/home",
        params: {
          fromRegion: regionName,
          toRegion: currentTo || "",
        },
      });
    } else {
      router.push({
        pathname: "/home",
        params: {
          fromRegion: currentFrom || "",
          toRegion: regionName,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Select {type === "from" ? "Departure" : "Destination"} Region
        </Text>
      </View>

      {/* Region List */}
      <FlatList
        data={REGIONS}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Ionicons name="location-outline" size={22} color="#2563EB" />
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  itemText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
});