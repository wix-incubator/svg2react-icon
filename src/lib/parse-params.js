const program = require('commander');

program
  .arguments('<input-dir> <output-dir>')
  .option('--monochrome', 'Strip colors from the SVG')
  .option('--typescript', 'Produce TypeScript output')
  .parse(process.argv);

module.exports = {
  inputDir: program.args[0] || 'src/Icons/raw',
  outputDir: program.args[1] || 'src/Icons/dist',
  monochrome: Boolean(program.monochrome),
  typescript: Boolean(program.typescript)
};
