const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { processCSV } = require("./processCSV");
const { classifyWithGPT } = require("./classifyGPT");
// Future: Add more LLM classifiers here
// const { classifyWithOtherLLM } = require("./classifyOtherLLM");

const app = express();
const upload = multer({ dest: "backend/uploads/" });

const PORT = 3001;

app.use(bodyParser.json());
app.use(cors()); // Allow requests from the frontend

// Endpoint to upload CSV to backend
app.post("/upload", upload.single("file"), async (req, res) => {
    const inputFilePath = req.file.path;
    const outputFilePath = "backend/uploads/output.csv"; // Path for the processed output file

    // Define all integrated LLMs
    const classifiers = {
        gpt: classifyWithGPT,
        // Add more LLMs here
        // otherLLM: classifyWithOtherLLM,
    };

    try {
        const { outputFilePath: generatedFilePath, metricsByLLM } = await processCSV(
            inputFilePath,
            outputFilePath,
            classifiers
        );

        // Send the file path and metrics for all LLMs back to the frontend
        res.status(200).json({ message: "Processing complete", filePath: generatedFilePath, metricsByLLM });
    } catch (error) {
        console.error("Error processing CSV:", error);
        res.status(500).json({ error: "Failed to process CSV" });
    }
});

// Endpoint to download the generated CSV file
app.get("/download", (req, res) => {
    const filePath = req.query.filePath; // Get the file path from the query parameter
    res.download(filePath, "output.csv", (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(500).send("Failed to download file");
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});