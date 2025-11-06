// controllers/authController.js
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');
const crypto = require('crypto');
const Player = require('../models/Player');

const SESSION_TTL_DAYS = parseInt(process.env.SESSION_TTL_DAYS || '365', 10);
const generatePlayerId = () =>
  'c' + crypto.randomUUID().replace(/-/g, '').slice(0, 25);
const signSession = (player) => {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 864e5); // gün → ms
  const token = jwt.sign(
    { type: 'session', pid: player.playerId, provider: player.provider },
    process.env.JWT_SECRET,
    { expiresIn: `${SESSION_TTL_DAYS}d` }
  );
  return { token, expiresAt };
};

const setSessionCookie = (res, token, expiresAt) => {
  res.cookie('session', token, {
    httpOnly: true,
    secure: true, // Render HTTPS, mütləq true
    sameSite: 'none', // ŞƏRTSİZ NONE — prod check etmə
    expires: expiresAt,
    path: '/',
  });
};
// -------- Google ilə giriş (Supabase) ----------
exports.loginWithGoogleSupabase = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ message: 'access_token is required' });
    }

    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data?.user) {
      return res
        .status(401)
        .json({ message: 'Invalid Supabase token', error: error?.message });
    }

    const sbUser = data.user;
    const email = (sbUser.email || '').toLowerCase() || null;
    const name =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      (email ? email.split('@')[0] : 'User');
    const image =
      sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || '';

    let player = email ? await Player.findOne({ email }) : null;

    if (!player) {
      player = await Player.create({
        playerId: generatePlayerId(),
        name,
        email,
        image,
        provider: 'google',
        providerId: sbUser.id,
      });
    } else {
      // ad/şəkil dəyişibsə güncəllə (opsional)
      const updates = {};
      if (!player.image && image) updates.image = image;
      if (player.name !== name && name) updates.name = name;
      if (Object.keys(updates).length) {
        await Player.updateOne({ _id: player._id }, { $set: updates });
        Object.assign(player, updates);
      }
    }

    const { token, expiresAt } = signSession(player);
    setSessionCookie(res, token, expiresAt);

    return res.json({
      user: {
        name: player.name,
        email: player.email,
        image: player.image || '',
        playerId: player.playerId,
        provider: 'google',
      },
      expires: expiresAt.toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// -------- Qonaq kimi giriş ----------
exports.loginAsGuest = async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname || nickname.trim().length < 3) {
      return res
        .status(400)
        .json({ message: 'Nickname must be at least 3 characters' });
    }

    const tag = crypto.randomBytes(4).toString('hex'); // 8 simvol (məs: 4617d840)
    const displayName = `${nickname.trim()}#${tag}`;

    const player = await Player.create({
      playerId: generatePlayerId(),
      name: displayName,
      provider: 'guest',
    });

    const { token, expiresAt } = signSession(player);
    setSessionCookie(res, token, expiresAt);

    return res.json({
      user: {
        name: player.name,
        playerId: player.playerId,
        provider: 'guest',
      },
      expires: expiresAt.toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// -------- Aktiv sessiya məlumatı ----------
exports.getMe = async (req, res) => {
  const p = req.player;
  const expIso = req.session?.exp
    ? new Date(req.session.exp * 1000).toISOString()
    : new Date(Date.now() + SESSION_TTL_DAYS * 864e5).toISOString();

  const base = {
    name: p.name,
    playerId: p.playerId,
    provider: p.provider,
  };
  if (p.provider === 'google') {
    base.email = p.email;
    base.image = p.image || '';
  }

  return res.json({
    user: base,
    expires: expIso,
  });
};

// -------- Çıxış (session sil) ----------
exports.logout = async (_req, res) => {
  res.clearCookie('session', { path: '/' });
  return res.status(204).send();
};
