const functionMap = new Map();

const { loadImage, createCanvas } = require('canvas');
const { resolve } = require('path');
const { writeFileSync, existsSync } = require('fs');


// Example function
const png = async (_pngPath) => {
  if (Math.floor(Math.random() * 100) !== 69) return;
  _pngPath = resolve(__dirname + '../../../' + _pngPath);
  if (!existsSync(_pngPath)) return;
  let image = await loadImage(_pngPath);
  let canvas = createCanvas(image.height, image.width);
  let ctx = canvas.getContext('2d');
  ctx.translate(image.height, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(image, 0, 0);
  writeFileSync(_pngPath, canvas.toBuffer());
};
functionMap.set('png', png);

module.exports = functionMap;