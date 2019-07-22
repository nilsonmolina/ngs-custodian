/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/pako/1.0.10/pako.min.js');

self.addEventListener('message', (e) => {
  console.log(e.data);
  new Response(e.data).arrayBuffer()
    .then((data) => {
      const file = pako.gzip(data);
      const blob = new Blob([file], { type: 'application/octet-stream' });
      self.postMessage(blob);
    });

  // // FILE READER SOLUTION
  // const reader = new FileReader();
  // reader.onloadend = () => {
  //   const arr = reader.result;
  //   const file = pako.deflate(arr, { level: 1 });
  //   const blob = new Blob([file], { type: 'application/octet-stream' });
  //   self.postMessage(blob);
  // };
  // reader.readAsArrayBuffer(e.data);
});
