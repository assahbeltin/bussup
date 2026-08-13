import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Pressable,
} from "react-native";
import { router, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

// Define your Admin routes here
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard Overview", icon: "dashboard", route: "/bus-admin/overview" },
  { label: "Fleet Management", icon: "directions-bus", route: "/bus-admin/fleet" },
  { label: "Bookings", icon: "confirmation-number", route: "/bus-admin/bookings" },
  { label: "Users Management", icon: "group", route: "/bus-admin/users" },
  { label: "Settings", icon: "settings", route: "/bus-admin/settings" },
];

export default function AdminLayout({ children, title = "Admin Portal" }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentPath = usePathname();

  const navigateTo = (route) => {
    setDrawerOpen(false);
    router.push(route);
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    router.replace("/login"); // Navigate back to main login screen
  };

  return (
    
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar with Hamburger Icon */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.profileBadge}>
          <MaterialIcons name="security" size={20} color="#FFFFFF" />
        </View>
      </View>

      {/* Main Screen Content */}
      <View style={styles.content}>{children}</View>

      {/* Navigation Drawer Overlay */}
      <Modal
        visible={drawerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop click to close */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setDrawerOpen(false)}
          />

          {/* Side Drawer Content */}
          <View style={styles.drawer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoBadge}>
                <MaterialIcons name="directions-bus" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.appName}>BusUp Admin</Text>
                <Text style={styles.appRole}>Management Portal</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setDrawerOpen(false)}
              >
                <MaterialIcons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Nav Links */}
            <View style={styles.navContainer}>
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = currentPath.includes(item.route);

                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                    ]}
                    onPress={() => navigateTo(item.route)}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={isActive ? "#FFFFFF" : "#94A3B8"}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        isActive && styles.navLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Logout Footer */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: 60,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hamburgerBtn: {
    padding: 8,
  },
  hamburgerIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatar: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },

  // Modal / Drawer Styles
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawer: {
    width: "78%",
    maxWidth: 300,
    backgroundColor: "#0F172A",
    height: "100%",
    paddingVertical: 24,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    marginBottom: 20,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 20,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  appRole: {
    color: "#94A3B8",
    fontSize: 12,
  },
  closeBtn: {
    marginLeft: "auto",
    padding: 6,
  },
  closeText: {
    color: "#94A3B8",
    fontSize: 18,
    fontWeight: "bold",
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  navItemActive: {
    backgroundColor: "#2563EB",
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});