/* eslint-env browser */
const { axios } = window;

const baseURL = 'http://127.0.0.1:6464';
// -------------------
// UI ELEMENTS
// -------------------
const ui = {
  uploader: {
    button: document.querySelector('.uploader .button'),
    input: document.querySelector('.uploader input[type="file"]'),
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
  uploading: {
    progressBar: document.querySelector('.uploading hr'),
    progressPercentage: document.querySelector('.uploading h1'),
    setProgress: function setProgress(percent) {
      this.progressBar.style.width = `${percent}%`;
      this.progressPercentage.innerHTML = `${percent}%`;
    },
  },
  downloader: {
    element: document.querySelector('.downloader'),
    button: document.querySelector('.downloader .button'),
    parts: document.querySelector('.downloader .parts .value'),
    cleanTime: document.querySelector('.downloader .clean-time .value'),
    totalTime: document.querySelector('.downloader .total-time .value'),
    showResults: function showResults(results) {
      this.button.href = `${baseURL}/${results.path}`;
      this.parts.innerHTML = `${results.parts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parts`;
      this.cleanTime.innerHTML = `${Math.round((results.elapsed / 1000) * 10) / 10} seconds`;
      this.totalTime.innerHTML = `${Math.round((new Date() - ui.startTime) / 1000 * 10) / 10} seconds`;
    },
  },
  savedFiles: {
    element: document.querySelector('.file-list'),
    getFiles: function getFiles() {
      axios.get(`${baseURL}/pricelists/pricelists.json`)
        .then((res) => {
          res.data.forEach((curr, index) => {
            const f = document.createElement('div');
            f.setAttribute('class', 'file hidden');
            f.innerHTML = `
              <div class="icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <title>file-empty</title>
                  <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
                </svg>
              </div>
              <div class="details">
                  <div class="title">${curr.fileName}</div>
                  <div class="size">${curr.fileSize}MB</div>
              </div>
              <div class="download">
                  <a href="${baseURL}/pricelists/${curr.rawUrl}" class="raw" download>raw</a>
                  <a href="${baseURL}/pricelists/${curr.cleanedUrl}" class="cleaned" download>cleaned</a>
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

  modes: {
    uploader: document.querySelector('.uploader'),
    compressing: document.querySelector('.compressing'),
    uploading: document.querySelector('.uploading'),
    sanitizing: document.querySelector('.sanitizing'),
    downloader: document.querySelector('.downloader'),
  },
  changeMode: function changeMode(mode) {
    for (const curr in ui.modes) {
      if (ui.modes[curr] === mode) ui.modes[curr].classList.add('visible');
      else ui.modes[curr].classList.remove('visible');
    }
  },
  startTime: null,
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
ui.uploader.input.addEventListener('change', tryUpload);
ui.downloader.button.addEventListener('click', () => ui.changeMode(ui.modes.uploader));

// -------------------
// EVENT LISTENER FUNCTIONS
// -------------------
function preventDragDrop(e) {
  if (e.target !== ui.uploader.input) e.preventDefault();
}

function tryUpload() {
  if (!ui.uploader.isValid()) return;
  ui.startTime = new Date();
  ui.changeMode(ui.modes.compressing);

  compressFile(ui.uploader.input.files[0])
    .then((f) => {
      ui.changeMode(ui.modes.uploading);
      postFile(f);
    })
    .catch((err) => {
      ui.changeMode(ui.modes.uploader);
      ui.alert.error(err);
    });
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
      const percentage = Math.round((e.loaded * 100) / e.total);
      if (percentage < 100) ui.uploading.setProgress(percentage);
      else ui.changeMode(ui.modes.sanitizing);
    },
  };
  // POST FILE TO API
  const api = `${baseURL}/api/pricelists/`;
  axios.post(api, fd, config)
    .then((res) => {
      ui.changeMode(ui.modes.downloader);
      ui.alert.success('File Grooming Completed!');
      ui.downloader.showResults(res.data);
    })
    .catch((err) => {
      ui.changeMode(ui.modes.uploader);
      ui.alert.error(err);
    })
    .finally(() => {
      ui.uploader.input.value = null;
    });
}

function compressFile(f) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./js/compressionWebWorker.js');
    worker.addEventListener('message', workerCompleted);
    worker.addEventListener('error', workerError);

    worker.postMessage(f);

    function workerCompleted(e) {
      resolve(e.data);
    }

    function workerError(err) {
      reject(err.message);
    }
  });
}
