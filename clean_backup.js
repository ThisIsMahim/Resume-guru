
const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.cwd(), 'db_cluster-06-07-2025@15-31-00.backup');
const outputPath = path.join(process.cwd(), 'db_restore_clean.sql');

try {
  const data = fs.readFileSync(inputPath, 'utf8');
  const lines = data.split('\n');
  
  const cleanLines = lines.filter(line => {
    const trimmed = line.trim();
    // Remove Role creations and alterations which are managed by Supabase platform
    if (trimmed.startsWith('CREATE ROLE')) return false;
    if (trimmed.startsWith('ALTER ROLE')) return false;
    if (trimmed.startsWith('DROP ROLE')) return false;
    
    // Remove database creation if present (we use the default postgres db)
    if (trimmed.startsWith('CREATE DATABASE')) return false;
    if (trimmed.startsWith('ALTER DATABASE')) return false;
    if (trimmed.startsWith('\\connect')) return false;

    return true;
  });

  fs.writeFileSync(outputPath, cleanLines.join('\n'));
  console.log(`Cleaned SQL saved to ${outputPath}`);
} catch (err) {
  console.error('Error processing file:', err);
}
