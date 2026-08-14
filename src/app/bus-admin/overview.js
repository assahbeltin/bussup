import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AdminLayout from './AdminLayout';
import { getAdminDashboardApi } from '../../services/api';

export default function AdminOverviewScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [kpis, setKpis] = useState({
    totalRevenueFormatted: '0 FCFA',
    activeBookingsCount: 0,
    totalFleetCount: 0,
    activeRoutesCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminDashboardApi();
    setLoading(false);

    if (res.success && res.data) {
      if (res.data.kpis) {
        setKpis(res.data.kpis);
      }
      if (Array.isArray(res.data.recentBookings)) {
        setRecentBookings(res.data.recentBookings);
      }
    } else {
      setError(res.message || 'Failed to load dashboard statistics.');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'PA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AdminLayout>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Dashboard Overview</Text>
              <Text style={styles.subtitle}>Welcome back, System Admin</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => router.replace('/login')}
            >
              <MaterialIcons name="logout" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading Dashboard KPIs...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchDashboard}>
                <Text style={styles.retryBtnText}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* KPI Cards */}
              <View style={styles.kpiGrid}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="payments" size={24} color="#2563EB" />
                    <Text style={styles.badgeSuccess}>Live</Text>
                  </View>
                  <Text style={styles.cardLabel}>Total Revenue</Text>
                  <Text style={styles.cardValue}>{kpis.totalRevenueFormatted}</Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="confirmation-number" size={24} color="#2563EB" />
                    <Text style={styles.badgeSuccess}>Active</Text>
                  </View>
                  <Text style={styles.cardLabel}>Active Bookings</Text>
                  <Text style={styles.cardValue}>{kpis.activeBookingsCount}</Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="directions-bus" size={24} color="#2563EB" />
                    <Text style={styles.badgeNeutral}>Fleet</Text>
                  </View>
                  <Text style={styles.cardLabel}>Total Buses</Text>
                  <Text style={styles.cardValue}>{kpis.totalFleetCount}</Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="alt-route" size={24} color="#F59E0B" />
                    <Text style={styles.badgeNeutral}>Network</Text>
                  </View>
                  <Text style={styles.cardLabel}>Active Routes</Text>
                  <Text style={styles.cardValue}>{kpis.activeRoutesCount}</Text>
                </View>
              </View>

              {/* Recent Bookings Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Bookings</Text>
                  <TouchableOpacity onPress={() => router.push('/bus-admin/bookings')}>
                    <Text style={styles.linkText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {recentBookings.length === 0 ? (
                  <Text style={styles.emptyText}>No recent bookings found.</Text>
                ) : (
                  recentBookings.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {getInitials(item.passengers?.[0]?.fullName || item.primaryPassengerName || 'Passenger')}
                        </Text>
                      </View>
                      <View style={styles.rowMain}>
                        <Text style={styles.passengerName}>
                          {item.passengers?.[0]?.fullName || item.primaryPassengerName || 'Passenger'}
                        </Text>
                        <Text style={styles.routeText}>
                          {item.fromCity} → {item.toCity}
                        </Text>
                        <Text style={styles.bookingId}>{item.ticketNo || item.id}</Text>
                      </View>
                      <View style={styles.rowEnd}>
                        <Text style={styles.amountText}>{item.totalAmountFormatted || `${item.totalAmountFCFA} FCFA`}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={[
                              styles.statusChip,
                              item.status === 'Confirmed' && styles.chipConfirmed,
                              item.status === 'Processing' && styles.chipProcessing,
                              item.status === 'Cancelled' && styles.chipCancelled,
                            ]}
                          >
                            <Text style={styles.chipText}>{item.status}</Text>
                          </View>

                          {item.receiptImage && (
                            <TouchableOpacity
                              style={styles.receiptBadge}
                              onPress={() => setSelectedReceipt(item.receiptImage)}
                            >
                              <MaterialIcons name="receipt-long" size={14} color="#2563EB" />
                              <Text style={styles.receiptBadgeText}>Proof</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          {/* Receipt Proof Preview Modal */}
          {selectedReceipt && (
            <Modal transparent visible animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Payment Receipt Proof</Text>
                    <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                      <MaterialIcons name="close" size={24} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                  <Image source={{ uri: selectedReceipt }} style={styles.fullReceiptImage} resizeMode="contain" />
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </SafeAreaView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B' },
  logoutButton: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  centerContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 14, fontWeight: '600' },
  errorCard: { padding: 20, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', alignItems: 'center' },
  errorText: { color: '#991B1B', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EF4444', borderRadius: 8 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  card: { width: '48%', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeSuccess: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  badgeDanger: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  badgeNeutral: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  cardLabel: { fontSize: 12, color: '#64748B' },
  cardValue: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  sectionContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tableHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', paddingVertical: 12 },
  linkText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontWeight: '700', color: '#2563EB', fontSize: 12 },
  rowMain: { flex: 1 },
  passengerName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  routeText: { fontSize: 12, color: '#64748B' },
  bookingId: { fontSize: 10, color: '#94A3B8' },
  rowEnd: { alignItems: 'flex-end' },
  amountText: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  chipConfirmed: { backgroundColor: '#DCFCE7' },
  chipProcessing: { backgroundColor: '#FEF3C7' },
  chipCancelled: { backgroundColor: '#FEE2E2' },
  chipText: { fontSize: 10, fontWeight: '700', color: '#1E293B' },
  receiptBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 2 },
  receiptBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '100%', maxWidth: 480, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  fullReceiptImage: { width: '100%', height: 350, borderRadius: 8 },
});