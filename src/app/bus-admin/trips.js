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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AdminLayout from './AdminLayout';
import {
  getAdminTripsApi,
  createTripApi,
  updateTripApi,
  deleteTripApi,
  getAdminFleetApi,
} from '../../services/api';

export default function TripsManagementScreen() {
  const [trips, setTrips] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);

  // Form States
  const [agencyName, setAgencyName] = useState('Vatican Express');
  const [busId, setBusId] = useState('BUS-VAT-101');
  const [fromCity, setFromCity] = useState('Douala');
  const [fromTerminal, setFromTerminal] = useState('Village Terminal');
  const [toCity, setToCity] = useState('Yaoundé');
  const [toTerminal, setToTerminal] = useState('Mvan Terminal');
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [arrivalTime, setArrivalTime] = useState('11:00 AM');
  const [duration, setDuration] = useState('3h 30m');
  const [busType, setBusType] = useState('VIP Executive');
  const [priceFCFA, setPriceFCFA] = useState('6000');
  const [journeyShift, setJourneyShift] = useState('Morning');
  const [amenitiesText, setAmenitiesText] = useState('AC, WiFi, Charging');

  const fetchTripsAndFleet = async () => {
    setLoading(true);
    const [tripsRes, fleetRes] = await Promise.all([getAdminTripsApi(), getAdminFleetApi()]);
    setLoading(false);

    if (tripsRes.success && Array.isArray(tripsRes.data)) {
      setTrips(tripsRes.data);
    }
    if (fleetRes.success && Array.isArray(fleetRes.data)) {
      setFleet(fleetRes.data);
    }
  };

  useEffect(() => {
    fetchTripsAndFleet();
  }, []);

  const openAddModal = () => {
    setEditingTripId(null);
    setAgencyName('Vatican Express');
    setBusId('BUS-VAT-101');
    setFromCity('Douala');
    setFromTerminal('Village Terminal');
    setToCity('Yaoundé');
    setToTerminal('Mvan Terminal');
    setDepartureTime('07:30 AM');
    setArrivalTime('11:00 AM');
    setDuration('3h 30m');
    setBusType('VIP Executive');
    setPriceFCFA('6000');
    setJourneyShift('Morning');
    setAmenitiesText('AC, WiFi, Charging');
    setModalVisible(true);
  };

  const openEditModal = (trip) => {
    setEditingTripId(trip.id);
    setAgencyName(trip.agencyName || 'Vatican Express');
    setBusId(trip.busId || 'BUS-VAT-101');
    setFromCity(trip.fromCity || '');
    setFromTerminal(trip.fromTerminal || '');
    setToCity(trip.toCity || '');
    setToTerminal(trip.toTerminal || '');
    setDepartureTime(trip.departureTime || '');
    setArrivalTime(trip.arrivalTime || '');
    setDuration(trip.duration || '3h 30m');
    setBusType(trip.busType || 'VIP Executive');
    setPriceFCFA(String(trip.priceFCFA || 6000));
    setJourneyShift(trip.journeyShift || 'Morning');
    setAmenitiesText(Array.isArray(trip.amenities) ? trip.amenities.join(', ') : 'AC, WiFi');
    setModalVisible(true);
  };

  const handleSaveTrip = async () => {
    if (!fromCity.trim() || !toCity.trim() || !departureTime.trim() || !arrivalTime.trim() || !priceFCFA.trim()) {
      Alert.alert('Required Fields', 'Please fill in Origin City, Destination City, Departure/Arrival Times, and Price.');
      return;
    }

    const payload = {
      agencyName: agencyName.trim() || 'Vatican Express',
      busId: busId.trim() || 'BUS-VAT-101',
      fromCity: fromCity.trim(),
      fromTerminal: fromTerminal.trim() || 'Central Station',
      toCity: toCity.trim(),
      toTerminal: toTerminal.trim() || 'Central Station',
      departureTime: departureTime.trim(),
      arrivalTime: arrivalTime.trim(),
      duration: duration.trim() || '3h 30m',
      busType: busType.trim() || 'VIP Executive',
      priceFCFA: parseInt(priceFCFA, 10) || 6000,
      journeyShift: journeyShift || 'Morning',
      amenities: amenitiesText.split(',').map((s) => s.trim()).filter(Boolean),
    };

    setSubmitting(true);
    let res;
    if (editingTripId) {
      res = await updateTripApi(editingTripId, payload);
    } else {
      res = await createTripApi(payload);
    }
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Success', editingTripId ? 'Trip schedule updated successfully!' : 'New trip added to schedule!');
      setModalVisible(false);
      fetchTripsAndFleet();
    } else {
      Alert.alert('Error', res.message || 'Failed to save trip schedule.');
    }
  };

  const handleDeleteTrip = (id) => {
    Alert.alert('Delete Trip', `Are you sure you want to cancel and delete trip ${id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await deleteTripApi(id);
          if (res.success) {
            fetchTripsAndFleet();
          } else {
            Alert.alert('Error', res.message || 'Failed to delete trip.');
          }
        },
      },
    ]);
  };

  const filteredTrips = trips.filter((trip) => {
    const q = search.toLowerCase();
    const route = `${trip.fromCity || ''} ${trip.toCity || ''}`.toLowerCase();
    const tId = (trip.id || '').toLowerCase();
    const agency = (trip.agencyName || '').toLowerCase();
    const bId = (trip.busId || '').toLowerCase();
    const shift = (trip.journeyShift || '').toLowerCase();

    return route.includes(q) || tId.includes(q) || agency.includes(q) || bId.includes(q) || shift.includes(q);
  });

  return (
    <AdminLayout title="Admin Portal">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Trips & Schedules</Text>
              <Text style={styles.subtitle}>Create, update, and manage bus departure schedules</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Trip</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search route, trip ID, agency, or shift..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
            />
            {search !== '' && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading Schedules...</Text>
            </View>
          ) : filteredTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching trip schedules found.</Text>
            </View>
          ) : (
            filteredTrips.map((trip) => (
              <View key={trip.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.routeHeaderGroup}>
                    <MaterialIcons name="alt-route" size={20} color="#2563EB" />
                    <Text style={styles.routeText}>
                      {trip.fromCity} → {trip.toCity}
                    </Text>
                  </View>
                  <Text style={styles.price}>{trip.priceFormatted || `${trip.priceFCFA} FCFA`}</Text>
                </View>

                <Text style={styles.agencySubtext}>
                  {trip.agencyName} • {trip.busType} ({trip.busId})
                </Text>

                <View style={styles.infoRow}>
                  <MaterialIcons name="schedule" size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    {trip.departureTime} - {trip.arrivalTime} ({trip.duration})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="brightness-5" size={16} color="#64748B" />
                  <Text style={styles.infoText}>Shift: {trip.journeyShift}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    Terminals: {trip.fromTerminal} → {trip.toTerminal}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.tripIdText}>ID: {trip.id}</Text>
                  <View style={styles.actionGroup}>
                    <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(trip)}>
                      <MaterialIcons name="edit" size={16} color="#2563EB" />
                      <Text style={styles.btnEditText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteTrip(trip.id)}>
                      <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
                      <Text style={styles.btnDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingTripId ? 'Edit Trip Schedule' : 'Schedule New Trip'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Agency Name</Text>
                <TextInput style={styles.input} value={agencyName} onChangeText={setAgencyName} placeholder="Vatican Express" />

                <Text style={styles.label}>Assigned Bus ID</Text>
                <TextInput style={styles.input} value={busId} onChangeText={setBusId} placeholder="BUS-VAT-101" />

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>From (City) *</Text>
                    <TextInput style={styles.input} value={fromCity} onChangeText={setFromCity} placeholder="Douala" />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>To (City) *</Text>
                    <TextInput style={styles.input} value={toCity} onChangeText={setToCity} placeholder="Yaoundé" />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>From Terminal</Text>
                    <TextInput style={styles.input} value={fromTerminal} onChangeText={setFromTerminal} placeholder="Village Terminal" />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>To Terminal</Text>
                    <TextInput style={styles.input} value={toTerminal} onChangeText={setToTerminal} placeholder="Mvan Terminal" />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Departure Time *</Text>
                    <TextInput style={styles.input} value={departureTime} onChangeText={setDepartureTime} placeholder="07:30 AM" />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Arrival Time *</Text>
                    <TextInput style={styles.input} value={arrivalTime} onChangeText={setArrivalTime} placeholder="11:00 AM" />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Price (FCFA) *</Text>
                    <TextInput style={styles.input} value={priceFCFA} onChangeText={setPriceFCFA} keyboardType="numeric" placeholder="6000" />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput style={styles.input} value={duration} onChangeText={setDuration} placeholder="3h 30m" />
                  </View>
                </View>

                <Text style={styles.label}>Journey Shift</Text>
                <View style={styles.shiftSelector}>
                  {['Morning', 'Night'].map((shift) => (
                    <TouchableOpacity
                      key={shift}
                      style={[styles.shiftBtn, journeyShift === shift && styles.activeShiftBtn]}
                      onPress={() => setJourneyShift(shift)}
                    >
                      <Text style={[styles.shiftBtnText, journeyShift === shift && styles.activeShiftBtnText]}>
                        {shift}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Bus Type / Category</Text>
                <TextInput style={styles.input} value={busType} onChangeText={setBusType} placeholder="VIP Executive" />

                <Text style={styles.label}>Amenities (Comma Separated)</Text>
                <TextInput style={styles.input} value={amenitiesText} onChangeText={setAmenitiesText} placeholder="AC, WiFi, Charging" />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTrip} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Trip Schedule</Text>}
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFF', fontWeight: '700', marginLeft: 4, fontSize: 13 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, height: 46, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },
  centerContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeHeaderGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  price: { fontSize: 15, fontWeight: '700', color: '#2563EB' },
  agencySubtext: { fontSize: 12, color: '#64748B', marginVertical: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { fontSize: 13, color: '#334155', marginLeft: 6 },
  cardFooter: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripIdText: { fontSize: 11, color: '#94A3B8' },
  actionGroup: { flexDirection: 'row', gap: 10 },
  btnEdit: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
  btnEditText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  btnDelete: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' },
  btnDeleteText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 13, color: '#0F172A' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1 },
  shiftSelector: { flexDirection: 'row', gap: 8, marginTop: 4 },
  shiftBtn: { flex: 1, height: 38, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  activeShiftBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  shiftBtnText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  activeShiftBtnText: { color: '#FFFFFF', fontWeight: '700' },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 10, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
