import fs from 'fs';
import path from 'path';

const file = 'c:\\Users\\goexp\\Desktop\\ecommerse\\website\\src\\pages\\Home.jsx';
let content = fs.readFileSync(file, 'utf8');

const images = [
    'http://localhost:5000/uploads/banarasi.png',
    'http://localhost:5000/uploads/pure_silk.png',
    'http://localhost:5000/uploads/chanderi.png',
    'http://localhost:5000/uploads/cotton_silk.png',
    'http://localhost:5000/uploads/organza.png',
    'http://localhost:5000/uploads/modern_banarasi.png'
];

let i = 0;
content = content.replace(/https:\/\/images\.unsplash\.com\/photo-[^"'\s]*/g, () => {
    const img = images[i % images.length];
    i++;
    return img;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced unsplash URLs in Home.jsx');
