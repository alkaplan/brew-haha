import { supabase } from './supabaseClient.js';

export async function getOrCreateUser(name) {
  // First check if the name exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .single();

  if (existingUser) {
    // Name is already taken
    return null;
  }

  // If name doesn't exist, create the user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ name }])
    .select()
    .single();

  if (newUser) {
    // Store user.id in localStorage for later use
    if (typeof window !== 'undefined') {
      localStorage.setItem('coffeeHouseUserId', newUser.id);
      localStorage.setItem('coffeeHouseName', name);
    }
  }

  return newUser;
}

export function getStoredUserId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('coffeeHouseUserId');
  }
  return null;
} 