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
      // if (prompt('Enter the password.') !== 'Testing123') {
      //   ui.alert.error('You are not authorized to upload');
      //   this.input.value = null;
      //   return false;
      // }

      return true;
    },
  },
  savedFiles: {
    element: document.querySelector('.saved-files'),
    getFiles: function getFiles() {
      console.log('getting files');
      const baseUrl = 'http://127.0.0.1:6464/pricelists';
      axios.get(`${baseUrl}/pricelists.json`)
        .then((res) => {
          console.log(res.data);
          res.data.forEach((curr, index) => {
            const f = document.createElement('div');
            f.setAttribute('class', 'file hidden');
            f.innerHTML = `
              <div class="icon"></div>
              <div class="details">
                  <div class="title">${curr.fileName}</div>
                  <div class="size">${curr.fileSize}MB</div>
              </div>
              <div class="download">
                  <a href="${baseUrl}/${curr.rawUrl}" class="raw">raw</a>
                  <a href="${baseUrl}/${curr.cleanedUrl}" class="cleaned"></a>
              </div>
            `;
            this.element.appendChild(f);
            setTimeout(() => f.classList.remove('hidden'), index * 200);
          });
        })
        .catch(err => ui.alert.error(err));
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
// INITIALIZE AND SETUP
// -------------------
ui.savedFiles.getFiles();

// -------------------
// EVENT LISTENERS
// -------------------
window.addEventListener('dragover', preventDragDrop);
window.addEventListener('drop', preventDragDrop);
ui.file.input.addEventListener('change', tryUpload);

// -------------------
// EVENT LISTENER FUNCTIONS
// -------------------
function preventDragDrop(e) {
  if (e.target !== ui.file.input) e.preventDefault();
}

function tryUpload() {
  if (!ui.file.isValid()) return;
  ui.file.input.disabled = true;

  compressFile(ui.file.input.files[0])
    .then(f => postFile(f))
    .catch(err => ui.alert.error(err));
}

// -------------------
// HELPER FUNCTIONS
// -------------------
function postFile(file) {
  const fd = new FormData();
  fd.append('pricelist', file, 'pricelist.gz');
  // CONFIGURE AXIOS POST
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      // ui.progress.innerHTML = `${Math.round((e.loaded * 100) / e.total)} %`;
      const percentage = Math.round((e.loaded * 100) / e.total);
      if (percentage < 100) {
        console.log(percentage);
      } else {
        console.log('sanitizing...');
      }
    },
  };
  // POST FILE TO API
  const baseURL = 'http://127.0.0.1:6464/';
  const api = `${baseURL}api/pricelists/`;
  // eslint-disable-next-line no-undef
  axios.post(api, fd, config)
    .then((res) => {
      console.log(res.data);
      console.log(baseURL + res.data.path);
      window.open(baseURL + res.data.path, '_blank');
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

function compressFile(f) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./js/compressionWebWorker.js');
    worker.addEventListener('message', workerCompleted);
    worker.addEventListener('error', workerError);

    console.log('compressing...');
    worker.postMessage(f);

    function workerCompleted(e) {
      console.log('compression completed!', e);
      resolve(e.data);
    }

    function workerError(err) {
      console.log('compression failed!');
      reject(err.message);
    }
  });
}
