import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure CORS with specific options
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin', 'Accept'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 24 hours
};

// Create the serverless function
export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  // Enable CORS for actual requests
  await new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    console.log('Resume preview request received from:', req.headers.origin);
    const { html } = req.body;

    if (!html) {
      console.log('No HTML content provided');
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'HTML content is required'
      });
    }

    // Create the full HTML document with premium print-optimized styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume Preview | ResumeGuru</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #ec4899;
              --primary-dark: #db2777;
              --secondary: #9333ea;
              --bg-page: #f8fafc;
              --bg-card: #ffffff;
              --text-main: #1e293b;
              --text-muted: #64748b;
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              color: var(--text-main);
              background: var(--bg-page);
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px 20px;
            }
            
            /* Preview UI Elements */
            .preview-header {
              width: 100%;
              max-width: 850px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .logo {
              font-weight: 800;
              font-size: 24px;
              background: linear-gradient(to right, var(--primary), var(--secondary));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .print-button {
              background: linear-gradient(to right, var(--primary), var(--secondary));
              color: white;
              border: none;
              padding: 10px 24px;
              border-radius: 99px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .print-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
            }

            .instruction-panel {
              position: fixed;
              left: 40px;
              top: 100px;
              width: 280px;
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 24px;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              z-index: 100;
            }

            .instruction-panel h3 {
              font-size: 16px;
              margin-bottom: 16px;
              color: var(--text-main);
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .instruction-panel ol {
              list-style: none;
              counter-reset: step;
            }

            .instruction-panel li {
              font-size: 13px;
              color: var(--text-muted);
              margin-bottom: 12px;
              position: relative;
              padding-left: 28px;
            }

            .instruction-panel li::before {
              counter-increment: step;
              content: counter(step);
              position: absolute;
              left: 0;
              top: -2px;
              width: 20px;
              height: 20px;
              background: #f1f5f9;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              color: var(--primary);
            }

            .instruction-panel strong {
              color: var(--text-main);
            }
            
            .resume-wrapper {
              background: white;
              width: 100%;
              max-width: 850px;
              min-height: 1100px;
              padding: 60px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.1);
              border-radius: 4px;
              margin-bottom: 40px;
            }

            /* Responsive Adjustments */
            @media (max-width: 1400px) {
              .instruction-panel {
                position: static;
                width: 100%;
                max-width: 850px;
                margin-bottom: 24px;
              }
            }

            @media print {
              body {
                padding: 0;
                background: white !important;
              }

              .preview-header,
              .instruction-panel,
              .print-button {
                display: none !important;
              }

              .resume-wrapper {
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                max-width: none !important;
                width: 100% !important;
                min-height: auto !important;
              }

              @page {
                size: A4;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <header class="preview-header">
            <div class="logo">ResumeGuru</div>
            <button class="print-button" onclick="window.print()">
              <span>Download PDF</span>
            </button>
          </header>

          <aside class="instruction-panel">
            <h3>📄 How to save as PDF</h3>
            <ol>
              <li>Press <strong>Ctrl + P</strong> (or ⌘ + P)</li>
              <li>Set Destination to <strong>Save as PDF</strong></li>
              <li>Set Layout to <strong>Portrait</strong></li>
              <li>Under More Settings:
                <ul style="list-style: disc; margin-left: 20px; margin-top: 4px;">
                  <li>Margins: <strong>Default</strong></li>
                  <li><strong>Hide</strong> Headers & Footers</li>
                  <li><strong>Show</strong> Background Graphics</li>
                </ul>
              </li>
            </ol>
          </aside>

          <main class="resume-wrapper">
            ${html}
          </main>

          <script>
            // Add a small hint for users
            console.log("ResumeGuru: Preview loaded. Use the Print button or Ctrl+P to download.");
          </script>
        </body>
      </html>
    `;

    // Set response headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin, Accept');
    
    res.status(200).send(htmlContent);
    console.log('HTML response sent successfully');

  } catch (error) {
    console.error('Error serving resume HTML:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred while generating resume preview'
    });
  }
} 