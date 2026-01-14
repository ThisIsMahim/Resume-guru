
const fs = require('fs');
const path = require('path');

// Use header to debug
console.log('Starting script...');
console.log('CWD:', process.cwd());

const inputFilename = 'db_cluster-06-07-2025@15-31-00.backup';
const inputPath = path.join(process.cwd(), inputFilename);
const outputPath = path.join(process.cwd(), 'db_restore_clean.sql');

console.log('Input Path:', inputPath);

if (!fs.existsSync(inputPath)) {
    console.error('Error: Input file does not exist!');
    process.exit(1);
}

try {
  // Read as buffer first to avoid encoding issues if mixed, then to string
  const data = fs.readFileSync(inputPath).toString('utf8');
  console.log('File read successfully. Size:', data.length);
  
  const lines = data.split('\n');
  console.log('Line count:', lines.length);
  
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
  console.error('Error details:', err);
}
