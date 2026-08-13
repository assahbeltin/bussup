import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AdminLayout from './AdminLayout';
import { getAdminFleetApi, addBusApi, updateBusStatusApi } from '../../services/api';

export default function FleetManagementScreen() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Form states for Add Bus
  const [agencyName, setAgencyName] = useState('Vatican Express');
  const [busNumber, setBusNumber] = useState('');
  const [type, setType] = useState('VIP Luxury Line');
  const [driverName, setDriverName] = useState('');
  const [totalSeats, setTotalSeats] = useState('80');
  const [fromCity, setFromCity] = useState('Yaoundé');
  const [toCity, setToCity] = useState('Bamenda');
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [priceFCFA, setPriceFCFA] = useState('8000');

  const fetchFleet = async () => {
    setLoading(true);
    const res = await getAdminFleetApi();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setFleet(res.data);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleStatusChange = async (busId, newStatus) => {
    setUpdatingId(busId);
    const res = await updateBusStatusApi(busId, newStatus);
    setUpdatingId(null);
    if (res.success) {
      fetchFleet();
    } else {
      Alert.alert('Error', res.message || 'Failed to update bus status');
    }
  };

  const handleAddBus = async () => {
    if (!busNumber.trim() || !driverName.trim()) {
      Alert.alert('Required Fields', 'Please enter bus number and driver name.');
      return;
    }

    setSubmitting(true);
    const res = await addBusApi({
      agencyName: agencyName.trim() || 'Vatican Express',
      busNumber: busNumber.trim(),
      type: type.trim() || 'VIP Luxury Line',
      driverName: driverName.trim(),
      totalSeats: parseInt(totalSeats, 10) || 80,
      fromCity: fromCity.trim() || 'Yaoundé',
      toCity: toCity.trim() || 'Bamenda',
      departureTime: departureTime.trim() || '07:30 AM',
      priceFCFA: parseInt(priceFCFA, 10) || 8000,
    });
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Success', 'Bus and trip added to fleet successfully!');
      setModalVisible(false);
      setBusNumber('');
      setDriverName('');
      fetchFleet();
    } else {
      Alert.alert('Error', res.message || 'Failed to add bus to fleet');
    }
  };

  const filteredFleet = fleet.filter((bus) => {
    const q = search.toLowerCase();
    const bId = (bus.id || bus.busNumber || '').toLowerCase();
    const dName = (bus.driverName || bus.driver || '').toLowerCase();
    const bType = (bus.type || '').toLowerCase();
    const agency = (bus.agencyName || bus.agency || '').toLowerCase();
    const status = (bus.status || '').toLowerCase();

    return (
      bId.includes(q) ||
      dName.includes(q) ||
      bType.includes(q) ||
      agency.includes(q) ||
      status.includes(q)
    );
  });

  return (
    <AdminLayout title="Admin Portal">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Fleet Management</Text>
              <Text style={styles.subtitle}>Manage buses, drivers, and operational statuses</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Bus</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bus ID, driver, agency or status..."
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

          {/* Fleet List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading Fleet Buses...</Text>
            </View>
          ) : filteredFleet.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No buses found in fleet.</Text>
            </View>
          ) : (
            filteredFleet.map((bus) => {
              const isUpdatingThis = updatingId === bus.id;

              return (
                <View key={bus.id} style={styles.busCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.busBadge}>
                      <MaterialIcons name="directions-bus" size={20} color="#2563EB" />
                      <Text style={styles.busId}>{bus.busNumber || bus.id}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        bus.status === 'On Route' && styles.chipActive,
                        bus.status === 'Maintenance' && styles.chipMaintenance,
                        bus.status === 'Available' && styles.chipAvailable,
                      ]}
                    >
                      <Text style={styles.chipText}>{bus.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.busType}>
                    {bus.agencyName || bus.agency || 'Vatican Express'} • {bus.type}
                  </Text>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="person" size={16} color="#64748B" />
                    <Text style={styles.infoText}>Driver: {bus.driverName || bus.driver || 'N/A'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons name="event-seat" size={16} color="#64748B" />
                    <Text style={styles.infoText}>Capacity: {bus.totalSeats || 80} Seats</Text>
                  </View>

                  {/* Actions Bar */}
                  <View style={styles.cardActions}>
                    <Text style={styles.actionLabel}>Change Status:</Text>
                    {isUpdatingThis ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <View style={styles.statusBtnRow}>
                        {bus.status !== 'Available' && (
                          <TouchableOpacity
                            style={[styles.statusBtn, styles.btnAvailable]}
                            onPress={() => handleStatusChange(bus.id, 'Available')}
                          >
                            <Text style={styles.btnAvailableText}>Available</Text>
                          </TouchableOpacity>
                        )}
                        {bus.status !== 'On Route' && (
                          <TouchableOpacity
                            style={[styles.statusBtn, styles.btnOnRoute]}
                            onPress={() => handleStatusChange(bus.id, 'On Route')}
                          >
                            <Text style={styles.btnOnRouteText}>On Route</Text>
                          </TouchableOpacity>
                        )}
                        {bus.status !== 'Maintenance' && (
                          <TouchableOpacity
                            style={[styles.statusBtn, styles.btnMaint]}
                            onPress={() => handleStatusChange(bus.id, 'Maintenance')}
                          >
                            <Text style={styles.btnMaintText}>Maintenance</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Add Bus Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Bus</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Agency Name</Text>
                <TextInput
                  style={styles.input}
                  value={agencyName}
                  onChangeText={setAgencyName}
                  placeholder="e.g. Vatican Express"
                />

                <Text style={styles.label}>Bus Number / ID *</Text>
                <TextInput
                  style={styles.input}
                  value={busNumber}
                  onChangeText={setBusNumber}
                  placeholder="e.g. LT-890-CE"
                />

                <Text style={styles.label}>Bus Type / Category</Text>
                <TextInput
                  style={styles.input}
                  value={type}
                  onChangeText={setType}
                  placeholder="e.g. VIP Luxury Line (A/C, WiFi)"
                />

                <Text style={styles.label}>Driver Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={driverName}
                  onChangeText={setDriverName}
                  placeholder="e.g. Tanjong Pius"
                />

                <Text style={styles.label}>Total Seat Capacity</Text>
                <TextInput
                  style={styles.input}
                  value={totalSeats}
                  onChangeText={setTotalSeats}
                  keyboardType="numeric"
                  placeholder="80"
                />

                <Text style={styles.label}>Origin City (From)</Text>
                <TextInput
                  style={styles.input}
                  value={fromCity}
                  onChangeText={setFromCity}
                  placeholder="e.g. Yaoundé"
                />

                <Text style={styles.label}>Destination City (To)</Text>
                <TextInput
                  style={styles.input}
                  value={toCity}
                  onChangeText={setToCity}
                  placeholder="e.g. Bamenda"
                />

                <Text style={styles.label}>Departure Time</Text>
                <TextInput
                  style={styles.input}
                  value={departureTime}
                  onChangeText={setDepartureTime}
                  placeholder="e.g. 07:30 AM"
                />

                <Text style={styles.label}>Ticket Price (FCFA)</Text>
                <TextInput
                  style={styles.input}
                  value={priceFCFA}
                  onChangeText={setPriceFCFA}
                  keyboardType="numeric"
                  placeholder="8000"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleAddBus} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Bus to Fleet & Supabase</Text>
                  )}
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
  busCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  busBadge: { flexDirection: 'row', alignItems: 'center' },
  busId: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 6 },
  busType: { fontSize: 13, color: '#64748B', marginVertical: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  infoText: { fontSize: 13, color: '#334155', marginLeft: 6 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipActive: { backgroundColor: '#DCFCE7' },
  chipMaintenance: { backgroundColor: '#FEE2E2' },
  chipAvailable: { backgroundColor: '#DBEAFE' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#1E293B' },
  cardActions: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  statusBtnRow: { flexDirection: 'row', gap: 6 },
  statusBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  btnAvailable: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  btnAvailableText: { color: '#2563EB', fontSize: 11, fontWeight: '700' },
  btnOnRoute: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  btnOnRouteText: { color: '#15803D', fontSize: 11, fontWeight: '700' },
  btnMaint: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  btnMaintText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 42, fontSize: 13, color: '#0F172A' },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 10, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});