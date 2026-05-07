const fs = require('fs');
const content = fs.readFileSync('src/components/notes/Sidebar.tsx', 'utf8');

let curly = 0;
let paren = 0;
let bracket = 0;

for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') curly++;
  if (content[i] === '}') curly--;
  if (content[i] === '(') paren++;
  if (content[i] === ')') paren--;
  if (content[i] === '[') bracket++;
  if (content[i] === ']') bracket--;
}

console.log({ curly, paren, bracket });
