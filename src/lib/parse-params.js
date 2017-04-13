const args = process.argv.slice(2);
const [inputDir, outputDir, isTypeScriptOutput] = args;

module.exports = {
  inputDir: inputDir || 'src/Icons/raw',
  outputDir: outputDir || 'src/Icons/dist',
  isTypeScriptOutput: isTypeScriptOutput || false
};
