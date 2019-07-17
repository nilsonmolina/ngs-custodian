// /* eslint-disable no-undef */
// // UI ELEMENTS
// const ui = {
//   file: document.querySelector('.file'),
//   progress: document.querySelector('.progress'),
// };
// const state = {
//   filename: null,
// };

// // EVENT LISTENERS
// ui.button.addEventListener('click', uploadFile);

// // EVENT FUNCTIONS
// function uploadFile(e) {
//   e.preventDefault();
//   // ADD DATA TO FORMDATA OBJECT
//   const fd = new FormData();
//   fd.append('pricelist', ui.file.files[0]);
//   // CONFIGURE AXIOS POST
//   const config = {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: () => {
//       ui.progress.innerHTML = `${Math.round((e.loaded * 100) / e.total)} %`;
//     },
//   };
//   // POST FILE TO API
//   axios.post('http://127.0.0.1:3000/api/pricelists/', fd, config)
//     .then((res) => { state.filename = res.data; })
//     .catch((err) => { console.log(`response: ${err}`); });
// }

const ui = {
  file: {
    input: document.querySelector('input[name="pricelist"]'),
    isValid: function isValid() {
      const file = this.input.files[0];
      if (file.name.indexOf('.zip') === -1) {
        console.log('Must be a zip file.');
        return false;
      }
      if (file.size > 40 * 1000 * 1000) {
        console.log('File cannot be larger than 40MB.');
        return false;
      }

      return true;
    },
  },
};

ui.file.input.addEventListener('change', () => {
  if (!ui.file.isValid()) return;
  ui.file.input.disabled = true;

  const fd = new FormData();
  fd.append('pricelist', ui.file.input.files[0]);
  // CONFIGURE AXIOS POST
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      // ui.progress.innerHTML = `${Math.round((e.loaded * 100) / e.total)} %`;
      console.log(`${Math.round((e.loaded * 100) / e.total)} %`);
    },
  };
  // POST FILE TO API
  axios.post('https://ngsprices.ml/api/pricelists/', fd, config)
    .then((res) => { console.log(res, res.data); })
    .catch((err) => { console.log(`response: ${err}`); })
    .finally(() => { ui.file.input.disabled = false; });
});
