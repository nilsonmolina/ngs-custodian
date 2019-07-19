/* eslint-env browser */
// -------------------
// UI ELEMENTS
// -------------------
const ui = {
  file: {
    button: document.querySelector('.button'),
    input: document.querySelector('input[type="file"]'),
    isValid: function isValid() {
      const file = this.input.files[0];
      const password = 'Testing123';
      if (file.name.indexOf('.txt') === -1) {
        ui.alert.error('Must be a txt file.');
        this.input.value = null;
        return false;
      }
      if (file.size > 150 * 1000 * 1000) {
        ui.alert.error('File cannot be larger than 150MB.');
        this.input.value = null;
        return false;
      }
      if (file.size < 80 * 1000 * 1000) {
        ui.alert.error('File too small, please confirm file.');
        this.input.value = null;
        return false;
      }
      if (prompt('Enter the password.') !== password) {
        ui.alert.error('You are not authorized to upload');
        this.input.value = null;
        return false;
      }

      return true;
    },
  },
  alert: {
    element: document.querySelector('.alerts'),
    error: function error(msg, timeout = 10000) {
      if (this.isDuplicate(msg)) return;
      const n = document.createElement('div');
      n.setAttribute('class', 'notification');
      n.innerHTML = `<span class="msg">${msg}</span>`;
      this.element.appendChild(n);
      setTimeout(() => n.classList.add('is-danger'), 50);
      setTimeout(() => n.classList.remove('is-danger'), timeout);
      setTimeout(() => n.remove(), timeout + 400);
    },
    success: function error(msg, timeout = 10000) {
      if (this.isDuplicate(msg)) return;
      const n = document.createElement('div');
      n.setAttribute('class', 'notification');
      n.innerHTML = `<span class="msg">${msg}</span>`;
      this.element.appendChild(n);
      setTimeout(() => n.classList.add('is-success'), 50);
      setTimeout(() => n.classList.remove('is-success'), timeout);
      setTimeout(() => n.remove(), timeout + 400);
    },
    isDuplicate: function isDuplicate(msg) {
      for (const { childNodes } of this.element.childNodes) {
        if (childNodes[0].innerHTML === msg) return true;
      }
      return false;
    },
  },
};

// -------------------
// EVENT LISTENERS
// -------------------
ui.file.input.addEventListener('change', tryUpload);
window.addEventListener('dragover', preventDragDrop);
window.addEventListener('drop', preventDragDrop);

// -------------------
// EVENT LISTENER FUNCTIONS
// -------------------
function preventDragDrop(e) {
  if (e.target !== ui.file.input) e.preventDefault();
}
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
      ui.alert.success(res.data);
      window.open(baseURL + res.data.path);
    })
    .catch((err) => {
      ui.alert.error(err);
    })
    .finally(() => {
      console.log('done!');
      ui.file.input.disabled = false;
      ui.file.input.value = null;
    });
}
