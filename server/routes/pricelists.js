// ----------------------
// DEPENDENCIES
// ----------------------
const fs = require('fs');
const multer = require('multer');
const express = require('express');

const { sanitize } = require('../utils/sanitize');
const zipper = require('../utils/zipper');

// ----------------------
// SETUP & INIT
// ----------------------
const publicPath = 'public/uploads/';
const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, publicPath),
    filename: (req, file, cb) => cb(null, `pricelist-${Date.now()}`),
  }),
  limits: { fileSize: 150 * 1000 * 1000 }, // 150MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.gz$|\.txt/)) return cb(new Error('Must be a gz file'), false);
    return cb(null, true);
  },
});

// ----------------------
// API ROUTES
// ----------------------
router.post('/', upload.single('pricelist'), async (req, res) => {
  try {
    const rawFilePath = `${publicPath}${req.file.filename}-raw.txt`;
    const sanitizedFilePath = `${publicPath}${req.file.filename}.csv`;

    // UNZIP -> SANITIZE FILE -> ZIP FILE
    await zipper.unzip(req.file.path, rawFilePath);
    const result = await sanitize(rawFilePath, sanitizedFilePath);
    result.path = await zipper.zip(sanitizedFilePath);

    // CLEAN UP
    await deleteFile(rawFilePath);
    await deleteFile(sanitizedFilePath);
    result.path = result.path.replace('public/', '');

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// ----------------------
// HELPER FUNCTIONS
// ----------------------
async function deleteFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = router;
