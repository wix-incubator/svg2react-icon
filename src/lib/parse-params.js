const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .option('--named-export', 'Produce named export')
  .option('--keep-colors', 'Keep SVG fill and stroke colors')
  .option('--no-sub-dir', 'Output index file and components all inside the output directory')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0],
  outputDir: program.args[1],
  monochrome: Boolean(program.monochrome),
  typescript: Boolean(program.typescript),
  namedExport: Boolean(program.namedExport),
  keepColors: Boolean(program.keepColors),
  subDir: Boolean(program.subDir)
};
