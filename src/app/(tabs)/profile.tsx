import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getCurrentUser, clearCurrentUser, subscribeAuth, UserProfile } from "../../services/authStore";

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile>(() => getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = subscribeAuth(() => {
      setUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    const doLogout = () => {
      clearCurrentUser();
      router.replace("/login");
    };

    if (Platform.OS === 'web') {
      doLogout();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
  };
  const accountOptions = [
    {
      id: "1",
      title: "Passenger Details",
      subtitle: "Update name, phone & email",
      icon: "person-outline",
    },
    {
      id: "2",
      title: "Saved Payment Methods",
      subtitle: "MTN, Orange Money & Cards",
      icon: "wallet-outline",
    },
    {
      id: "3",
      title: "Travel History & Receipts",
      subtitle: "Download past tickets",
      icon: "receipt-outline",
    },
  ];

  const appOptions = [
    {
      id: "4",
      title: "Notifications & Preferences",
      subtitle: "SMS & trip alert settings",
      icon: "notifications-outline",
    },
    {
      id: "5",
      title: "Help & Support",
      subtitle: "FAQs, contact support 24/7",
      icon: "help-circle-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Ionicons name="bus-outline" size={20} color="#FFFFFF" />
          <Text style={styles.headerTitle}>BUSUP</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.fullName || 'T').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone || '+237 600 000 000'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Section: Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT & PAYMENTS</Text>
          <View style={styles.cardGroup}>
            {accountOptions.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionRow,
                  index < accountOptions.length - 1 && styles.borderBottom,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={18} color="#2563EB" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & SETTINGS</Text>
          <View style={styles.cardGroup}>
            {appOptions.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionRow,
                  index < appOptions.length - 1 && styles.borderBottom,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={18} color="#2563EB" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  profileMeta: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  userPhone: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },
  editBtn: {
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  optionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
    marginBottom: 30,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});