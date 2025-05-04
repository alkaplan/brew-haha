import { supabase } from './supabaseClient';
import { getStoredUserId } from './user';

export async function getCoffees() {
  const { data, error } = await supabase.from('coffees').select('*');
  return data || [];
}

export async function getTastingsForUser(userId) {
  const { data, error } = await supabase
    .from('tastings')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function submitTasting({ userId, coffeeId, flavor_tags, emoji, note }) {
  const { data, error } = await supabase.from('tastings').insert([
    {
      user_id: userId,
      coffee_id: coffeeId,
      flavor_tags,
      emoji,
      note,
    }
  ]);
  return { data, error };
}

export async function upsertTasting({ userId, coffeeId, flavor_tags, emoji, note }) {
  const { data, error } = await supabase.from('tastings').upsert([
    {
      user_id: userId,
      coffee_id: coffeeId,
      flavor_tags,
      emoji,
      note,
    }
  ], { onConflict: ['user_id', 'coffee_id'] });
  return { data, error };
}

export async function getReviewsForUser(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function submitReview({ userId, ranked, would_drink_again }) {
  // ranked: array of coffee ids in order
  // would_drink_again: object { coffeeId: true/false }
  const rows = ranked.map((coffeeId, rank) => ({
    user_id: userId,
    coffee_id: coffeeId,
    rank: rank + 1,
    would_drink_again: !!(would_drink_again && would_drink_again[coffeeId])
  }));
  const { data, error } = await supabase.from('reviews').insert(rows);
  return { data, error };
}

// Admin: get all tastings and reviews
export async function getAllTastings() {
  const { data, error } = await supabase.from('tastings').select('*');
  return data || [];
}

export async function getAllReviews() {
  const { data, error } = await supabase.from('reviews').select('*');
  return data || [];
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  return data || [];
}

export async function updateCoffee(coffee) {
  const { data, error } = await supabase
    .from('coffees')
    .update({
      name: coffee.name,
      description: coffee.description,
      tags: coffee.tags
    })
    .eq('id', coffee.id)
    .select();
  return { data, error };
}

export async function deleteCoffee(id) {
  const { data, error } = await supabase.from('coffees').delete().eq('id', id);
  return { data, error };
}

export async function deleteUser(id) {
  const { data, error } = await supabase.from('users').delete().eq('id', id);
  return { data, error };
}

export async function updateTasting(tasting) {
  const { data, error } = await supabase
    .from('tastings')
    .update({
      flavor_tags: tasting.flavor_tags,
      emoji: tasting.emoji,
      note: tasting.note
    })
    .eq('id', tasting.id)
    .select();
  return { data, error };
}

export async function deleteTasting(id) {
  const { data, error } = await supabase.from('tastings').delete().eq('id', id);
  return { data, error };
}

export async function updateReview(review) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rank: review.rank
    })
    .eq('id', review.id)
    .select();
  return { data, error };
}

export async function deleteReview(id) {
  const { data, error } = await supabase.from('reviews').delete().eq('id', id);
  return { data, error };
}

export async function deleteUserData(userId) {
  // Delete tastings
  await supabase.from('tastings').delete().eq('user_id', userId);
  // Delete reviews
  await supabase.from('reviews').delete().eq('user_id', userId);
  // Delete user
  const { data, error } = await supabase.from('users').delete().eq('id', userId);
  return { data, error };
}

// FLAVOR TAGS CRUD
export async function getFlavorTags() {
  const { data, error } = await supabase.from('flavor_tags').select('*').order('name');
  return data || [];
}

export async function addFlavorTag({ name, description }) {
  const { data, error } = await supabase.from('flavor_tags').insert([{ name, description }]).select().single();
  return { data, error };
}

export async function updateFlavorTag({ id, name, description }) {
  const { data, error } = await supabase.from('flavor_tags').update({ name, description }).eq('id', id).select().single();
  return { data, error };
}

export async function deleteFlavorTag(id) {
  const { data, error } = await supabase.from('flavor_tags').delete().eq('id', id);
  return { data, error };
} 