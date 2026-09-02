const express = require('express');
const db = require('../db');
const { newId } = require('../util');
const { requireAuth, requireRole } = require('../middleware/auth');
const { balanceFor } = require('./family');

const router = express.Router();

function serialize(a) {
  return {
    id: a.id,
    kidId: a.kid_id,
    subject: a.subject,
    title: a.title,
    mark: a.mark,
    status: a.status,
    pointsAwarded: a.points_awarded,
    createdAt: a.created_at,
    decidedAt: a.decided_at,
  };
}

function assertKidInFamily(familyId, kidId) {
  return db.prepare("SELECT * FROM users WHERE id = ? AND family_id = ? AND role = 'kid'").get(kidId, familyId);
}

// Kid logs a new assignment + mark. Sits pending until a parent approves it.
router.post('/', requireAuth, requireRole('kid'), (req, res) => {
  const { subject, title, mark } = req.body || {};
  const markNum = Number(mark);
  if (!subject || !title || Number.isNaN(markNum)) {
    return res.status(400).json({ error: 'subject, title and a numeric mark are required' });
  }
  if (markNum < 0 || markNum > 100) return res.status(400).json({ error: 'mark must be between 0 and 100' });

  const id = newId('asn');
  db.prepare(
    'INSERT INTO assignments (id, kid_id, family_id, subject, title, mark) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, req.user.familyId, subject, title, markNum);

  res.status(201).json(serialize(db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)));
});

// List assignments - kid sees their own, parent can filter by ?kidId=
router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.user.role === 'kid') {
    rows = db.prepare('SELECT * FROM assignments WHERE kid_id = ? ORDER BY created_at DESC').all(req.user.id);
  } else {
    const kidId = req.query.kidId;
    if (kidId) {
      if (!assertKidInFamily(req.user.familyId, kidId)) return res.status(404).json({ error: 'Kid not found' });
      rows = db.prepare('SELECT * FROM assignments WHERE kid_id = ? ORDER BY created_at DESC').all(kidId);
    } else {
      rows = db
        .prepare('SELECT * FROM assignments WHERE family_id = ? ORDER BY created_at DESC')
        .all(req.user.familyId);
    }
  }
  res.json(rows.map(serialize));
});

router.get('/pending', requireAuth, requireRole('parent'), (req, res) => {
  const rows = db
    .prepare("SELECT * FROM assignments WHERE family_id = ? AND status = 'pending' ORDER BY created_at ASC")
    .all(req.user.familyId);
  res.json(rows.map(serialize));
});

// Parent approves or rejects. Approval awards +1/-1 point based on the family's mark threshold.
router.post('/:id/decide', requireAuth, requireRole('parent'), (req, res) => {
  const { decision } = req.body || {};
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
  }
  const assignment = db
    .prepare('SELECT * FROM assignments WHERE id = ? AND family_id = ?')
    .get(req.params.id, req.user.familyId);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (assignment.status !== 'pending') return res.status(409).json({ error: 'Assignment was already decided' });

  const tx = db.transaction(() => {
    if (decision === 'reject') {
      db.prepare("UPDATE assignments SET status = 'rejected', decided_at = datetime('now'), decided_by = ? WHERE id = ?").run(
        req.user.id,
        assignment.id
      );
      return null;
    }

    const settings = db.prepare('SELECT * FROM reward_settings WHERE family_id = ?').get(req.user.familyId);
    const points = assignment.mark > settings.threshold ? 1 : -1;

    db.prepare(
      "UPDATE assignments SET status = 'approved', points_awarded = ?, decided_at = datetime('now'), decided_by = ? WHERE id = ?"
    ).run(points, req.user.id, assignment.id);

    db.prepare(
      'INSERT INTO point_transactions (id, kid_id, family_id, assignment_id, delta, reason) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      newId('ptx'),
      assignment.kid_id,
      req.user.familyId,
      assignment.id,
      points,
      `${assignment.subject}: ${assignment.title} (${assignment.mark})`
    );
    return points;
  });
  tx();

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignment.id);
  res.json({ assignment: serialize(updated), kidBalance: balanceFor(assignment.kid_id) });
});

module.exports = router;
