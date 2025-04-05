import cors from 'cors';

const corsOptions = {
  origin: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin'],
  credentials: true,
  maxAge: 86400
};

export default async function handler(req, res) {
  // Enable CORS
  await new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ status: 'ok' });
} 