#!/usr/bin/env node

const buildIcons = require('./build-icons');
const params = require('./lib/parse-params');
const fs = require('fs');

if (!fs.existsSync(params.outputDir)) {
  buildIcons(params);
}
