import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: [
      "https://mybizsherpa-hn97.vercel.app/",
      "https://localhost:3000/"
    ],
    methods: ["GET", "POST"],
        credentials: true,
  })
);
app.use(express.json());

// Initialize Google Gemini
const geminiApiKey = process.env.GEMINI_API_KEY || "placeholder-key";
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0.7 },
});

// Initialize Supabase
const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

// AI Processing functions
async function processTranscriptInsight(
  transcript,
  companyName,
  attendees,
  date
) {
  const prompt = `
    You are a business coach analyzing meeting transcripts to provide actionable insights.
    
    Review this transcript and share what I did well and why, what I could do even better and recommendations of things I can test differently next time.
    
    Company: ${companyName}
    Attendees: ${attendees.join(", ")}
    Date: ${date}
    
    Transcript:
    ${transcript}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

async function processLinkedinInsight(
  linkedinBio,
  pitchDeck,
  companyName,
  role
) {
  const prompt = `
    You are a sales strategist creating personalized outreach strategies.
    
    Based on this LinkedIn bio and pitch deck, generate a cold outreach icebreaker for this person.
    
    LinkedIn Bio:
    ${linkedinBio}
    
    Pitch Deck:
    ${pitchDeck}
    
    Company: ${companyName}
    Role: ${role}
    
    Please provide:
    1. Buying signals from the deck
    2. Why they matter and source of information
    3. Discovery triggers
    4. Smart questions to ask in the next call
    5. Preferred style of buying and how you inferred that
    6. Top 5 things they would like from our deck
    7. What parts may not be clear, relevant or valuable and why
    8. What to do instead
    9. Short summary and 3 reflection questions
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "MyBizSherpa API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint for frontend-backend connection
app.get("/api/test", (req, res) => {
  res.json({
    message: "Frontend-Backend connection successful!",
    timestamp: new Date().toISOString(),
    frontend_url: "http://localhost:3000",
    backend_url: "http://localhost:7000",
  });
});

// Test POST endpoint for debugging
app.post("/api/test-post", (req, res) => {
  console.log("Test POST received:", req.body);
  res.json({
    message: "Test POST successful!",
    received_data: req.body,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/transcript-insight", async (req, res) => {
  try {
    // Check if API keys are configured
    if (geminiApiKey === "placeholder-key") {
      return res.status(500).json({
        error:
          "Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.",
      });
    }

    const { transcript, company_name, attendees, date } = req.body;

    if (!transcript || !company_name || !attendees || !date) {
      return res.status(400).json({
        error:
          "Missing required fields: transcript, company_name, attendees, date",
      });
    }

    // Generate AI insight
    const insight = await processTranscriptInsight(
      transcript,
      company_name,
      attendees,
      date
    );

    // Store in database
    const insightId = uuidv4();
    const insightData = {
      id: insightId,
      type: "transcript",
      content: insight,
      metadata: {
        company_name,
        attendees,
        date,
      },
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("insights")
      .insert(insightData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json(insightData);
  } catch (error) {
    console.error("Transcript insight error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

app.post("/api/linkedin-insight", async (req, res) => {
  try {
    // Check if API keys are configured
    if (geminiApiKey === "placeholder-key") {
      return res.status(500).json({
        error:
          "Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.",
      });
    }

    const { linkedin_bio, pitch_deck, company_name, role } = req.body;

    if (!linkedin_bio || !pitch_deck || !company_name || !role) {
      return res.status(400).json({
        error:
          "Missing required fields: linkedin_bio, pitch_deck, company_name, role",
      });
    }

    // Generate AI insight
    const insight = await processLinkedinInsight(
      linkedin_bio,
      pitch_deck,
      company_name,
      role
    );

    // Store in database
    const insightId = uuidv4();
    const insightData = {
      id: insightId,
      type: "linkedin",
      content: insight,
      metadata: {
        company_name,
        role,
      },
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("insights")
      .insert(insightData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json(insightData);
  } catch (error) {
    console.error("LinkedIn insight error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

app.get("/api/insights", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("insights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json(data || []);
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MyBizSherpa API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
