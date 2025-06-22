const fs = require("fs");
const readline = require("readline");
const path = require("path");

async function analyzeLargeFile(filePath) {
  const absolutePath = path.resolve(__dirname, "../", filePath);

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(absolutePath, { encoding: "utf8" });

    let lineCount = 0;
    let wordCount = 0;
    let charCount = 0;

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      lineCount++;
      wordCount += line.trim().split(/\s+/).filter(Boolean).length;
      charCount += line.length;
    });

    rl.on("error", reject);

    rl.on("close", () => {
      resolve({ lineCount, wordCount, charCount });
    });
  });
}

module.exports = { analyzeLargeFile };
