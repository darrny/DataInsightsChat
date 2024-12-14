import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export function loadResponses() {
  // Use the relative path to access the file from the current directory
  const filePath = path.join(process.cwd(), 'app/data/responses.csv');
  
  const file = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return parsed.data;
}