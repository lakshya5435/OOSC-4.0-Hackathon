require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const aiController = require('./src/controllers/aiController');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet()); 
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' })); 
app.post('/api/ai/analyze', aiController.analyzeJournal);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests, please try again later.'
});
app.use('/api/', apiLimiter);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});


 app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/assessments', require('./src/routes/assessmentRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Secure API running on port ${PORT}`);
});