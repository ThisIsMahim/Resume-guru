import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting conversion to INSERT statements...');

const inputPath = path.join(__dirname, 'db_restore_clean.sql');
const outputPath = path.join(__dirname, 'supabase_manual_restore.sql');

const data = fs.readFileSync(inputPath, 'utf8');
const lines = data.split('\n');

let outputLines = [];
let inCopyMode = false;
let currentTable = '';
let currentColumns = [];
let copyStartLine = 0;

// Tables we want to extract
const targetTables = [
  'public.profiles',
  'public.chat_sessions',
  'public.chat_messages',
  'public.downloads',
  'public.subscriptions'
];

outputLines.push('-- Manual Restore SQL for Supabase');
outputLines.push('-- Critical tables only');
outputLines.push('');

// First pass: extract table schemas
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Capture CREATE TABLE statements for our target tables
  for (const table of targetTables) {
    if (line.includes(`CREATE TABLE ${table}`)) {
      // Find the complete CREATE TABLE statement
      let endLine = i;
      let bracketCount = 0;
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        bracketCount += (currentLine.match(/\(/g) || []).length;
        bracketCount -= (currentLine.match(/\)/g) || []).length;
        
        if (bracketCount === 0 && currentLine.includes(');')) {
          endLine = j;
          break;
        }
      }
      
      // Add the CREATE TABLE statement
      outputLines.push('--');
      outputLines.push(`-- Table: ${table}`);
      outputLines.push('--');
      for (let k = i; k <= endLine; k++) {
        outputLines.push(lines[k]);
      }
      outputLines.push('');
    }
  }
}

// Second pass: extract and convert COPY data to INSERT
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Check if this is a COPY command for one of our target tables
  for (const table of targetTables) {
    if (line.startsWith(`COPY ${table}`)) {
      // Extract column names
      const match = line.match(/COPY [^ ]+ \(([^)]+)\) FROM stdin;/);
      if (match) {
        currentTable = table;
        currentColumns = match[1].split(',').map(c => c.trim());
        inCopyMode = true;
        copyStartLine = i + 1;
        
        outputLines.push(`-- Data for ${table}`);
        break;
      }
    }
  }
  
  if (inCopyMode) {
    // Check for end of COPY data
    if (line === '\\.') {
      inCopyMode = false;
      currentTable = '';
      currentColumns = [];
      outputLines.push('');
      continue;
    }
    
    // Process data line
    if (line && line !== '\\.') {
      // Split by tabs (COPY format uses tabs as delimiters)
      const values = lines[i].split('\t');
      
      if (values.length === currentColumns.length) {
        // Build INSERT statement
        const formattedValues = values.map(v => {
          if (v === '\\N') return 'NULL';
          // Escape single quotes and wrap in quotes
          const escaped = v.replace(/'/g, "''");
          return `'${escaped}'`;
        });
        
        const insertStmt = `INSERT INTO ${currentTable} (${currentColumns.join(', ')}) VALUES (${formattedValues.join(', ')});`;
        outputLines.push(insertStmt);
      }
    }
  }
}

fs.writeFileSync(outputPath, outputLines.join('\n'));
console.log(`Conversion complete! Created: ${outputPath}`);
console.log(`Total lines: ${outputLines.length}`);
