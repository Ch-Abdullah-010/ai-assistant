import { getSupabaseClient } from '../supabase.js';

export async function findChatsByUserId(userId, { search, pinned, page = 1, limit = 50 } = {}) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('chats')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (pinned !== undefined) {
    query = query.eq('pinned', pinned);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    chats: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function findChatById(chatId, userId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function createChat(userId, title = 'New Chat') {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChat(chatId, userId, updates) {
  const supabase = getSupabaseClient();

  const allowedFields = ['title', 'pinned'];
  const sanitizedUpdates = {};

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  sanitizedUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('chats')
    .update(sanitizedUpdates)
    .eq('id', chatId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function deleteChat(chatId, userId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function searchChats(userId, query) {
  if (!query || query.trim().length === 0) {
    return findChatsByUserId(userId);
  }

  return findChatsByUserId(userId, { search: query });
}
