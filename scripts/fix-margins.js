const fs = require('fs');
let code = fs.readFileSync('scripts/build-templates.js', 'utf8');

const marginStr = '<w:tcPr><w:tcMar><w:top w:w="150" w:type="dxa"/><w:left w:w="300" w:type="dxa"/><w:bottom w:w="150" w:type="dxa"/><w:right w:w="300" w:type="dxa"/></w:tcMar></w:tcPr>';
code = code.split('<w:tcPr/>').join(marginStr);

fs.writeFileSync('scripts/build-templates.js', code);
console.log('Replaced margins successfully via split/join');
