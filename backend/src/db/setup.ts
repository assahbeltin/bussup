import fs from 'fs';
import path from 'path';
import { dbPool } from './client';

async function runSetup() {
  console.log('🚀 Starting Supabase Database Table Creation & Seeding...');

  try {
    // 1. Read DDL Schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Creating Database Tables (users, cities, terminals, buses, trips, bookings, passengers)...');
    await dbPool.query(schemaSql);
    console.log('✅ Tables created successfully!');

    // 2. Read Seed SQL
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Seeding initial Cameroon bus system data...');
    await dbPool.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    // 3. Verify counts
    const usersCount = await dbPool.query('SELECT COUNT(*) FROM users');
    const citiesCount = await dbPool.query('SELECT COUNT(*) FROM cities');
    const terminalsCount = await dbPool.query('SELECT COUNT(*) FROM terminals');
    const busesCount = await dbPool.query('SELECT COUNT(*) FROM buses');
    const tripsCount = await dbPool.query('SELECT COUNT(*) FROM trips');
    const bookingsCount = await dbPool.query('SELECT COUNT(*) FROM bookings');

    console.log('\n[DB] Database Summary:');
    console.log(`- Users: ${usersCount.rows[0].count}`);
    console.log(`- Cities: ${citiesCount.rows[0].count}`);
    console.log(`- Terminals: ${terminalsCount.rows[0].count}`);
    console.log(`- Buses: ${busesCount.rows[0].count}`);
    console.log(`- Trips: ${tripsCount.rows[0].count}`);
    console.log(`- Bookings: ${bookingsCount.rows[0].count}`);

    console.log('\n🎉 Supabase database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error executing database setup:', error);
    process.exit(1);
  } finally {
    await dbPool.end();
  }
}

runSetup();
