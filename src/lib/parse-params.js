const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .option('--named-export', 'Produce named export')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0],
  outputDir: program.args[1],
  monochrome: Boolean(program.monochrome),
  typescript: Boolean(program.typescript),
  namedExport: Boolean(program.namedExport)
};
