function calculateMetrics(trueLabels, predictedLabels) {
    let tp = 0, fp = 0, fn = 0, tn = 0;

    trueLabels.forEach((trueLabel, i) => {
        const predictedLabel = predictedLabels[i];
        if (trueLabel === "phishing" && predictedLabel === "phishing") tp++;
        if (trueLabel === "legitimate" && predictedLabel === "phishing") fp++;
        if (trueLabel === "phishing" && predictedLabel === "legitimate") fn++;
        if (trueLabel === "legitimate" && predictedLabel === "legitimate") tn++;
    });

    const accuracy = (tp + tn) / (tp + fp + fn + tn) || 0;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = (2 * precision * recall) / (precision + recall) || 0;

    return { tp, fp, fn, tn, accuracy, precision, recall, f1Score };
}

module.exports = { calculateMetrics };