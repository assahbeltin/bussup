import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AdminLayout from './AdminLayout';
import { getAdminUsersApi, deleteAdminUserApi } from '../../services/api';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getAdminUsersApi();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setUsers(res.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id, name) => {
    const executeDelete = async () => {
      setLoading(true);
      const res = await deleteAdminUserApi(id);
      setLoading(false);
      if (res.success) {
        fetchUsers();
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(res.message || 'Failed to delete user account');
        } else {
          Alert.alert('Error', res.message || 'Failed to delete user account');
        }
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete user profile for "${name}"? This action will remove the account permanently from the database.`
      );
      if (confirmDelete) {
        await executeDelete();
      }
      return;
    }

    Alert.alert(
      'Delete User Account',
      `Are you sure you want to delete user profile for "${name}"? This action will remove the account from the database.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]
    );
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const name = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || role.includes(q);
  });

  return (
    <AdminLayout title="Admin Portal">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>Registered passengers, drivers, and admin accounts</Text>

          {/* Search */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search user name, email, phone, or role..."
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
              <Text style={styles.loadingText}>Loading Accounts...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No registered accounts found.</Text>
            </View>
          ) : (
            filteredUsers.map((user) => {
              const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
              const roleDisplay = user.role ? user.role.toUpperCase() : 'PASSENGER';

              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.fullName || 'User'}</Text>
                      <View style={[styles.roleBadge, user.role === 'admin' && styles.adminRoleBadge]}>
                        <Text style={[styles.roleText, user.role === 'admin' && styles.adminRoleText]}>
                          {roleDisplay}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.phone && <Text style={styles.userPhone}>Phone: {user.phone}</Text>}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUser(user.id, user.fullName || user.email)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A' },
  centerContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#2563EB' },
  userInfo: { flex: 1, marginRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 12, color: '#64748B' },
  userPhone: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  roleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  adminRoleBadge: { backgroundColor: '#FEF3C7' },
  roleText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  adminRoleText: { color: '#D97706' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderBottomWidth: 0, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  deleteBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '700', marginLeft: 4 },
});