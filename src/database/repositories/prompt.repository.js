import { getSupabaseClient } from '../supabase.js';

export async function getPrompts(userId, { category, page = 1, limit = 100 } = {}) {
  const supabase = getSupabaseClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { prompts: data || [], count };
}

export async function createPrompt(userId, data) {
  const supabase = getSupabaseClient();
  const { data: prompt, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      title: data.title,
      content: data.content,
      category: data.category || 'general',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return prompt;
}

export async function updatePrompt(promptId, userId, data) {
  const supabase = getSupabaseClient();
  const updates = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.category !== undefined) updates.category = data.category;

  const { data: prompt, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', promptId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return prompt;
}

export async function deletePrompt(promptId, userId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', promptId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}
