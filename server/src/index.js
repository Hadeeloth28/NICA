require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { router: authRouter } = require('./routes/auth');
const { router: familyRouter } = require('./routes/family');
const assignmentsRouter = require('./routes/assignments');
const redemptionsRouter = require('./routes/redemptions');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/family', familyRouter);
app.use('/assignments', assignmentsRouter);
app.use('/redemptions', redemptionsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GradeVault server listening on http://localhost:${PORT}`);
});
