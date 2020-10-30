// For logging
const logger = require('./logger.js');

const Canvas = require('canvas');
const path = require('path');
const { writeFileSync, existsSync } = require('fs');

// Create the Map
const functionMap = new Map();

// Example function
const png = async (_pngPath) => {
  if (Math.floor(Math.random() * 100) !== 69) return;
  _pngPath = path.resolve(__dirname + '../../../' + _pngPath);
  if (!existsSync(_pngPath)) return;
  let image = await Canvas.loadImage(_pngPath);
  let canvas = Canvas.createCanvas(image.height, image.width);
  let ctx = canvas.getContext('2d');
  ctx.translate(image.height, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(image, 0, 0);
  writeFileSync(_pngPath, canvas.toBuffer());
};
functionMap.set('png', png);
png('uploads/million/2020/10/30/1cp9dluwn3n.png');

module.exports = functionMap;