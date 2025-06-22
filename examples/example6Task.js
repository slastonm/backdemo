const { analyzeLargeFile } = require("../utils/analyzeLargeFile");

(async () => {
  console.log("streams + async iterator");

  try {
    const stats = await analyzeLargeFile("data/large-text.txt");
    console.log("Рядків:", stats.lineCount);
    console.log("Слів:", stats.wordCount);
    console.log("Символів:", stats.charCount);
  } catch (err) {
    console.error("Помилка при аналізі:", err.message);
  }
})();
