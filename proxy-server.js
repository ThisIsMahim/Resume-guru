import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Webhook URL - update this with your actual webhook URL from n8n
const WEBHOOK_URL = 'https://mayhem69.app.n8n.cloud/webhook-test/resumeGuruAI'; // Using the original URL

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Proxy endpoint
app.post('/proxy/webhook', async (req, res) => {
  console.log('Received request body:', req.body);
  
  try {
    console.log(`Sending request to: ${WEBHOOK_URL}`);
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body),
    });

    console.log('n8n response status:', response.status);
    
    let responseData;
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error('n8n error response:', responseData);
      throw new Error(`Webhook responded with status: ${response.status} - ${responseText}`);
    }

    console.log('n8n response data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      message: 'Error connecting to the service',
      error: error.message,
      details: 'Please check if the webhook URL is correct and the n8n workflow is active'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// Handle server startup errors
const server = app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${WEBHOOK_URL}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
}); 