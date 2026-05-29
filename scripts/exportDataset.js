const fs = require('fs');
const path = require('path');
const source = path.resolve('C:/Users/Navodi/Downloads/Anime_Semantic_Emotional_Dataset (2).csv');
const target = path.resolve('src/data/animeDataset.json');

function parseLine(line) {
  const row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  row.push(cur);
  return row;
}

const text = fs.readFileSync(source, 'utf8');
const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
const headers = parseLine(lines.shift());
const rows = [];

for (const line of lines) {
  const values = parseLine(line);
  if (values.length !== headers.length) continue;
  const obj = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  if (!obj.anime_name) continue;
  rows.push({
    anime_name: obj.anime_name,
    episode_name: obj.episode_name_cleaned || obj.episode_name || '',
    anger: Number(obj.anger || 0),
    disgust: Number(obj.disgust || 0),
    fear: Number(obj.fear || 0),
    joy: Number(obj.joy || 0),
    sadness: Number(obj.sadness || 0),
    surprise: Number(obj.surprise || 0),
    neutral: Number(obj.neutral || 0),
    vibe: obj.vibe_column || ''
  });
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(rows, null, 2), 'utf8');
console.log('wrote', rows.length, 'rows to', target);
