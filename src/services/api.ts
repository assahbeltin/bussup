import { Platform } from 'react-native';
import { getAuthToken, setAuthToken, setCurrentUser, getCurrentUser } from './authStore';

// Configure Base URL for Local Node Backend Server (Port 5000)
const DEV_PORT = '5000';
export const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEV_PORT}/api/v1`;
  }
  return `http://localhost:${DEV_PORT}/api/v1`;
};

export interface AuthUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'passenger' | 'admin';
  createdAt: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUserResponse;
    token: string;
  };
}

export async function loginApi(email: string, password: string): Promise<AuthApiResponse> {
  try {
    const response = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network request failed. Is backend server running on port 5000?',
    };
  }
}

export async function registerApi(
  fullName: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthApiResponse> {
  try {
    const response = await fetch(`${getBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, phone, password }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network request failed. Is backend server running on port 5000?',
    };
  }
}

export interface TripApiItem {
  id: string;
  busId: string;
  agencyName: string;
  rating: number;
  reviewsCount: number;
  fromCity: string;
  fromTerminal: string;
  toCity: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busType: string;
  priceFCFA: number;
  priceFormatted: string;
  journeyShift: string;
  amenities: string[];
}

export async function searchTripsApi(
  from?: string,
  to?: string,
  journeyShift?: string
): Promise<{ success: boolean; data: TripApiItem[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (journeyShift && journeyShift !== 'All') queryParams.append('journeyShift', journeyShift);

    const response = await fetch(`${getBaseUrl()}/trips/search?${queryParams.toString()}`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return { success: true, data: result.data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.warn('[API] Network fetch for trips search failed:', error);
    return { success: false, data: [] };
  }
}

export interface SeatApiItem {
  id: string;
  row: number;
  label: string;
  isBooked: boolean;
}

export async function getSeatsApi(
  tripId: string,
  departureDate: string = 'Today',
  userId?: string
): Promise<{ success: boolean; data: SeatApiItem[]; availableSeats?: number; totalSeats?: number }> {
  try {
    let url = `${getBaseUrl()}/trips/${tripId}/seats?date=${encodeURIComponent(departureDate)}`;
    if (userId) {
      url += `&userId=${encodeURIComponent(userId)}`;
    }
    const response = await fetch(url);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        data: result.data,
        availableSeats: result.availableSeats,
        totalSeats: result.totalSeats,
      };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.warn('[API] Network fetch for seat availability failed:', error);
    return { success: false, data: [] };
  }
}

export async function holdSeatsApi(
  tripId: string,
  date: string,
  seatIds: string[],
  userId: string
): Promise<{ success: boolean; conflictSeats?: string[] }> {
  try {
    const response = await fetch(`${getBaseUrl()}/trips/${tripId}/holds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, seatIds, userId }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('[API] Network fetch for seat hold failed:', error);
    return { success: false };
  }
}

export async function releaseSeatsApi(
  tripId: string,
  date: string,
  seatIds?: string[],
  userId?: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${getBaseUrl()}/trips/${tripId}/holds`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, seatIds, userId }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn('[API] Network fetch for seat release failed:', error);
    return { success: false };
  }
}

export interface CreateBookingParams {
  tripId: string;
  departureDate: string;
  seats: string[];
  paymentMethod: string;
  paymentAccount?: string;
  passengers?: Array<{
    seatId: string;
    fullName: string;
    phone: string;
    email?: string;
    age?: string;
  }>;
}

export async function createBookingApi(
  bookingData: CreateBookingParams,
  token?: string
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const activeToken = token || getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const response = await fetch(`${getBaseUrl()}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to create booking reservation',
    };
  }
}

export async function getMyBookingsApi(
  token?: string
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const activeToken = token || getAuthToken();
    const user = getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
    const response = await fetch(`${getBaseUrl()}/bookings/my-bookings${emailQuery}`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch user bookings',
    };
  }
}

/* ==========================================================================
   ADMIN PORTAL API ENDPOINTS
   ========================================================================== */

let cachedAdminToken = '';

const getAdminHeaders = async (): Promise<Record<string, string>> => {
  const user = getCurrentUser();
  const token = getAuthToken();

  if (cachedAdminToken) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cachedAdminToken}`,
    };
  }

  if (user && user.role === 'admin' && token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const loginRes = await loginApi('admin@busup.com', 'admin123');
    if (loginRes.success && loginRes.data?.token) {
      cachedAdminToken = loginRes.data.token;
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cachedAdminToken}`,
      };
    }
  } catch (e) {
    console.warn('[API] Auto admin login fallback failed:', e);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function adminFetch(endpointPath: string, options: RequestInit = {}): Promise<any> {
  try {
    let headers = await getAdminHeaders();
    const fullUrl = `${getBaseUrl()}${endpointPath}`;

    let response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      cachedAdminToken = '';
      headers = await getAdminHeaders();
      response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.warn(`[API] Admin request to ${endpointPath} failed:`, error);
    return { success: false, message: error?.message || 'Network request failed' };
  }
}

export async function getAdminDashboardApi(): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch('/admin/dashboard');
}

export async function getAdminFleetApi(): Promise<{ success: boolean; data?: any[]; count?: number; message?: string }> {
  return adminFetch('/admin/fleet');
}

export async function addBusApi(payload: {
  agencyName?: string;
  busNumber: string;
  type: string;
  driverName: string;
  totalSeats?: number;
  fromCity?: string;
  toCity?: string;
  departureTime?: string;
  priceFCFA?: number;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch('/admin/fleet', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBusStatusApi(
  id: string,
  status: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch(`/admin/fleet/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminBookingsApi(): Promise<{ success: boolean; data?: any[]; count?: number; message?: string }> {
  return adminFetch('/admin/bookings');
}

export async function createManualAdminBookingApi(payload: {
  tripId: string;
  fullName: string;
  email: string;
  phone: string;
  seatId?: string;
  paymentMethod?: string;
  status?: string;
  departureDate?: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch('/admin/bookings/manual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBookingStatusApi(
  id: string,
  status: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch(`/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function revokeBookingApi(
  id: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch(`/admin/bookings/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteAllAdminBookingsApi(): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch('/admin/bookings/all', {
    method: 'DELETE',
  });
}

export async function getAdminTripsApi(): Promise<{ success: boolean; data?: any[]; count?: number; message?: string }> {
  return adminFetch('/admin/trips');
}

export async function createTripApi(payload: any): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch('/admin/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTripApi(id: string, payload: any): Promise<{ success: boolean; data?: any; message?: string }> {
  return adminFetch(`/admin/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTripApi(id: string): Promise<{ success: boolean; message?: string }> {
  return adminFetch(`/admin/trips/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminUsersApi(): Promise<{ success: boolean; data?: any[]; count?: number; message?: string }> {
  return adminFetch('/admin/users');
}

export async function deleteAdminUserApi(id: string): Promise<{ success: boolean; message?: string }> {
  return adminFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}
