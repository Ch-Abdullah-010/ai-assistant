import { getSupabaseClient } from '../database/supabase.js';

export async function getProfile(req, res, next) {
  try {
    const supabase = getSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      profile: profile || {
        id: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, avatar_url, language, timezone } = req.body;
    const supabase = getSupabaseClient();

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (language !== undefined) updates.language = language;
    if (timezone !== undefined) updates.timezone = timezone;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.user.id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ id: req.user.id, email: req.user.email, ...updates })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    }

    res.json({ profile: result });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { theme, font_size, voice_enabled, system_prompt } = req.body;
    const supabase = getSupabaseClient();

    const updates = {};
    if (theme !== undefined) updates.theme = theme;
    if (font_size !== undefined) updates.font_size = font_size;
    if (voice_enabled !== undefined) updates.voice_enabled = voice_enabled;
    if (system_prompt !== undefined) updates.system_prompt = system_prompt;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No settings to update' });
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.user.id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ id: req.user.id, email: req.user.email, ...updates })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      result = data;
    }

    res.json({ profile: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const supabase = getSupabaseClient();

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', req.user.id);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(req.user.id);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(req, res, next) {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', req.user.id);

    if (chatError) {
      console.error('Chat deletion error:', chatError);
    }

    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    next(error);
  }
}
