// -------------------
// UI ELEMENTS
// -------------------
const ui = {
  file: {
    input: document.querySelector('input[name="pricelist"]'),
    isValid: function isValid() {
      const file = this.input.files[0];
      if (file.name.indexOf('.txt') === -1) {
        console.log('Must be a txt file.');
        return false;
      }
      if (file.size > 150 * 1000 * 1000) {
        console.log('File cannot be larger than 150MB.');
        return false;
      }
      if (file.size < 80 * 1000 * 1000) {
        console.log('File too small, please confirm file.');
        return false;
      }

      return true;
    },
  },
};

// -------------------
// EVENT LISTENERS
// -------------------
ui.file.input.addEventListener('change', tryUpload);

// -------------------
// EVENT LISTENER FUNCTIONS
// -------------------
function tryUpload() {
  if (!ui.file.isValid()) return;
  ui.file.input.disabled = true;

  const fd = new FormData();
  fd.append('pricelist', ui.file.input.files[0]);
  // CONFIGURE AXIOS POST
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      // ui.progress.innerHTML = `${Math.round((e.loaded * 100) / e.total)} %`;
      const percentage = Math.round((e.loaded * 100) / e.total);
      if (percentage < 100) {
        console.log(percentage, '%');
      } else {
        console.log('sanitizing...');
      }
    },
  };
  // // POST FILE TO API
  // const baseURL = 'https://ngsprices.ml/';
  const baseURL = 'http://localhost:6464/';
  const api = `${baseURL}api/pricelists/`;
  axios.post(api, fd, config)
    .then((res) => {
      console.log(res.data);
      window.open(baseURL + res.data.path);
    })
    .catch((err) => {
      console.log(`response: ${err}`);
    })
    .finally(() => {
      console.log('done!');
      ui.file.input.disabled = false;
      ui.file.input.value = null;
    });
}
