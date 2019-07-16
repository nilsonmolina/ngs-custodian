// DEPENDENCIES
// const path = require('path');
const multer = require('multer');
const express = require('express');

// SETUP
const router = express.Router();
const upload = multer({
  dest: 'private/uploads/',
  limits: { fileSize: 40 * 1000 * 1000 }, // 40MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(zip)$/)) return cb(new Error('Must be zip file'), false);
    return cb(null, true);
  },
});

// API ROUTES
router.get('/', (req, res) => {
  const files = [];
  res.status(200).send(files);
});

router.post('/', upload.single('pricelist'), (req, res) => {
  res.send(req.file.filename);
});

module.exports = router;
