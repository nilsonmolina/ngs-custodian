const { exec } = require('child_process');

function extract(input, output) {
  const command = `unzip ${input} -d ${output}`;
  exec(command, (error, stdout, stderr) => {
    console.log('done');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  });
}

function compress(input, output) {
  exec(`zip ${output} ${input}`);
}

module.exports = { extract, compress };
