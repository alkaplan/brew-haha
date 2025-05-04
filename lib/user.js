import { supabase } from './supabaseClient';

export async function getOrCreateUser(name) {
  // Try to find the user by name
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .single();

  if (!user) {
    // If not found, create the user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name }])
      .single();
    user = newUser;
  }

  // Store user.id in localStorage for later use
  if (user) {
    localStorage.setItem('brewHahaUserId', user.id);
  }

  return user;
}

export function getStoredUserId() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('brewHahaUserId');
  }
  return null;
} 