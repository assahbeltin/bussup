import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AdminLayout from './AdminLayout';
import {
  getAdminBookingsApi,
  getAdminTripsApi,
  createManualAdminBookingApi,
  updateBookingStatusApi,
  revokeBookingApi,
  deleteAllAdminBookingsApi,
} from '../../services/api';

export default function BookingsManagementScreen() {
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Manual User Registration Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [seatId, setSeatId] = useState('1A');
  const [paymentMethod, setPaymentMethod] = useState('MTN');

  const fetchBookings = async () => {
    const [bRes, tRes] = await Promise.all([getAdminBookingsApi(), getAdminTripsApi()]);
    if (bRes.success && Array.isArray(bRes.data)) {
      setBookings(bRes.data);
    }
    if (tRes.success && Array.isArray(tRes.data)) {
      setTrips(tRes.data);
      if (tRes.data.length > 0 && !selectedTripId) {
        setSelectedTripId(tRes.data[0].id);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchBookings();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUserBooking = async () => {
    if (!selectedTripId || !fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please fill in Passenger Full Name, Email, Phone, and select a Scheduled Trip.');
      return;
    }

    setSubmitting(true);
    const res = await createManualAdminBookingApi({
      tripId: selectedTripId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      seatId: seatId.trim() || '1A',
      paymentMethod,
    });
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Success', 'User registered into system & booking created in Supabase!');
      setModalVisible(false);
      setFullName('');
      setEmail('');
      setPhone('');
      fetchBookings();
    } else {
      Alert.alert('Error', res.message || 'Failed to create user booking.');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    const res = await updateBookingStatusApi(id, newStatus);
    setUpdatingId(null);
    if (res.success) {
      fetchBookings();
    } else {
      Alert.alert('Error', res.message || 'Failed to update booking status');
    }
  };

  const handleRevoke = async (id) => {
    const doRevoke = async () => {
      setUpdatingId(id);
      const res = await revokeBookingApi(id);
      setUpdatingId(null);
      if (res.success) {
        fetchBookings();
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(res.message || 'Failed to revoke booking');
        } else {
          Alert.alert('Error', res.message || 'Failed to revoke booking');
        }
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmRevoke = window.confirm('Are you sure you want to revoke this booking? The customer data will be permanently deleted from the database.');
      if (confirmRevoke) {
        await doRevoke();
      }
      return;
    }

    Alert.alert(
      'Revoke Customer Booking',
      'Are you sure you want to revoke this booking? The customer data will be permanently deleted from the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke & Delete',
          style: 'destructive',
          onPress: doRevoke,
        },
      ]
    );
  };

  const handleExportExcel = () => {
    if (bookings.length === 0) {
      Alert.alert('Export Excel', 'No customer bookings available to export.');
      return;
    }

    const headers = [
      'Ticket PNR',
      'Booking Date',
      'Agency',
      'Passenger Full Name',
      'Email',
      'Phone',
      'From City',
      'To City',
      'Seat Number',
      'Amount (FCFA)',
      'Payment Method',
      'Status',
    ];

    const rows = [];
    bookings.forEach((b) => {
      const passengersList = Array.isArray(b.passengers) && b.passengers.length > 0
        ? b.passengers
        : [{
            fullName: b.primaryPassengerName || 'Passenger',
            email: b.primaryPassengerEmail || 'N/A',
            phone: b.paymentPhoneOrCard || 'N/A',
            seatId: (b.seatIds && b.seatIds[0]) || '1A',
          }];

      passengersList.forEach((p) => {
        const pName = p.fullName || p.full_name || 'Passenger';
        const pEmail = p.email || 'N/A';
        const pPhone = p.phone || b.paymentPhoneOrCard || 'N/A';
        const pSeat = p.seatId || p.seat_id || (Array.isArray(b.seatIds) ? b.seatIds.join('; ') : '1A');
        const ticketNo = b.ticketNo || b.ticket_no || b.id || '';
        const createdDate = b.createdAt || b.created_at ? new Date(b.createdAt || b.created_at).toLocaleString() : 'N/A';
        const agency = b.agencyName || b.agency_name || '';
        const fromCity = b.fromCity || b.from_city || '';
        const toCity = b.toCity || b.to_city || '';
        const amount = b.totalAmountFCFA || b.total_amount_fcfa || 0;
        const payMethod = b.paymentMethod || b.payment_method || '';
        const status = b.status || '';

        rows.push([
          `"${ticketNo.replace(/"/g, '""')}"`,
          `"${createdDate.replace(/"/g, '""')}"`,
          `"${agency.replace(/"/g, '""')}"`,
          `"${pName.replace(/"/g, '""')}"`,
          `"${pEmail.replace(/"/g, '""')}"`,
          `"${pPhone.replace(/"/g, '""')}"`,
          `"${fromCity.replace(/"/g, '""')}"`,
          `"${toCity.replace(/"/g, '""')}"`,
          `"${pSeat.replace(/"/g, '""')}"`,
          `"${amount}"`,
          `"${payMethod.replace(/"/g, '""')}"`,
          `"${status.replace(/"/g, '""')}"`,
        ].join(','));
      });
    });

    const csvString = [headers.join(','), ...rows].join('\r\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `BusUp_Bookings_Manifest_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Export Complete', `Exported ${rows.length} booking records to Excel CSV.`);
    }
  };

  const handleDeleteAll = async () => {
    if (bookings.length === 0) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('There are currently no customer bookings to delete.');
      } else {
        Alert.alert('Delete All', 'There are currently no customer bookings to delete.');
      }
      return;
    }

    const doDeleteAll = async () => {
      setLoading(true);
      const res = await deleteAllAdminBookingsApi();
      setLoading(false);
      if (res.success) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('All customer bookings removed from database.');
        } else {
          Alert.alert('Deleted', 'All customer bookings removed from database.');
        }
        fetchBookings();
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(res.message || 'Failed to delete all bookings.');
        } else {
          Alert.alert('Error', res.message || 'Failed to delete all bookings.');
        }
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmDeleteAll = window.confirm(
        'Are you sure you want to permanently delete ALL customer bookings and passenger manifests from the database? This action CANNOT be undone.'
      );
      if (confirmDeleteAll) {
        await doDeleteAll();
      }
      return;
    }

    Alert.alert(
      'Delete All Bookings',
      'Are you sure you want to permanently delete ALL customer bookings and passenger manifests from the database? This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Customers',
          style: 'destructive',
          onPress: doDeleteAll,
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const passengersText = (b.passengers || []).map((p) => `${p.fullName} ${p.email} ${p.phone}`).join(' ').toLowerCase();
    const ticketNo = (b.ticketNo || b.id || '').toLowerCase();
    const route = `${b.fromCity || ''} ${b.toCity || ''} ${b.agencyName || ''}`.toLowerCase();
    return passengersText.includes(q) || ticketNo.includes(q) || route.includes(q);
  });

  return (
    <AdminLayout title="Admin Portal">
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          <View style={styles.titleHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Booking Management</Text>
              <Text style={styles.subtitle}>Review & manage all user reservations synced live with Supabase</Text>
            </View>
            <View style={styles.headerBtnGroup}>
              <TouchableOpacity style={styles.exportBtn} onPress={handleExportExcel}>
                <MaterialIcons name="file-download" size={15} color="#FFFFFF" />
                <Text style={styles.headerBtnText}>Export Excel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBookingBtn} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="person-add" size={15} color="#FFFFFF" />
                <Text style={styles.headerBtnText}>+ Register User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteAllHeaderBtn} onPress={handleDeleteAll}>
                <MaterialIcons name="delete-forever" size={15} color="#FFFFFF" />
                <Text style={styles.headerBtnText}>Delete All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} disabled={refreshing}>
                <MaterialIcons name="refresh" size={16} color="#2563EB" />
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search passenger name, email, phone, PNR..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading Bookings from Supabase...</Text>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching bookings found.</Text>
            </View>
          ) : (
            filteredBookings.map((booking) => {
              const passengersList = booking.passengers || [];
              const primaryPassenger = passengersList[0] || {};
              const pName = primaryPassenger.fullName || booking.primaryPassengerName || 'Passenger';
              const pPhone = primaryPassenger.phone || booking.paymentPhoneOrCard || 'N/A';
              const pEmail = primaryPassenger.email || 'N/A';
              const isUpdatingThis = updatingId === booking.id;
              const isExpanded = expandedBookingId === booking.id;

              return (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.bookingId}>{booking.ticketNo || booking.id}</Text>
                    <Text style={styles.price}>{booking.totalAmountFormatted || `${booking.totalAmountFCFA} FCFA`}</Text>
                  </View>

                  {/* Primary Passenger Name */}
                  <View style={styles.passengerHeaderRow}>
                    <Text style={styles.passengerName}>{pName}</Text>
                    <Text style={styles.agencyTag}>{booking.agencyName || 'BusUp Express'}</Text>
                  </View>

                  {/* Route & Trip details */}
                  <View style={styles.detailRow}>
                    <MaterialIcons name="alt-route" size={16} color="#2563EB" />
                    <Text style={styles.detailTextBold}>
                      {booking.fromCity} ({booking.fromTerminal}) → {booking.toCity} ({booking.toTerminal})
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="event" size={16} color="#64748B" />
                    <Text style={styles.detailText}>
                      Date: {booking.departureDate || 'Today'} • Time: {booking.departureTime || '07:30 AM'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="event-seat" size={16} color="#64748B" />
                    <Text style={styles.detailText}>
                      Seats ({Array.isArray(booking.seatIds) ? booking.seatIds.length : 1}): {Array.isArray(booking.seatIds) ? booking.seatIds.join(', ') : booking.seatIds || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="payment" size={16} color="#64748B" />
                    <Text style={styles.detailText}>
                      Payment: {booking.paymentMethod} ({booking.paymentStatus}) • Phone/Acc: {pPhone}
                    </Text>
                  </View>

                  {/* Detailed Passenger Information Toggle */}
                  <TouchableOpacity
                    style={styles.expandToggleBtn}
                    onPress={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                  >
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#2563EB" />
                    <Text style={styles.expandToggleText}>
                      {isExpanded ? "Hide Passenger Details" : `View Full Details (${passengersList.length || 1} Passenger${passengersList.length > 1 ? 's' : ''})`}
                    </Text>
                  </TouchableOpacity>

                  {/* Expanded Passenger Breakdown */}
                  {isExpanded && (
                    <View style={styles.passengerDetailBox}>
                      <Text style={styles.passengerDetailTitle}>Passenger Manifest Details:</Text>
                      {(passengersList.length > 0 ? passengersList : [primaryPassenger]).map((p, idx) => (
                        <View key={idx} style={styles.passengerCardItem}>
                          <Text style={styles.passengerSeatBadge}>Seat {p.seatId || booking.seatIds?.[idx] || 'N/A'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pItemName}>{p.fullName || pName}</Text>
                            <Text style={styles.pItemSub}>Phone: {p.phone || pPhone} | Email: {p.email || pEmail}</Text>
                            {p.age ? <Text style={styles.pItemSub}>Age: {p.age}</Text> : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.statusChip,
                        booking.status === 'Confirmed' && styles.chipConfirmed,
                        booking.status === 'Processing' && styles.chipProcessing,
                        booking.status === 'Cancelled' && styles.chipCancelled,
                      ]}
                    >
                      <Text style={styles.chipText}>{booking.status}</Text>
                    </View>

                    {/* Status Action Buttons: Hidden completely once Confirmed */}
                    {booking.status !== 'Confirmed' && (
                      isUpdatingThis ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <View style={styles.actionGroup}>
                          <TouchableOpacity
                            style={[styles.btnAction, styles.btnConfirm]}
                            onPress={() => handleStatusUpdate(booking.id, 'Confirmed')}
                          >
                            <Text style={styles.btnActionTextConfirm}>Confirm</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.btnAction, styles.btnRevoke]}
                            onPress={() => handleRevoke(booking.id)}
                          >
                            <Text style={styles.btnActionTextRevoke}>Revoke</Text>
                          </TouchableOpacity>
                        </View>
                      )
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Register User Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register User into System</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Scheduled Trip *</Text>
              <View style={styles.tripSelectorContainer}>
                {trips.length === 0 ? (
                  <Text style={styles.noTripsWarning}>No scheduled trips found. Register a bus/trip first.</Text>
                ) : (
                  trips.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.tripOption, selectedTripId === t.id && styles.tripOptionSelected]}
                      onPress={() => setSelectedTripId(t.id)}
                    >
                      <Text style={[styles.tripOptionText, selectedTripId === t.id && styles.tripOptionTextSelected]}>
                        {t.agencyName} • {t.fromCity} → {t.toCity} ({t.departureTime}) - {t.priceFormatted}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={styles.label}>Passenger Full Name *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Samuel Etoo"
              />

              <Text style={styles.label}>Passenger Email Address *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. samuel@example.com"
              />

              <Text style={styles.label}>Passenger Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="e.g. 670001122"
              />

              <Text style={styles.label}>Seat Number</Text>
              <TextInput
                style={styles.input}
                value={seatId}
                onChangeText={setSeatId}
                placeholder="e.g. 4C"
              />

              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.payMethodRow}>
                {['MTN', 'ORANGE', 'CARD', 'ON_BOARD'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.payMethodChip, paymentMethod === m && styles.payMethodChipSelected]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text style={[styles.payMethodText, paymentMethod === m && styles.payMethodTextSelected]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateUserBooking} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Register User & Save Booking</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  titleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  headerBtnGroup: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addBookingBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deleteAllHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  headerBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  refreshBtnText: { color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  centerContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { fontSize: 15, fontWeight: '700', color: '#2563EB' },
  price: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  passengerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  passengerName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  agencyTag: { fontSize: 12, fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
  detailTextBold: { fontSize: 13, color: '#0F172A', fontWeight: '600', marginLeft: 6 },
  expandToggleBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 6 },
  expandToggleText: { fontSize: 13, fontWeight: '600', color: '#2563EB', marginLeft: 4 },
  passengerDetailBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  passengerDetailTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  passengerCardItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  passengerSeatBadge: { backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: 11, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, marginRight: 10 },
  pItemName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  pItemSub: { fontSize: 11, color: '#64748B' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipConfirmed: { backgroundColor: '#DCFCE7' },
  chipProcessing: { backgroundColor: '#FEF3C7' },
  chipCancelled: { backgroundColor: '#FEE2E2' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  actionGroup: { flexDirection: 'row', gap: 6 },
  btnAction: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  btnConfirm: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  btnActionTextConfirm: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  btnRevoke: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  btnActionTextRevoke: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 13, color: '#0F172A' },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 10, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  tripSelectorContainer: { gap: 6, marginBottom: 4 },
  noTripsWarning: { fontSize: 12, color: '#DC2626', fontStyle: 'italic' },
  tripOption: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 10, borderRadius: 8 },
  tripOptionSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  tripOptionText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  tripOptionTextSelected: { color: '#2563EB', fontWeight: '700' },
  payMethodRow: { flexDirection: 'row', gap: 6, marginVertical: 4 },
  payMethodChip: { flex: 1, paddingVertical: 6, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, alignItems: 'center', backgroundColor: '#F8FAFC' },
  payMethodChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  payMethodText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  payMethodTextSelected: { color: '#FFFFFF' },
});