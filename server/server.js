// ----------------------
// DEPENDENCIES
// ----------------------
const express = require('express');

const pricelists = require('./routes/pricelists');

// ----------------------
// SETUP & INIT
// ----------------------
const app = express();
const port = process.env.PORT || 6464;

// ----------------------
// LOAD MIDDLEWARE
// ----------------------
app.use(express.json());

// ----------------------
// LOAD API & STATIC ROUTES
// ----------------------
app.use(express.static('./public'));
app.use('/api/pricelists', pricelists);

// ----------------------
// START SERVER
// ----------------------
app.listen(port, () => console.log(`Listening on port ${port}...`));
