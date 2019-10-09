/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

self.addEventListener('message', (e) => {
  // FILE READER SOLUTION
  const reader = new FileReader();
  reader.onloadend = () => {
    const text = reader.result;
    const rows = text.split('\n');
    let parts = 0;
    let columns = null;

    rows.forEach((l) => {
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
    });

    self.postMessage({ data: rows.join('\n'), parts });
  };
  reader.readAsText(e.data);
});
