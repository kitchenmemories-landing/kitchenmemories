import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://anfcijhabsneciwxqfgs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WUiTy6R_-OuH030PlED84g_1_ZF4_K6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, description, image_url, recipe_category, tags, is_favourite, servings, prep_time, cook_time, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchRecipe(id) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export function formatTime(minutes) {
  if (!minutes) return null;
  const m = parseInt(minutes);
  if (isNaN(m) || m === 0) return null;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}
