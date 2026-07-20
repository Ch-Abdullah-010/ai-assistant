import { getSupabaseClient } from '../database/supabase.js';

export async function requireAdmin(req, res, next) {
  try {
    const supabase = getSupabaseClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user.role = profile.role;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
}
