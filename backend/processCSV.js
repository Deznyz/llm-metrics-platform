const fs = require("fs");
const csv = require("csv-parser");
const { calculateMetrics } = require("./metrics");

async function processCSV(inputFilePath, outputFilePath, classifiers) {
    const results = [];
    const predictionsByLLM = {}; // Store predictions for each LLM
    const trueLabels = [];

    // Initialize predictionsByLLM for each classifier
    Object.keys(classifiers).forEach((llmName) => {
        predictionsByLLM[llmName] = [];
    });

    return new Promise((resolve, reject) => {
        fs.createReadStream(inputFilePath)
            .pipe(csv())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                console.log("CSV file successfully processed.");

                for (const row of results) {
                    const emailText = row["feature"];
                    const trueLabel = row["label"].toLowerCase();
                    trueLabels.push(trueLabel);

                    // Get predictions from all LLMs
                    for (const [llmName, classifier] of Object.entries(classifiers)) {
                        const prediction = await classifier(emailText);
                        predictionsByLLM[llmName].push(prediction);
                        row[`${llmName}_prediction`] = prediction; // Add prediction to the row
                    }
                }

                // Write results to a new CSV
                const outputData = results.map((row) => {
                    const rowData = {
                        feature: row["feature"],
                        label: row["label"],
                    };

                    // Add predictions for each LLM
                    Object.keys(classifiers).forEach((llmName) => {
                        rowData[`${llmName}_prediction`] = row[`${llmName}_prediction`];
                    });

                    return rowData;
                });

                const csvHeader = [
                    "feature",
                    "label",
                    ...Object.keys(classifiers).map((llmName) => `${llmName}_prediction`),
                ].join(",");
                const csvContent = outputData
                    .map((row) =>
                        csvHeader
                            .split(",")
                            .map((key) => row[key])
                            .join(",")
                    )
                    .join("\n");
                fs.writeFileSync(outputFilePath, `${csvHeader}\n${csvContent}`);

                // Calculate metrics for each LLM
                const metricsByLLM = {};
                Object.keys(classifiers).forEach((llmName) => {
                    metricsByLLM[llmName] = calculateMetrics(trueLabels, predictionsByLLM[llmName]);
                });

                resolve({ outputFilePath, metricsByLLM }); // Return the file path and metrics for all LLMs
            })
            .on("error", (error) => reject(error));
    });
}

module.exports = { processCSV };