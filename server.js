import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS with specific options
const corsOptions = {
  origin: true, // Allow all origins
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 24 hours
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Add debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Add a test endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check request received from:', req.headers.origin);
  res.json({ status: 'ok' });
});

app.post('/api/preview-resume', async (req, res) => {
  try {
    console.log('Resume preview request received from:', req.headers.origin);
    console.log('Request headers:', req.headers);
    const { html } = req.body;

    if (!html) {
      console.log('No HTML content provided');
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Create the full HTML document with print-optimized styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Resume - Print or Download as PDF</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 40px;
            }
            
            .resume-container {
              max-width: 850px;
              margin: 0 auto;
              background: white;
              position: relative;
            }

            .print-instructions {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #f8f9fa;
              padding: 15px 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              z-index: 1000;
            }

            .print-instructions h3 {
              margin-bottom: 10px;
              color: #2d3748;
            }

            .print-instructions ol {
              margin-left: 20px;
            }

            .print-instructions li {
              margin-bottom: 8px;
              color: #4a5568;
            }
            
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #1a1a1a;
            }
            
            h2 {
              font-size: 20px;
              font-weight: 600;
              margin: 24px 0 12px;
              color: #2a2a2a;
              border-bottom: 2px solid #eaeaea;
              padding-bottom: 8px;
            }
            
            h3 {
              font-size: 16px;
              font-weight: 600;
              margin: 16px 0 8px;
              color: #2a2a2a;
            }
            
            p {
              margin: 8px 0;
              font-size: 14px;
            }
            
            ul {
              margin: 8px 0;
              padding-left: 20px;
            }
            
            li {
              margin: 4px 0;
              font-size: 14px;
            }
            
            .section {
              margin-bottom: 24px;
              break-inside: avoid;
            }
            
            .contact-info {
              margin-bottom: 24px;
              font-size: 14px;
              color: #666;
            }
            
            .experience-item, .education-item {
              margin-bottom: 16px;
              break-inside: avoid;
            }
            
            .date {
              color: #666;
              font-size: 14px;
            }
            
            .company, .school {
              font-weight: 500;
              color: #2a2a2a;
            }
            
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              list-style: none;
              padding: 0;
            }
            
            .skill-item {
              background: #f5f5f5;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 14px;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .resume-container {
                padding: 20px;
              }

              .print-instructions {
                display: none;
              }
              
              @page {
                size: A4;
                margin: 20mm;
              }

              /* Ensure good page breaks */
              h2 {
                break-after: avoid;
              }
              
              h3 {
                break-after: avoid;
              }
              
              .section {
                break-inside: avoid;
              }
            }
          </style>
          <script>
            // Auto-open print dialog when the page loads
            window.onload = function() {
              // Small delay to ensure styles are loaded
              setTimeout(() => {
                // Uncomment the next line to automatically open print dialog
                // window.print();
              }, 1000);
            };
          </script>
        </head>
        <body>
          <div class="print-instructions">
            <h3>📄 Download as PDF</h3>
            <ol>
              <li>Press <strong>Ctrl + P</strong> (or ⌘ + P on Mac)</li>
              <li>Set "Destination" to <strong>Save as PDF</strong></li>
              <li>Set "Layout" to <strong>Portrait</strong></li>
              <li>Set "Margins" to <strong>Default</strong></li>
              <li>Disable "Headers and footers"</li>
              <li>Click "Save" or "Print"</li>
            </ol>
          </div>
          <div class="resume-container">
            ${html}
          </div>
        </body>
      </html>
    `;

    // Set response headers
    res.set({
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Origin'
    });
    
    res.status(200).send(htmlContent);
    console.log('HTML response sent successfully');

  } catch (error) {
    console.error('Error serving resume HTML:', error);
    res.set({
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.status(500).json({ 
      error: 'Failed to serve resume HTML',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.listen(port, () => {
  console.log(`Resume preview server running at http://localhost:${port}`);
  console.log('CORS configuration:', corsOptions);
}); 