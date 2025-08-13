const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json()); // Parse JSON request bodies

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

app.post('/chat', async (req, res) => {
    try {
        const startTime = Date.now();
        console.log(`Processing request: ${JSON.stringify(req.body)}`);
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages must be a non-empty array' });
        }
        for (const msg of messages) {
            if (!msg.role || !msg.content || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
                return res.status(400).json({ error: 'Each message must have a valid role and content' });
            }
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const body = {
            contents: messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 200,
            },
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Gemini API responded with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Gemini API error' });
        }

       const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn’t generate a response.';
        console.log(`Response: ${answer}, took ${Date.now() - startTime}ms`);
        res.json({ content: answer });
    } catch (error) {
        console.error('Error in /chat:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Gemini chat server running on http://localhost:${port}`);
});




