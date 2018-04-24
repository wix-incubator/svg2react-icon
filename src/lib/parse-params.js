const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .option('--no-strip-attributes', 'Do not strip any attributes (fill, stroke, etc.)')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0],
  outputDir: program.args[1],
  monochrome: Boolean(program.monochrome),
  stripAttributes: program.stripAttributes === undefined ? undefined : Boolean(program.stripAttributes),
  typescript: Boolean(program.typescript)
};
