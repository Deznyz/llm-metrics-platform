const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { processCSV } = require("./processCSV");


const { classifyWithGPT } = require("./classifyGPT");
//future: add more llm classifiers here like abvoe

const app = express();
const upload = multer({ dest: "backend/uploads/" });

const PORT = 3001;

app.use(bodyParser.json());
app.use(cors()); //allows requests from frontend

//endpoint to upload CSV to backend
app.post("/upload", upload.single("file"), async (req, res) => {
    const inputFilePath = req.file.path;
    const outputFilePath = "backend/uploads/output.csv"; // Path for the processed output file

    //define all integrated llms
    const classifiers = {
        gpt: classifyWithGPT,
        //future: add more LLMs here
    };

    try {
        const { outputFilePath: generatedFilePath, metricsByLLM } = await processCSV(
            inputFilePath,
            outputFilePath,
            classifiers
        );

        //sends the file path and metrics drom llms back to frontend
        res.status(200).json({ message: "Processing complete", filePath: generatedFilePath, metricsByLLM });
    } catch (error) {
        console.error("Error processing CSV:", error);
        res.status(500).json({ error: "Failed to process CSV" });
    }
});

//endpoint to download new CSV file
app.get("/download", (req, res) => {
    const filePath = req.query.filePath; //gets file path from query parameter
    res.download(filePath, "output.csv", (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(500).send("Failed to download file");
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});