import { getSupabaseClient } from '../supabase.js';

export async function getSystemStats() {
  const supabase = getSupabaseClient();

  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw new Error(usersError.message);

  const { count: totalChats, error: chatsError } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true });

  if (chatsError) throw new Error(chatsError.message);

  const { count: totalMessages, error: messagesError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  if (messagesError) throw new Error(messagesError.message);

  const { count: totalFiles, error: filesError } = await supabase
    .from('chat_files')
    .select('*', { count: 'exact', head: true });

  if (filesError) throw new Error(filesError.message);

  return {
    totalUsers: totalUsers || 0,
    totalChats: totalChats || 0,
    totalMessages: totalMessages || 0,
    totalFiles: totalFiles || 0,
  };
}

export async function getUsers({ page = 1, limit = 50, search } = {}) {
  const supabase = getSupabaseClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  return { users: data || [], count };
}

export async function getUser(userId) {
  const supabase = getSupabaseClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw new Error(profileError.message);

  const { count: chatCount } = await supabase
    .from('chats')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: messageCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    ...profile,
    chatCount: chatCount || 0,
    messageCount: messageCount || 0,
  };
}

export async function updateUserRole(userId, role) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(userId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw new Error(error.message);
}
