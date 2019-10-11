const fs = require('fs');
const readline = require('readline');

function sanitize(i, o) {
  return new Promise((resolve, reject) => {
    const rstream = fs.createReadStream(i);
    const wstream = fs.createWriteStream(o);
    const rl = readline.createInterface({
      input: rstream,
      crlfDelay: Infinity,
      historySize: 0,
      terminal: false,
    });

    const startTime = new Date();
    let parts = 0;
    let columns = null;

    rl.on('line', (l) => {
      let line = l.split(',');
      if (columns === null) columns = line.length;
      else if (line.length !== columns) reject(new Error('Columns are not even'));
      parts++;

      // REMOVE QUOTES FROM ALL COLUMNS | REMOVE SPACES FROM ALL BUT DESCRIPTION
      line = line.map((col, index) => (
        index === 1
          ? col.replace(/['"]+/g, '')
          : col.replace(/['"\s]+/g, '')
      ));

      // ADD BRAND COLUMN
      line.push('CAT');

      // WRITE TO OUTPUT FILE
      wstream.write(`${line.join(',')}\n`, (err) => {
        if (err) reject(new Error(err));
      });
    });

    rl.on('close', () => {
      resolve({
        path: o,
        elapsed: new Date() - startTime,
        parts,
      });
    });
  });
}

module.exports = { sanitize };
