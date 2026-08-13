import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { config } from '../config/env';

// Supabase JS Client for Auth / Storage / Realtime / RPC
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey || config.supabaseAnonKey
);

// PostgreSQL Direct Pool Connection
export const dbPool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});
