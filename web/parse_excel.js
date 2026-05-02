const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'jogadores.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log("Total rows:", data.length);
console.log("First 5 rows:", JSON.stringify(data.slice(0, 5), null, 2));
// Let's also check distinct groups and teams
const groups = new Set();
const teams = new Set();
let playerExample = null;
data.forEach(row => {
    // We need to see the keys first
    if (!playerExample) playerExample = row;
});
console.log("Columns:", Object.keys(playerExample));

