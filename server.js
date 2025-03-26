const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const GoogleAI = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors(
    {
        origin: '*',
        methods: 'GET,POST',
        allowedHeaders: 'Content-Type, Authorization'
    }
));

// Initialize AI clients
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const googleAIClient = new GoogleAI.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const { model, prompt } = req.body;
  
  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  next();
};

app.get('/', (req, res) => {
    res.send('Hello World!');
    });

// Route for AI completions
app.post('/api/complete', validateRequest, asyncHandler(async (req, res) => {
  const { model, prompt, maxTokens = 300, temperature = 0.7 } = req.body;
  let response;
  switch (model) {
    case 'claude-3-sonnet':
      response = await anthropicClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }]
      });
      console.log({response});
      res.json({
        completion: response.content[0].text,
        model: 'claude-3-sonnet'
      });
      break;

     case 'gpt-4':
       response = await openaiClient.chat.completions.create({
         model: 'gpt-4-turbo',
         max_tokens: maxTokens,
         temperature,
         messages: [{ role: 'user', content: prompt }]
       });
       res.json({
         completion: response.choices[0].message.content,
         model: 'gpt-4'
       });
       break;

     case 'gemini-pro':
      const generativeModel = googleAIClient.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { 
          maxOutputTokens: maxTokens,
          temperature
        }
      });
      
      response = await generativeModel.generateContent(prompt);
      res.json({
        completion: response.response.text(),
        model: 'gemini-pro'
      });
      break;

    default:
      res.status(400).json({ error: 'Unsupported model' });
  }
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;