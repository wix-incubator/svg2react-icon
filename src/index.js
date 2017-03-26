#!/usr/bin/env node

const buildIcons = require('./build-icons');
const params = require('./parse-params');

buildIcons(params.inputDir, params.outputDir, params.isTypeScriptOutput);
