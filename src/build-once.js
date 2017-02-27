#!/usr/bin/env node

const buildIcons = require('./build-icons');
const params = require('./parse-params');
const fs = require('fs');

if (!fs.existsSync(params.outputDir)) {
  buildIcons(params.inputDir, params.outputDir);
}
