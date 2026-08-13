import app from './app';
import { config } from './config/env';
import { supabase } from './db/client';

const server = app.listen(config.port, async () => {
  console.log(`================================================`);
  console.log(`🚀 BusUp Ticket Reservation Backend Server`);
  console.log(`📡 Environment : ${config.nodeEnv}`);
  console.log(`🌐 Server running at http://localhost:${config.port}`);
  console.log(`🏥 Health Check   : http://localhost:${config.port}/health`);

  try {
    const { error } = await supabase.from('cities').select('*').limit(1);
    if (error) {
      console.log(`⚡ Supabase DB   : ❌ Connection Failed (${error.message})`);
    } else {
      console.log(`⚡ Supabase DB   : ✅ Connected to Supabase successfully!`);
    }
  } catch (err) {
    console.log(`⚡ Supabase DB   : ❌ Connection Failed (${(err as Error).message})`);
  }

  console.log(`================================================`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});
