const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .option('--strip-attributes', 'Strip some attributes (fill and stroke at least; defaults to enabled, use --no-strip-attributes to disable)')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0],
  outputDir: program.args[1],
  monochrome: Boolean(program.monochrome),
  stripAttributes: program.stripAttributes === undefined ? undefined : Boolean(program.stripAttributes),
  typescript: Boolean(program.typescript)
};
