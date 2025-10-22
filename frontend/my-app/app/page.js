"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Users,
  Calendar,
  Building2,
  User,
  Briefcase,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("transcript");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states for transcript
  const [transcriptData, setTranscriptData] = useState({
    transcript: "",
    company_name: "",
    attendees: "",
    date: new Date().toISOString().split("T")[0], // Default to today's date
  });

  // Form states for LinkedIn
  const [linkedinData, setLinkedinData] = useState({
    linkedin_bio: "",
    pitch_deck: "",
    company_name: "",
    role: "",
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/insights`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`);
      if (response.ok) {
        const data = await response.json();
        alert(
          `✅ ${data.message}\nFrontend: ${data.frontend_url}\nBackend: ${data.backend_url}`
        );
      } else {
        alert("❌ Connection test failed");
      }
    } catch (error) {
      console.error("Connection test error:", error);
      alert("❌ Connection test failed: " + error.message);
    }
  };

  const testPostConnection = async () => {
    try {
      const testData = { test: "data", timestamp: new Date().toISOString() };
      console.log("Testing POST with data:", testData);

      const response = await fetch(`${API_BASE_URL}/api/test-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("POST Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        alert(
          `✅ POST Test successful!\nReceived: ${JSON.stringify(
            data.received_data
          )}`
        );
      } else {
        alert(`❌ POST Test failed: ${response.status}`);
      }
    } catch (error) {
      console.error("POST test error:", error);
      alert("❌ POST test failed: " + error.message);
    }
  };

  const handleTranscriptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Current transcriptData:", transcriptData);

      // Validate required fields
      if (
        !transcriptData.transcript ||
        !transcriptData.company_name ||
        !transcriptData.attendees ||
        !transcriptData.date
      ) {
        alert("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const attendeesList = transcriptData.attendees
        .split(",")
        .map((a) => a.trim());

      const requestData = {
        transcript: transcriptData.transcript,
        company_name: transcriptData.company_name,
        attendees: attendeesList,
        date: transcriptData.date || new Date().toISOString().split("T")[0], // Fallback to today's date
      };

      console.log("Submitting transcript data:", requestData);
      const response = await fetch(`${API_BASE_URL}/api/transcript-insight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log("Transcript processed:", result);

        // Add to insights and refresh
        setInsights((prev) => [result, ...prev]);
        setTranscriptData({
          transcript: "",
          company_name: "",
          attendees: "",
          date: "",
        });
      } else {
        let errorMessage = "Please try again.";
        try {
          const error = await response.json();
          console.error("Failed to process transcript:", error);
          errorMessage = error.error || error.message || "Please try again.";
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert(`Failed to process transcript: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to process transcript:", error);
      alert("Failed to process transcript. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting LinkedIn data:", linkedinData);

      // Validate required fields
      if (
        !linkedinData.linkedin_bio ||
        !linkedinData.pitch_deck ||
        !linkedinData.company_name ||
        !linkedinData.role
      ) {
        alert("Please fill in all required fields");
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/linkedin-insight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkedinData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log("LinkedIn insight processed:", result);

        // Add to insights and refresh
        setInsights((prev) => [result, ...prev]);
        setLinkedinData({
          linkedin_bio: "",
          pitch_deck: "",
          company_name: "",
          role: "",
        });
      } else {
        let errorMessage = "Please try again.";
        try {
          const error = await response.json();
          console.error("Failed to process LinkedIn data:", error);
          errorMessage = error.error || error.message || "Please try again.";
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert(`Failed to process LinkedIn data: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Failed to process LinkedIn data:", error);
      alert("Failed to process LinkedIn data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">MyBizSherpa</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered business insights for better meetings and outreach
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={testConnection} variant="outline">
              🔗 Test GET Connection
            </Button>
            <Button onClick={testPostConnection} variant="outline">
              📤 Test POST Connection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Forms */}
          <div className="space-y-6">
            <div className="flex space-x-2 mb-6">
              <Button
                variant={activeTab === "transcript" ? "default" : "outline"}
                onClick={() => setActiveTab("transcript")}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Transcript Insight
              </Button>
              <Button
                variant={activeTab === "linkedin" ? "default" : "outline"}
                onClick={() => setActiveTab("linkedin")}
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                LinkedIn Icebreaker
              </Button>
            </div>

            {activeTab === "transcript" && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcript Analysis</CardTitle>
                  <CardDescription>
                    Upload a meeting transcript to get AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTranscriptSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={transcriptData.company_name}
                        onChange={(e) =>
                          setTranscriptData({
                            ...transcriptData,
                            company_name: e.target.value,
                          })
                        }
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="attendees">
                        Attendees (comma-separated)
                      </Label>
                      <Input
                        id="attendees"
                        value={transcriptData.attendees}
                        onChange={(e) =>
                          setTranscriptData({
                            ...transcriptData,
                            attendees: e.target.value,
                          })
                        }
                        placeholder="John Doe, Jane Smith"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Meeting Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={transcriptData.date}
                        onChange={(e) =>
                          setTranscriptData({
                            ...transcriptData,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="transcript">Transcript</Label>
                      <Textarea
                        id="transcript"
                        value={transcriptData.transcript}
                        onChange={(e) =>
                          setTranscriptData({
                            ...transcriptData,
                            transcript: e.target.value,
                          })
                        }
                        placeholder="Paste your meeting transcript here..."
                        rows={8}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Processing..." : "Generate Insights"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "linkedin" && (
              <Card>
                <CardHeader>
                  <CardTitle>LinkedIn Icebreaker</CardTitle>
                  <CardDescription>
                    Generate personalized outreach strategies from LinkedIn
                    profiles and pitch decks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLinkedinSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="linkedin-bio">LinkedIn Bio</Label>
                      <Textarea
                        id="linkedin-bio"
                        value={linkedinData.linkedin_bio}
                        onChange={(e) =>
                          setLinkedinData({
                            ...linkedinData,
                            linkedin_bio: e.target.value,
                          })
                        }
                        placeholder="Paste LinkedIn profile about section..."
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pitch-deck">Pitch Deck</Label>
                      <Textarea
                        id="pitch-deck"
                        value={linkedinData.pitch_deck}
                        onChange={(e) =>
                          setLinkedinData({
                            ...linkedinData,
                            pitch_deck: e.target.value,
                          })
                        }
                        placeholder="Paste pitch deck content..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company-name">Company</Label>
                        <Input
                          id="company-name"
                          value={linkedinData.company_name}
                          onChange={(e) =>
                            setLinkedinData({
                              ...linkedinData,
                              company_name: e.target.value,
                            })
                          }
                          placeholder="Company name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={linkedinData.role}
                          onChange={(e) =>
                            setLinkedinData({
                              ...linkedinData,
                              role: e.target.value,
                            })
                          }
                          placeholder="Their role"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Processing..." : "Generate Icebreaker"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Insights Feed */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Insights Feed</h2>
            {insights.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No insights yet. Create your first insight above!
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {insight.type === "transcript" ? (
                        <FileText className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Users className="w-5 h-5 text-green-500" />
                      )}
                      <CardTitle className="text-lg">
                        {insight.type === "transcript"
                          ? "Meeting Insights"
                          : "LinkedIn Strategy"}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {insight.type === "transcript" ? (
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {insight.metadata.company_name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {insight.metadata.date}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {insight.metadata.company_name}
                          </span>
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {insight.metadata.role}
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {insight.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
