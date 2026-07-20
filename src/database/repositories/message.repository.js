import { getSupabaseClient } from '../supabase.js';

export async function findMessagesByChatId(chatId, userId, { page = 1, limit = 100 } = {}) {
  const supabase = getSupabaseClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    messages: data || [],
    total: count || 0,
    page,
    limit,
  };
}

export async function createMessage(chatId, userId, role, content) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', userId);

  return data;
}

export async function createMessagesBulk(chatId, userId, messages) {
  const supabase = getSupabaseClient();

  const formattedMessages = messages.map((msg) => ({
    chat_id: chatId,
    user_id: userId,
    role: msg.role,
    content: msg.content,
  }));

  const { data, error } = await supabase
    .from('messages')
    .insert(formattedMessages)
    .select();

  if (error) throw error;

  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', userId);

  return data;
}

export async function deleteMessagesByChatId(chatId, userId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function getLastMessage(chatId, userId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('messages')
    .select('content, role, created_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}
