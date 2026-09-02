const express = require('express');
const db = require('../db');
const { newId } = require('../util');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function balanceFor(kidId) {
  const row = db
    .prepare('SELECT COALESCE(SUM(delta), 0) as total FROM point_transactions WHERE kid_id = ?')
    .get(kidId);
  return row.total;
}

function kidSummary(user) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    points: balanceFor(user.id),
  };
}

// Everything a logged-in user needs to know about their family
router.get('/me', requireAuth, (req, res) => {
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(req.user.familyId);
  const settings = db.prepare('SELECT * FROM reward_settings WHERE family_id = ?').get(req.user.familyId);
  const gifts = db.prepare('SELECT * FROM gift_options WHERE family_id = ? ORDER BY cost_points ASC').all(req.user.familyId);
  const kids = db
    .prepare("SELECT * FROM users WHERE family_id = ? AND role = 'kid' ORDER BY created_at ASC")
    .all(req.user.familyId)
    .map(kidSummary);

  res.json({
    family: { id: family.id, name: family.name, inviteCode: req.user.role === 'parent' ? family.invite_code : undefined },
    settings: {
      threshold: settings.threshold,
      pointValueCents: settings.point_value_cents,
      currency: settings.currency,
    },
    gifts: gifts.map((g) => ({ id: g.id, name: g.name, emoji: g.emoji, costPoints: g.cost_points })),
    kids,
  });
});

router.put('/settings', requireAuth, requireRole('parent'), (req, res) => {
  const { threshold, pointValueCents, currency } = req.body || {};
  const current = db.prepare('SELECT * FROM reward_settings WHERE family_id = ?').get(req.user.familyId);
  const next = {
    threshold: threshold !== undefined ? Number(threshold) : current.threshold,
    pointValueCents: pointValueCents !== undefined ? Math.round(Number(pointValueCents)) : current.point_value_cents,
    currency: currency || current.currency,
  };
  if (Number.isNaN(next.threshold) || Number.isNaN(next.pointValueCents)) {
    return res.status(400).json({ error: 'threshold and pointValueCents must be numbers' });
  }
  db.prepare('UPDATE reward_settings SET threshold = ?, point_value_cents = ?, currency = ? WHERE family_id = ?').run(
    next.threshold,
    next.pointValueCents,
    next.currency,
    req.user.familyId
  );
  res.json({ threshold: next.threshold, pointValueCents: next.pointValueCents, currency: next.currency });
});

router.post('/gifts', requireAuth, requireRole('parent'), (req, res) => {
  const { name, emoji, costPoints } = req.body || {};
  if (!name || !costPoints) return res.status(400).json({ error: 'name and costPoints are required' });
  const id = newId('gift');
  db.prepare('INSERT INTO gift_options (id, family_id, name, emoji, cost_points) VALUES (?, ?, ?, ?, ?)').run(
    id,
    req.user.familyId,
    name,
    emoji || '🎁',
    Math.round(Number(costPoints))
  );
  res.status(201).json({ id, name, emoji: emoji || '🎁', costPoints: Math.round(Number(costPoints)) });
});

router.delete('/gifts/:id', requireAuth, requireRole('parent'), (req, res) => {
  const result = db
    .prepare('DELETE FROM gift_options WHERE id = ? AND family_id = ?')
    .run(req.params.id, req.user.familyId);
  if (result.changes === 0) return res.status(404).json({ error: 'Gift not found' });
  res.status(204).end();
});

module.exports = { router, balanceFor, kidSummary };
