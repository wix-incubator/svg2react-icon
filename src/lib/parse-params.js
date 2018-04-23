const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .option('--strip-attributes', 'Strip any attributes (fill, stroke, etc.) ')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0],
  outputDir: program.args[1],
  monochrome: Boolean(program.monochrome),
  attributeStrip: program.stripAttributes === undefined ? undefined : Boolean(program.stripAttributes),
  typescript: Boolean(program.typescript)
};
