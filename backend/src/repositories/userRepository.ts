import { supabase, dbPool } from '../db/client';
import { User } from '../models/User';
import { memoryStore } from './memoryStore';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.trim())
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.password_hash,
          role: data.role,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for findByEmail:', (err as Error).message);
    }

    try {
      const query = `
        SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash", role, created_at as "createdAt"
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `;
      const result = await dbPool.query(query, [email]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (error) {
      // ignore
    }

    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.password_hash,
          role: data.role,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for findById:', (err as Error).message);
    }

    try {
      const query = `
        SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash", role, created_at as "createdAt"
        FROM users
        WHERE id = $1
        LIMIT 1
      `;
      const result = await dbPool.query(query, [id]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (error) {
      // ignore
    }

    return memoryStore.users.find((u) => u.id === id) || null;
  }

  async create(user: User): Promise<User> {
    try {
      const supabaseRow = {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        password_hash: user.passwordHash,
        role: user.role,
        created_at: user.createdAt,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(supabaseRow)
        .select('*')
        .single();

      if (!error && data) {
        console.log('[Supabase] Successfully saved user registration to Supabase users table:', data.email);
        memoryStore.users.push(user);
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.password_hash,
          role: data.role,
          createdAt: data.created_at,
        };
      } else if (error) {
        console.warn('[Supabase] Insert error for create user:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase] Insert exception for create user:', (err as Error).message);
    }

    try {
      const query = `
        INSERT INTO users (id, full_name, email, phone, password_hash, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, full_name as "fullName", email, phone, password_hash as "passwordHash", role, created_at as "createdAt"
      `;
      const values = [
        user.id,
        user.fullName,
        user.email,
        user.phone,
        user.passwordHash,
        user.role,
        user.createdAt,
      ];
      const result = await dbPool.query(query, values);
      memoryStore.users.push(user);
      return result.rows[0];
    } catch (error) {
      console.warn('[DB] Database query failed for create user, saving to memoryStore:', (error as Error).message);
      memoryStore.users.push(user);
      return user;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          fullName: d.full_name,
          email: d.email,
          phone: d.phone,
          passwordHash: d.password_hash,
          role: d.role,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('[DB] Supabase query failed for findAll users:', (err as Error).message);
    }

    try {
      const query = `
        SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash", role, created_at as "createdAt"
        FROM users
        ORDER BY created_at DESC
      `;
      const result = await dbPool.query(query);
      if (result.rows.length > 0) return result.rows;
    } catch (error) {
      // ignore
    }

    return memoryStore.users;
  }

  async delete(id: string): Promise<boolean> {
    memoryStore.users = memoryStore.users.filter((u) => u.id !== id);
    try {
      await supabase.from('users').delete().eq('id', id);
      return true;
    } catch (err) {
      console.warn('[DB] Supabase delete user failed:', (err as Error).message);
      return true;
    }
  }
}

export const userRepository = new UserRepository();
