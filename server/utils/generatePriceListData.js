const path = require('path');
const fs = require('fs');

const directory = path.join(__dirname, '../public/pricelists');
const pricelists = [];

fs.readdir(directory, (err, folders) => {
  if (err) return console.log(`Unable to scan directory: ${err}`);

  folders.forEach((folder) => {
    if (folder.includes('.json')) return;
    const pricelist = { fileName: folder };
    const lists = fs.readdirSync(path.join(directory, '/', folder));

    lists.forEach((curr) => {
      if (curr.includes('raw')) pricelist.rawUrl = `${folder}/${curr}`;
      if (curr.includes('cleaned')) {
        pricelist.cleanedUrl = `${folder}/${curr}`;
        const stats = fs.statSync(path.join(directory, '/', folder, curr));
        pricelist.fileSize = stats.size / 1000000.0;
      }
    });

    pricelists.push(pricelist);
  });

  pricelists.sort((a, b) => (a.fileName < b.fileName ? 1 : -1));

  return fs.writeFileSync(
    path.join(directory, 'pricelists.json'),
    JSON.stringify(pricelists),
    { flag: 'w' },
  );
});
