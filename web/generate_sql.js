const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'jogadores.xlsx');
const outputPath = path.join(__dirname, '..', 'supabase', 'seeds', '003_real_stickers.sql');

const workbook = xlsx.readFile(inputPath);
const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

let sql = `-- supabase/seeds/003_real_stickers.sql\n`;
sql += `-- Auto-generated from jogadores.xlsx\n\n`;
sql += `INSERT INTO public.stickers (code, name, team, group_name)\nVALUES\n`;

const values = [];
data.forEach((row, i) => {
  // Tratamento de aspas simples nos nomes
  const code = (row['Code_1'] || '').toString().trim().replace(/'/g, "''");
  const name = (row['Nome'] || '').toString().trim().replace(/'/g, "''");
  const team = (row['Seleção'] || '').toString().trim().replace(/'/g, "''");
  const group = (row['Grupo'] || '').toString().trim().replace(/'/g, "''");
  
  values.push(`  ('${code}', '${name}', '${team}', '${group}')`);
});

sql += values.join(',\n') + '\n';
sql += `ON CONFLICT (code) DO UPDATE SET \n`;
sql += `  name = EXCLUDED.name, \n`;
sql += `  team = EXCLUDED.team, \n`;
sql += `  group_name = EXCLUDED.group_name;\n`;

fs.writeFileSync(outputPath, sql);
console.log('Successfully generated', outputPath, 'with', values.length, 'stickers.');
