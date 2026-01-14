import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import previewResumeHandler from './api/preview-resume.js';
import healthHandler from './api/health.js';

// Load environment variables
dotenv.config();

const app = express();

// Set port to 3001 as per .env.example
const PORT = process.env.VITE_API_PORT || process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Bridges to connect Vercel handlers to Express
app.get('/api/health', (req, res) => {
  healthHandler(req, res);
});

app.post('/api/preview-resume', (req, res) => {
  previewResumeHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
