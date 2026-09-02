const express = require('express');
const db = require('../db');
const { newId } = require('../util');
const { requireAuth, requireRole } = require('../middleware/auth');
const { balanceFor } = require('./family');

const router = express.Router();

function serialize(r) {
  return {
    id: r.id,
    kidId: r.kid_id,
    type: r.type,
    pointsSpent: r.points_spent,
    label: r.label,
    status: r.status,
    createdAt: r.created_at,
    decidedAt: r.decided_at,
  };
}

router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.user.role === 'kid') {
    rows = db.prepare('SELECT * FROM redemptions WHERE kid_id = ? ORDER BY created_at DESC').all(req.user.id);
  } else {
    rows = db.prepare('SELECT * FROM redemptions WHERE family_id = ? ORDER BY created_at DESC').all(req.user.familyId);
  }
  res.json(rows.map(serialize));
});

// Kid asks to cash out points, either for money or a gift from the family's gift list
router.post('/', requireAuth, requireRole('kid'), (req, res) => {
  const { type, giftId, points } = req.body || {};
  if (!['cash', 'gift'].includes(type)) return res.status(400).json({ error: "type must be 'cash' or 'gift'" });

  const balance = balanceFor(req.user.id);
  let pointsSpent;
  let label;

  if (type === 'gift') {
    const gift = db.prepare('SELECT * FROM gift_options WHERE id = ? AND family_id = ?').get(giftId, req.user.familyId);
    if (!gift) return res.status(404).json({ error: 'Gift not found' });
    pointsSpent = gift.cost_points;
    label = `${gift.emoji} ${gift.name}`;
  } else {
    pointsSpent = Math.round(Number(points));
    if (!pointsSpent || pointsSpent <= 0) return res.status(400).json({ error: 'points must be a positive number' });
    const settings = db.prepare('SELECT * FROM reward_settings WHERE family_id = ?').get(req.user.familyId);
    const dollars = (pointsSpent * settings.point_value_cents) / 100;
    label = `Cash out: $${dollars.toFixed(2)}`;
  }

  if (pointsSpent > balance) return res.status(400).json({ error: 'Not enough points for that' });

  const id = newId('rdm');
  db.prepare(
    'INSERT INTO redemptions (id, kid_id, family_id, type, points_spent, label) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, req.user.familyId, type, pointsSpent, label);

  res.status(201).json(serialize(db.prepare('SELECT * FROM redemptions WHERE id = ?').get(id)));
});

// Parent fulfills or declines a redemption request. Fulfilling deducts the points; declining refunds nothing (never charged).
router.post('/:id/decide', requireAuth, requireRole('parent'), (req, res) => {
  const { decision } = req.body || {};
  if (!['fulfill', 'decline'].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'fulfill' or 'decline'" });
  }
  const redemption = db
    .prepare('SELECT * FROM redemptions WHERE id = ? AND family_id = ?')
    .get(req.params.id, req.user.familyId);
  if (!redemption) return res.status(404).json({ error: 'Redemption not found' });
  if (redemption.status !== 'requested') return res.status(409).json({ error: 'Already decided' });

  const tx = db.transaction(() => {
    if (decision === 'fulfill') {
      db.prepare("UPDATE redemptions SET status = 'fulfilled', decided_at = datetime('now') WHERE id = ?").run(
        redemption.id
      );
      db.prepare(
        'INSERT INTO point_transactions (id, kid_id, family_id, delta, reason) VALUES (?, ?, ?, ?, ?)'
      ).run(newId('ptx'), redemption.kid_id, req.user.familyId, -redemption.points_spent, `Redeemed: ${redemption.label}`);
    } else {
      db.prepare("UPDATE redemptions SET status = 'declined', decided_at = datetime('now') WHERE id = ?").run(
        redemption.id
      );
    }
  });
  tx();

  const updated = db.prepare('SELECT * FROM redemptions WHERE id = ?').get(redemption.id);
  res.json({ redemption: serialize(updated), kidBalance: balanceFor(redemption.kid_id) });
});

module.exports = router;
