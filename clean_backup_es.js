
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting ESM script...');

const inputFilename = 'db_cluster-06-07-2025@15-31-00.backup';
const inputPath = path.join(__dirname, inputFilename);
const outputPath = path.join(__dirname, 'db_restore_clean.sql');

if (!fs.existsSync(inputPath)) {
    console.error('Error: Input file does not exist at:', inputPath);
    process.exit(1);
}

try {
  const data = fs.readFileSync(inputPath, 'utf8');
  console.log('File read successfully. Size:', data.length);
  
  const lines = data.split('\n');
  const cleanLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('CREATE ROLE')) return false;
    if (trimmed.startsWith('ALTER ROLE')) return false;
    if (trimmed.startsWith('DROP ROLE')) return false;
    if (trimmed.startsWith('CREATE DATABASE')) return false;
    if (trimmed.startsWith('ALTER DATABASE')) return false;
    if (trimmed.startsWith('\\connect')) return false;
    return true;
  });

  fs.writeFileSync(outputPath, cleanLines.join('\n'));
  console.log(`Cleaned SQL saved to ${outputPath}`);
} catch (err) {
  console.error('Error:', err);
}
