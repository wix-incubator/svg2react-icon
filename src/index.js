#!/usr/bin/env node

const buildIcons = require('./build-icons');
const params = require('./lib/parse-params');

buildIcons(params);
