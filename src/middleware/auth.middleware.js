import { getSupabaseClient } from '../database/supabase.js';

const TOKEN_EXPIRY_BUFFER_SECONDS = 300;

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ error: 'Malformed token' });
    }

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (configError) {
      return res.status(500).json({ error: 'Authentication service not configured' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (user.email && !user.email_confirmed_at && user.created_at === user.last_sign_in_at) {
      // User exists but email not confirmed — still allow for now
    }

    const tokenExp = user?.app_metadata?.exp ? user.app_metadata.exp : null;
    if (tokenExp) {
      const now = Math.floor(Date.now() / 1000);
      if (now > tokenExp - TOKEN_EXPIRY_BUFFER_SECONDS) {
        return res.status(401).json({ error: 'Token expired' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
