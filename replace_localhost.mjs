import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'src', 'pages');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
};

const files = walk(pagesDir);
let totalReplaced = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // 1. Un-nest JSX src strings that match: src="http://localhost:5000..." -> src={`...`}
    const srcAttrRegex = /src=(['"])http:\/\/localhost:5000([^'"]*)\1/g;
    content = content.replace(srcAttrRegex, "src={`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$2`}");
    
    // 2. Replace standalone string literals: 'http://localhost:5000...' -> `...`
    const stringRegex = /(['"])http:\/\/localhost:5000([^'"]*)\1/g;
    content = content.replace(stringRegex, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$2`");

    // 3. Replace template literal prefixes: `http://localhost:5000...` -> `...`
    const templateRegex = /`http:\/\/localhost:5000([^`]*)`/g;
    content = content.replace(templateRegex, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
    
    // Also cover the API target just in case
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        totalReplaced++;
    }
});

console.log(`\nReplaced hardcoded localhost URLs in ${totalReplaced} files.`);
