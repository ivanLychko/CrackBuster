require('dotenv').config();
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '/mnt/c/Users/klonv/OneDrive/Desktop/Новая папка/Services';
const outPath = path.join(__dirname, '../data/services-extracted.json');

async function run() {
  const files = fs.readdirSync(dir).filter(f => f.startsWith('1.') && f.endsWith('.docx'));
  const results = [];
  for (const f of files) {
    const name = f.replace(/^1\.\s*|\.docx$/i, '').trim();
    const fullPath = path.join(dir, f);
    const text = await mammoth.extractRawText({ path: fullPath }).then(r => r.value);
    results.push({ title: name, content: text.trim() });
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Extracted', results.length, 'services to', outPath);
}

run().catch(console.error);
