const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { newId, hashPassword, verifyPassword, newInviteCode } = require('../util');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const AVATARS = ['😎', '🦄', '🐉', '🔥', '⚡', '🎸', '🏀', '🎮', '🌟', '🦊', '🐼', '🍕'];

function signToken(user) {
  return jwt.sign(
    { id: user.id, familyId: user.family_id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, username: user.username, role: user.role, avatar: user.avatar, familyId: user.family_id };
}

// Create a brand new family + parent account
router.post('/signup-parent', (req, res) => {
  const { familyName, name, username, password, avatar } = req.body || {};
  if (!familyName || !name || !username || !password) {
    return res.status(400).json({ error: 'familyName, name, username and password are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'That username is already taken' });

  const familyId = newId('fam');
  const inviteCode = newInviteCode();
  const userId = newId('usr');

  const tx = db.transaction(() => {
    db.prepare('INSERT INTO families (id, name, invite_code) VALUES (?, ?, ?)').run(familyId, familyName, inviteCode);
    db.prepare('INSERT INTO reward_settings (family_id) VALUES (?)').run(familyId);
    db.prepare(
      'INSERT INTO users (id, family_id, name, username, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, familyId, name, username, hashPassword(password), 'parent', avatar || '🧑‍👩‍👧');
  });
  tx();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(user), user: publicUser(user), inviteCode });
});

// Join an existing family as a kid, using the parent's invite code
router.post('/signup-kid', (req, res) => {
  const { inviteCode, name, username, password, avatar } = req.body || {};
  if (!inviteCode || !name || !username || !password) {
    return res.status(400).json({ error: 'inviteCode, name, username and password are required' });
  }
  const family = db.prepare('SELECT * FROM families WHERE invite_code = ?').get(inviteCode.toUpperCase());
  if (!family) return res.status(404).json({ error: 'Invalid invite code' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'That username is already taken' });

  const userId = newId('usr');
  const chosenAvatar = avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  db.prepare(
    'INSERT INTO users (id, family_id, name, username, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, family.id, name, username, hashPassword(password), 'kid', chosenAvatar);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Wrong username or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

module.exports = { router, publicUser, AVATARS };
