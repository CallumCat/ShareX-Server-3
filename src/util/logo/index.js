// Inspired by https://github.com/roki100/SharuX
const { readFileSync } = require('fs');
const { resolve } = require('path');
require('colors');

let filePath = resolve(__dirname + '/logos.txt');
const data = readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
let dataArray = data.split('--------------------------------------------------------------------------------------------------------------');

console.log(dataArray[Math.floor(Math.random() * 133)].cyan);