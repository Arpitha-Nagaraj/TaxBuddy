require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-latest";

// Define tax-related keywords
const taxKeywords = [
    "tax", "IRS", "deduction", "income tax", "refund", "audit", "capital gains", 
    "tax return", "federal tax", "state tax", "filing", "bracket", "exemption", 
    "taxable income", "1099", "W-2", "W2", "CPA", "H&R Block", "TurboTax", "1099-B", 
    "1099-DIV", "1099B", "1099DIV", "IP-PIN","IPPIN"," IP PIN","1098-T", "1098","1098T",
    "1099-SA","1099SA","5498-SA","5498SA","5498","1095-C","1095","1095C", "cost basis",
    "RSU"
];

// Function to check if the question is tax-related
function isTaxRelated(question) {
    const lowerCaseQuestion = question.toLowerCase();
    return taxKeywords.some(keyword => lowerCaseQuestion.includes(keyword));
}

// API endpoint for chat
app.post("/api/ask", async (req, res) => {
    const { question } = req.body;

    // Validate the question
    if (!isTaxRelated(question)) {
        return res.status(400).json({
            answer: "⚠️ Please ask a tax-related question. Example: 'How do I file my tax return?'"
        });
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: question }] }]
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        console.log("🔍 API Response:", response.data);

        let answer = "Sorry, I couldn't fetch an answer.";
        if (response.data.candidates && response.data.candidates.length > 0) {
            answer = response.data.candidates[0].content.parts[0].text;
        }

        res.json({ answer });
    } catch (error) {
        console.error("Error fetching response:", error.response ? error.response.data : error.message);
        res.status(500).json({ answer: "Sorry, I couldn't fetch an answer." });
    }
});

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
