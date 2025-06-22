const fs = require("fs");
const readline = require("readline");
const path = require("path");

async function analyzeLargeFile(filename = "large-text.txt") {
  const filePath = path.join(__dirname, "..", "data", filename);
  const stream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const results = [];
  let lineCount = 0;
  let totalWords = 0;

  for await (const line of rl) {
    const wordCount = line.split(/\W+/).filter(Boolean).length;
    results.push({ line: lineCount + 1, words: wordCount });
    totalWords += wordCount;
    lineCount++;
  }

  return {
    lines: lineCount,
    totalWords,
    results: results.slice(0, 10), // only preview
  };
}

module.exports = analyzeLargeFile;
