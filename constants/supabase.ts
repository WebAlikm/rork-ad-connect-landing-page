import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbpinqcrbtmspgbejbzg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicGlucWNyYnRtc3BnYmVqYnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzEwNTQsImV4cCI6MjA3MDEwNzA1NH0.AXKy8xBYUanQI7BcKogKVwgzs1bMjqc3wkurFPKXy1o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the waitlist table
export interface WaitlistEntry {
  id?: number; // Auto-generated ID
  email: string;
  created_at?: string;
}

// Database operations
export const addToWaitlist = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Attempting to add email to waitlist:', email);
    
    // Try to create waitlist table first if it doesn't exist
    const { error: createError } = await supabase.rpc('create_waitlist_table_if_not_exists');
    if (createError && !createError.message.includes('already exists')) {
      console.log('Could not create waitlist table, will try direct insert:', createError.message);
    }
    
    // Try inserting into waitlist table first
    let { data, error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase() })
      .select();

    // If waitlist table doesn't exist, try creating it via SQL
    if (error && error.code === '42P01') {
      console.log('Waitlist table not found, trying to create it...');
      
      // Try to create the table using SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
          
          -- Create policy to allow inserts
          CREATE POLICY "Allow public inserts" ON waitlist
            FOR INSERT WITH CHECK (true);
          
          -- Create policy to allow selects
          CREATE POLICY "Allow public selects" ON waitlist
            FOR SELECT USING (true);
        `
      });
      
      if (sqlError) {
        console.log('Could not create table via SQL, falling back to users table');
        // Fall back to trying users table without foreign key constraints
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({ email: email.trim().toLowerCase() })
          .select();
          
        if (userError) {
          return handleDatabaseError(userError);
        }
        
        console.log('Successfully added to users table:', userData);
        return { success: true };
      } else {
        // Try inserting again after creating the table
        const { data: newData, error: newError } = await supabase
          .from('waitlist')
          .insert({ email: email.trim().toLowerCase() })
          .select();
          
        if (newError) {
          return handleDatabaseError(newError);
        }
        
        console.log('Successfully added to new waitlist table:', newData);
        return { success: true };
      }
    }

    if (error) {
      return handleDatabaseError(error);
    }

    console.log('Successfully added to waitlist:', data);
    return { success: true };
  } catch (error) {
    console.error('Network error details:', error);
    let errorMessage = 'Network error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        errorMessage = 'Database permission error. Please check your Supabase RLS policies.';
      }
    }
    
    return { success: false, error: errorMessage };
  }
};

// Helper function to handle database errors
const handleDatabaseError = (error: any): { success: boolean; error: string } => {
  console.error('Supabase error details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
  
  // Provide more user-friendly error messages
  let userMessage = error.message || 'Database error occurred';
  if (error.code === '23505') {
    userMessage = 'This email is already registered';
  } else if (error.code === '23502') {
    userMessage = 'Missing required field. Please contact support.';
  } else if (error.code === '23503') {
    userMessage = 'Database constraint error. Please contact support.';
  } else if (error.code === '42P01') {
    userMessage = 'Database table not found. Please contact support.';
  } else if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
    userMessage = 'Database access denied. Please contact support.';
  } else if (error.code === 'PGRST301') {
    userMessage = 'Database permission error. Please contact support.';
  } else if (error.message.includes('foreign key') || error.message.includes('constraint')) {
    userMessage = 'Database constraint error. Please contact support.';
  }
  
  return { success: false, error: userMessage };
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log('Checking if email exists:', email);
    
    // Try waitlist table first
    let { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    // If waitlist table doesn't exist, try users table
    if (error && error.code === '42P01') {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
        
      data = userData;
      error = userError;
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking email details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If it's a permission error, we should still try to insert and let that fail with proper error
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        console.log('Permission error during email check, will proceed with insert');
        return false;
      }
      
      // For other errors, assume false to allow the user to proceed
      return false;
    }

    console.log('Email check result:', !!data);
    return !!data;
  } catch (error) {
    console.error('Network error checking email details:', error);
    // For email checking, we'll assume false on error to allow the user to proceed
    return false;
  }
};

// Test Supabase connection
export const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Try a simple select query to test connection and permissions
    // First try waitlist table, then fall back to users table
    let { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .limit(1);

    // If waitlist table doesn't exist, try users table
    if (error && error.code === '42P01') {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
        
      data = userData;
      error = userError;
    }

    if (error) {
      console.error('Connection test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      let errorMessage = error.message;
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        errorMessage = 'Permission denied. Please configure Row Level Security policies in your Supabase dashboard.';
      } else if (error.code === '42P01') {
        errorMessage = 'No suitable table found. Please create a waitlist or users table in your Supabase database.';
      }
      
      return { success: false, error: errorMessage };
    }

    console.log('Connection test successful, data:', data);
    return { success: true };
  } catch (error) {
    console.error('Connection test network error:', error);
    let errorMessage = 'Connection test failed';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to Supabase. Please check your internet connection.';
      }
    }
    
    return { success: false, error: errorMessage };
  }
};