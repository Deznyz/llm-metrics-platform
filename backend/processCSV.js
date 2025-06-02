const fs = require("fs");
const csv = require("csv-parser");


const { calculateMetrics } = require("./metrics");

async function processCSV(inputFilePath, outputFilePath, classifiers) {
    const results = [];
    const predictionsByLLM = {}; //stores predictions for each llm
    const trueLabels = [];

    //creates empty array (predictionsByLLM) for each classifier
    Object.keys(classifiers).forEach((llmName) => {
        predictionsByLLM[llmName] = [];
    });

    return new Promise((resolve, reject) => {
        fs.createReadStream(inputFilePath).pipe(csv()).on("data", (row) => { //pushes each row of the csv to results array
                results.push(row);
            }).on("end", async () => {
                console.log("CSV file successfully processed");

                let idx = 0; //index for current row being processed

                for (const row of results) {
                    if (!row["label"]) {
                        console.warn(`Row is missing a label: ${JSON.stringify(row)}`);
                        continue; //skips rows with missing labels
                    }

                    const emailText = row["feature"];
                    const trueLabel = row["label"] ? row["label"].toLowerCase() : null; //handles missing labels

                    if (!trueLabel) {
                        console.warn("skipping row due to missing label:", row);
                        continue; //skips rows with missing labels
                    }

                    trueLabels.push(trueLabel);

                    //logs the row being processed
                    //console.log(`Processing row: ${JSON.stringify(row)}`);

                    console.log(`\n \nprocessing row ${idx}`);
                    idx++; //increments index for next row
                    console.log(`email text: \n${emailText}\n`);

                    //gets predictions from all LLMs
                    for (const [llmName, classifier] of Object.entries(classifiers)) {
                        try {
                            console.log(`calling classifier: ${llmName}`);
                            const prediction = await classifier(emailText);
                            
                            predictionsByLLM[llmName].push(prediction);
                            
                            row[`${llmName}_prediction`] = prediction; //adds prediction to row in csv

                            console.log(`classifier ${llmName} prediction: ${prediction}\n`);
                        } catch (error) {
                            console.error(`error with classifier ${llmName} on row: ${JSON.stringify(row)}`, error);
                            predictionsByLLM[llmName].push("error"); //adds "error" as prediction
                            row[`${llmName}_prediction`] = "error";
                        }
                    }
                }

                console.log("\nall rows processed");

                //writes results to new CSV
                const outputData = results.map((row) => {
                    const rowData = {
                        feature: row["feature"],
                        label: row["label"],
                    };

                    //posts predictions for each llm
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

                const csvContent = outputData.map((row) => csvHeader.split(",").map((key) => row[key]).join(",")).join("\n");
                fs.writeFileSync(outputFilePath, `${csvHeader}\n${csvContent}`);

                //calculates metrics for llms
                const metricsByLLM = {};
                Object.keys(classifiers).forEach((llmName) => {
                    metricsByLLM[llmName] = calculateMetrics(trueLabels, predictionsByLLM[llmName]);
                });

                resolve({ outputFilePath, metricsByLLM }); //returns file path and metrics for all LLMs
            })
            .on("error", (error) => reject(error));
    });
}

module.exports = { processCSV };