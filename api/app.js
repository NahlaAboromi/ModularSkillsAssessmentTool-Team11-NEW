const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY not found. Some routes may fail.');
}


const app = express();

// CORS for Vercel + local
app.use(cors({
  origin: ['http://localhost:3000', 'https://modular-skills-assessment-tool-team11.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// 🔗 Connect to MongoDB (change connection string if needed)
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modular_skills';
mongoose.connect(mongoUri, { useNewUrlParser: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 📦 Import routes
const teachersRouter = require('./routers/teachers.route');
const studentsRouter = require('./routers/students.route');
const notificationsRouter = require('./routers/notifications.route');
const studentNotificationsRouter = require('./routers/studentNotifications.route');
const summaryRouter = require('./routers/summary.route');
const classesRouter = require('./routers/classes.route');
const claudeRoutes = require('./routers/claude.route');
const teacherStudentProgressRouter = require('./routers/teacherStudentProgress.route');
// 🧭 Route setup
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/studentNotifications', studentNotificationsRouter);
app.use('/api', summaryRouter);
app.use('/api/classes', classesRouter);
app.use('/api/claude', claudeRoutes);
app.use('/api', teacherStudentProgressRouter);
// ✅ Export the app for Vercel
module.exports = app;

// 🖥️ Local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}
