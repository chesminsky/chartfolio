const path = require('path');
const express = require('express');
const compression = require('compression');
const fs = require('fs');

const CONTEXT = `/${process.env.CONTEXT || 'assets-web'}`;
const PORT = process.env.PORT || 4000;

const app = express();
const staticPath = path.resolve(__dirname, '../../dist/assets-web');

app.use(compression());
app.use(CONTEXT, express.static(staticPath));
app.use('/', express.static(staticPath));
app.get('/*', (req, res) => res.sendFile(path.join(staticPath, '/index.html')));
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
