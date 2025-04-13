import React, { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [downloadLink, setDownloadLink] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:3001/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            setMetrics(data.metricsByLLM); // Set metrics for all LLMs
            setDownloadLink(`http://localhost:3001/download?filePath=${data.filePath}`); // Set the download link
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleDownload = () => {
        if (downloadLink) {
            window.location.href = downloadLink; // Trigger the download
        }
    };

    return (
        <div>
            <h1>Email Classification</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button type="submit">Upload and Process</button>
            </form>
            {metrics && (
                <div>
                    <h2>Confusion Matrices</h2>
                    {Object.entries(metrics).map(([llmName, matrix]) => (
                        <div key={llmName}>
                            <h3>{llmName.toUpperCase()}</h3>
                            <pre>{JSON.stringify(matrix, null, 2)}</pre>
                        </div>
                    ))}
                </div>
            )}
            {downloadLink && (
                <div>
                    <button onClick={handleDownload}>Download Processed CSV</button>
                </div>
            )}
        </div>
    );
}

export default App;
