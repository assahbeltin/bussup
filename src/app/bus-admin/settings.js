import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import AdminLayout from "./AdminLayout";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("fleet"); // fleet, users, system, profile

  // Fleet Form State (Add Bus)
  const [busNumber, setBusNumber] = useState("");
  const [busType, setBusType] = useState("Luxury VIP");
  const [totalSeats, setTotalSeats] = useState("45");

  // System Settings State
  const [autoApproveBookings, setAutoApproveBookings] = useState(true);
  const [allowCancellations, setAllowCancellations] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Sample Users List for Removal / Role updates
  const [users, setUsers] = useState([
    { id: "1", name: "Jean Dupont", email: "jean@example.com", role: "Passenger" },
    { id: "2", name: "Marie Sissoko", email: "marie@example.com", role: "Driver" },
    { id: "3", name: "Paul Nguemo", email: "paul@example.com", role: "Passenger" },
  ]);

  const handleAddBus = () => {
    if (!busNumber) {
      Alert.alert("Error", "Please enter a vehicle / bus number.");
      return;
    }
    Alert.alert("Success", `Bus ${busNumber} (${busType}) added to fleet!`);
    setBusNumber("");
  };

  const handleRemoveUser = (userId, userName) => {
    Alert.alert(
      "Remove User",
      `Are you sure you want to remove ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setUsers(users.filter((u) => u.id !== userId)),
        },
      ]
    );
  };

  return (
    <AdminLayout title="Admin Settings">
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "fleet" && styles.activeTab]}
            onPress={() => setActiveTab("fleet")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "fleet" && styles.activeTabText,
              ]}
            >
              Fleet & Buses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "users" && styles.activeTabText,
              ]}
            >
              User Management
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* --- TAB 1: FLEET & BUS MANAGEMENT --- */}
        {activeTab === "fleet" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Bus / Vehicle</Text>
            <Text style={styles.cardSubtitle}>
              Register new buses to your active reservation system.
            </Text>

            <Text style={styles.label}>Bus License / Vehicle ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BA-108"
              placeholderTextColor="#94A3B8"
              value={busNumber}
              onChangeText={setBusNumber}
            />

            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeSelectorRow}>
              {["Standard", "Luxury VIP", "Sleeper"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    busType === type && styles.activeTypeChip,
                  ]}
                  onPress={() => setBusType(type)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      busType === type && styles.activeTypeChipText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Total Capacity (Seats)</Text>
            <TextInput
              style={styles.input}
              placeholder="45"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={totalSeats}
              onChangeText={setTotalSeats}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddBus}
            >
              <Text style={styles.primaryButtonText}>+ Add Bus to Fleet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- TAB 2: USER MANAGEMENT --- */}
        {activeTab === "users" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manage Users & Staff</Text>
            <Text style={styles.cardSubtitle}>
              View, edit, or remove passenger & staff accounts.
            </Text>

            {users.map((item) => (
              <View key={item.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveUser(item.id, item.name)}
                >
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  activeTab: {
    backgroundColor: "#0F172A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  activeTypeChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  activeTypeChipText: {
    color: "#FFFFFF",
  },
  primaryButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // User Management
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0369A1",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  // System Controls
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  switchSublabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});