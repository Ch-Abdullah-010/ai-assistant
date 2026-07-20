import { getSupabaseClient } from '../supabase.js';

export async function createFile(data) {
  const supabase = getSupabaseClient();
  const { data: file, error } = await supabase
    .from('chat_files')
    .insert({
      chat_id: data.chat_id,
      user_id: data.user_id,
      message_id: data.message_id || null,
      original_name: data.original_name,
      stored_name: data.stored_name,
      mime_type: data.mime_type,
      size: data.size,
      storage_path: data.storage_path,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return file;
}

export async function getFilesByChatId(chatId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_files')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getFilesByMessageId(messageId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_files')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getFileById(fileId, userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFile(fileId, userId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('chat_files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function updateFileMessageId(fileId, userId, messageId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_files')
    .update({ message_id: messageId })
    .eq('id', fileId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
