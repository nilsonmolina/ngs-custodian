const fs = require('fs');
const zlib = require('zlib');

function zip(i) {
  return new Promise((resolve, reject) => {
    const o = `${i}.gz`;
    const rStream = fs.createReadStream(i);
    const wStream = fs.createWriteStream(o);
    const gzip = zlib.createGzip();

    rStream.pipe(gzip).pipe(wStream).on('finish', (err) => {
      if (err) reject(err);
      resolve(o);
    });
  });
}

function unzip(i, o) {
  return new Promise((resolve, reject) => {
    const rStream = fs.createReadStream(i);
    const wStream = fs.createWriteStream(o);
    const gunzip = zlib.createGunzip();

    rStream.pipe(gunzip).pipe(wStream).on('finish', (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = { zip, unzip };
