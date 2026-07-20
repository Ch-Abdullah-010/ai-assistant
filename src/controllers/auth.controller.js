import { getSupabaseClient } from '../database/supabase.js';
import { config } from '../config/index.js';

export async function signUp(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    res.status(201).json({
      message: 'Account created successfully. Please check your email for verification.',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (error.message.includes('Email not confirmed')) {
        return res.status(403).json({ error: 'Please verify your email before signing in' });
      }
      return res.status(401).json({ error: error.message });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at,
        profile: profile || null,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function signOut(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        profile: profile || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}
