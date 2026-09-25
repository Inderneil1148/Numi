import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  // Centered pure typography on deep black background
  // Lime line at y = 0.38, text from y = 0.45 to y = 0.65
  const lineY = height * (isMaskable ? 0.40 : 0.38);
  const lineX1 = width * (isMaskable ? 0.22 : 0.16);
  const lineX2 = width * (isMaskable ? 0.78 : 0.84);
  const dotR = width * (isMaskable ? 0.026 : 0.030);

  const textTop = height * (isMaskable ? 0.46 : 0.45);
  const textBottom = height * (isMaskable ? 0.64 : 0.65);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Default: Black background
      let r = 0, g = 0, b = 0, a = 255;

      // Draw Lime Green Accent Bar and Dot (#8CE322 -> r:140, g:227, b:34)
      const distToLine = Math.abs(y - lineY);
      if (x >= lineX1 && x <= lineX2 && distToLine <= width * 0.009) {
        r = 140; g = 227; b = 34;
      }
      // Circular dot at end of line
      const ddx = x - lineX2;
      const ddy = y - lineY;
      if (Math.sqrt(ddx * ddx + ddy * ddy) <= dotR) {
        r = 140; g = 227; b = 34;
      }

      // White "numi" text representation (bars between line and bottom)
      if (y >= textTop && y <= textBottom) {
        const normX = (x - lineX1) / (lineX2 - lineX1);
        if (normX >= 0.02 && normX <= 0.98) {
          // Vertical legs for 'n', 'u', 'm', 'i'
          const isLeg =
            (normX >= 0.03 && normX <= 0.13) || // n leg 1
            (normX >= 0.21 && normX <= 0.31) || // n leg 2
            (normX >= 0.37 && normX <= 0.46) || // u leg 1
            (normX >= 0.54 && normX <= 0.63) || // u leg 2
            (normX >= 0.68 && normX <= 0.74) || // m leg 1
            (normX >= 0.78 && normX <= 0.84) || // m leg 2
            (normX >= 0.88 && normX <= 0.94) || // m leg 3 (Note: or scaled)
            (normX >= 0.94 && normX <= 1.00);   // i stem (under dot)

          // Let's refine proportions:
          // 'n': 0.00 to 0.26
          // 'u': 0.30 to 0.56
          // 'm': 0.60 to 0.88
          // 'i': 0.93 to 1.00
          const inN1 = normX >= 0.02 && normX <= 0.11;
          const inN2 = normX >= 0.18 && normX <= 0.27;
          const inNTop = normX >= 0.02 && normX <= 0.27 && y <= textTop + (textBottom - textTop) * 0.28;

          const inU1 = normX >= 0.33 && normX <= 0.42;
          const inU2 = normX >= 0.49 && normX <= 0.58;
          const inUBottom = normX >= 0.33 && normX <= 0.58 && y >= textBottom - (textBottom - textTop) * 0.28;

          const inM1 = normX >= 0.63 && normX <= 0.70;
          const inM2 = normX >= 0.75 && normX <= 0.82;
          const inM3 = normX >= 0.86 && normX <= 0.92;
          const inMTop = normX >= 0.63 && normX <= 0.92 && y <= textTop + (textBottom - textTop) * 0.28;

          const inI = normX >= 0.95 && normX <= 1.01;

          if (inN1 || inN2 || inNTop || inU1 || inU2 || inUBottom || inM1 || inM2 || inM3 || inMTop || inI) {
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, false));

console.log('Regenerated typography PNG icons in /public!');
