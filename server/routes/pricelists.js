// DEPENDENCIES
const fs = require('fs');
const multer = require('multer');
const express = require('express');

const { sanitize } = require('../utilities/sanitize');
const { zip } = require('../utilities/zipper');

// SETUP
const router = express.Router();
const upload = multer({
  dest: 'public/uploads/',
  limits: { fileSize: 150 * 1000 * 1000 }, // 150MB
  fileFilter: (req, file, cb) => {
    // MATCH MULTIPLE WITH:  /\.zip$|\.gz$|\.txt$/
    if (!file.originalname.match(/\.txt$/)) return cb(new Error('Must be a txt file'), false);
    return cb(null, true);
  },
});

// API ROUTES
router.get('/', (req, res) => {
  const files = [];
  res.status(200).send(files);
});

router.post('/', upload.single('pricelist'), async (req, res) => {
  try {
    const sanitizedPath = `public/uploads/${req.file.filename}.txt`;

    const result = await sanitize(req.file.path, sanitizedPath);
    const zipped = await zip(sanitizedPath);
    result.path = zipped.replace('public/', '');

    fs.unlinkSync(sanitizedPath);
    fs.unlinkSync(req.file.path);

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong.');
  }
});

module.exports = router;
