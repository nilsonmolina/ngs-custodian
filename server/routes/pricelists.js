// DEPENDENCIES
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');

const { sanitize } = require('../utils/sanitize');
const zipper = require('../utils/zipper');

// SETUP
const router = express.Router();
const upload = multer({
  dest: 'public/uploads/',
  limits: { fileSize: 150 * 1000 * 1000 }, // 150MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.gz$|\.txt/)) return cb(new Error('Must be a txt file'), false);
    return cb(null, true);
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) return cb(err);
      return cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  },
});

// API ROUTES
router.post('/', upload.single('pricelist'), async (req, res) => {
  try {
    const rawPath = `public/uploads/${req.file.filename}-raw`;
    const sanitizedPath = `public/uploads/${req.file.filename}-clean`;

    // UNZIP -> SANITIZE FILE -> ZIP FILE
    await zipper.unzip(req.file.path, rawPath);
    const result = await sanitize(rawPath, sanitizedPath);
    result.path = await zipper.zip(sanitizedPath);
    result.path = result.path.replace('public/', '');

    // CLEAN UP
    await deleteFile(rawPath);
    await deleteFile(sanitizedPath);

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong.');
  }
});

router.get('/auth/:id', (req, res) => {
  if (req.params.id !== 'Testing123') res.status(403).send('Forbidden');
  res.status(200).send('All Good');
});

// HELPER FUNCTIONS
async function deleteFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = router;
