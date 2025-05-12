const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf-8'));
console.log(JSON.stringify(json));
