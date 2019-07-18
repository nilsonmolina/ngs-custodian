const fs = require('fs');
const zlib = require('zlib');

function zip(i) {
  return new Promise((resolve, reject) => {
    const out = `${i}.zip`;
    const rStream = fs.createReadStream(i);
    const wStream = fs.createWriteStream(out);
    const gzip = zlib.createGzip();

    rStream.pipe(gzip).pipe(wStream).on('finish', (err) => {
      if (err) return reject(err);
      return resolve(out);
    });
  });
}

function unzip(i, o) {
  return new Promise((resolve, reject) => {
    const rStream = fs.createReadStream(i);
    const wStream = fs.createWriteStream(o);
    const gunzip = zlib.createGunzip();

    rStream.pipe(gunzip).pipe(wStream).on('finish', (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

module.exports = { zip, unzip };
