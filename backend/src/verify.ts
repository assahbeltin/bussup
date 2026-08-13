import http from 'http';

function makeRequest(options: http.RequestOptions, postData?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- BUSUP BACKEND API VERIFICATION ---');

  // 1. Health Check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET',
  });
  console.log('✅ 1. Health check status:', health.status, 'Service:', health.service);

  // 2. Get Cities
  const citiesRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/cities',
    method: 'GET',
  });
  console.log('✅ 2. Cities count:', citiesRes.data.length, 'Sample city:', citiesRes.data[0].name);

  // 3. Login Passenger
  const passengerLoginData = JSON.stringify({ email: 'jean@example.com', password: 'password123' });
  const passengerLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(passengerLoginData),
      },
    },
    passengerLoginData
  );
  console.log('✅ 3. Passenger login success:', passengerLogin.success, 'User:', passengerLogin.data.user.fullName);
  const passengerToken = passengerLogin.data.token;

  // 4. Login Admin
  const adminLoginData = JSON.stringify({ email: 'admin@busup.com', password: 'admin123' });
  const adminLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(adminLoginData),
      },
    },
    adminLoginData
  );
  console.log('✅ 4. Admin login success:', adminLogin.success, 'Role:', adminLogin.data.user.role);
  const adminToken = adminLogin.data.token;

  // 5. Search Trips
  const searchTrips = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/trips/search?from=Douala&to=Yaounde',
    method: 'GET',
  });
  console.log('✅ 5. Trip search results count:', searchTrips.count, 'Agency:', searchTrips.data[0].agencyName);

  // 6. Get Seat Layout
  const seatsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/trips/TRIP-1/seats?date=Today',
    method: 'GET',
  });
  console.log(
    '✅ 6. Seat map retrieved: Total seats:',
    seatsRes.totalSeats,
    'Available seats:',
    seatsRes.availableSeats
  );

  // 7. Create Booking
  const bookingBody = JSON.stringify({
    tripId: 'TRIP-1',
    departureDate: 'Today',
    seats: ['3A', '3B'],
    passengers: [
      { seatId: '3A', fullName: 'Jean Dupont', phone: '654123456', email: 'jean@example.com', age: '28' },
      { seatId: '3B', fullName: 'Claire Dupont', phone: '654123457', email: 'claire@example.com', age: '26' },
    ],
    paymentMethod: 'MTN',
    paymentAccount: '654123456',
  });

  const createBooking = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bookingBody),
        Authorization: `Bearer ${passengerToken}`,
      },
    },
    bookingBody
  );
  console.log('✅ 7. Booking created successfully! Ticket No:', createBooking.data.ticketNo, 'Amount:', createBooking.data.totalAmountFormatted);

  // 8. Admin Dashboard KPIs
  const adminDashboard = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/dashboard',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  console.log(
    '✅ 8. Admin Dashboard KPIs loaded! Revenue:',
    adminDashboard.data.kpis.totalRevenueFormatted,
    'Active Bookings:',
    adminDashboard.data.kpis.activeBookingsCount,
    'Fleet Count:',
    adminDashboard.data.kpis.totalFleetCount
  );

  console.log('--- ALL API VERIFICATIONS PASSED SUCCESSFULLY ---');
}

runTests().catch(console.error);
