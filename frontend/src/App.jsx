import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    brandName: "",
    industry: "",
    audience: "",
    goal: "",
  });

  const [tone, setTone] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (e) => {
    const { name, value, checked } = e.target;

    if (name === "tone") {
      setTone((prev) =>
        checked ? [...prev, value] : prev.filter((t) => t !== value)
      );
    }

    if (name === "platforms") {
      setPlatforms((prev) =>
        checked ? [...prev, value] : prev.filter((p) => p !== value)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("http://127.0.0.1:8000/campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_name: form.brandName,
          industry: form.industry,
          audience: form.audience,
          tone,
          goal: form.goal,
          platforms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      setOutput(data.ai_feedback || "No response received");
    } catch (err) {
      setOutput("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FINAL SMART PARSER (WORKS FOR ### FORMAT)
  const getSection = (label) => {
    if (!output) return "";

    const regex = new RegExp(
      `(?:###\\s*)?${label}[:\\s]*([\\s\\S]*?)(?=\\n###|$)`,
      "i"
    );

    const match = output.match(regex);

    return match ? match[1].trim() : "";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚀 AI Marketing Campaign Analyzer</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="brandName"
            placeholder="Brand Name"
            value={form.brandName}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="industry"
            placeholder="Industry"
            value={form.industry}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="audience"
            placeholder="Target Audience"
            value={form.audience}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="goal"
            placeholder="Campaign Goal"
            value={form.goal}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Tone */}
          <div style={styles.section}>
            <strong>🎯 Tone:</strong>
            {["Professional", "Casual", "Inspirational", "Funny"].map((t) => (
              <label key={t} style={styles.checkbox}>
                <input
                  type="checkbox"
                  name="tone"
                  value={t}
                  onChange={handleMultiSelect}
                />{" "}
                {t}
              </label>
            ))}
          </div>

          {/* Platforms */}
          <div style={styles.section}>
            <strong>📱 Platforms:</strong>
            {["Instagram", "LinkedIn", "Twitter"].map((p) => (
              <label key={p} style={styles.checkbox}>
                <input
                  type="checkbox"
                  name="platforms"
                  value={p}
                  onChange={handleMultiSelect}
                />{" "}
                {p}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "🔄 Analyzing..." : "Analyze Campaign"}
          </button>
        </form>

        {/* OUTPUT */}
        {output && (
          <div style={styles.output}>
            {output.startsWith("❌") ? (
              <p style={{ color: "red" }}>{output}</p>
            ) : (
              <>
                <div style={styles.resultCard}>
                  <h3>✅ Verdict</h3>
                  <p>{getSection("Verdict") || "Not found"}</p>
                </div>

                <div style={styles.resultCard}>
                  <h3>📊 Reason</h3>
                  <p>{getSection("Reason") || "Not found"}</p>
                </div>

                <div style={styles.resultCard}>
                  <h3>💡 Suggested Tone</h3>
                  <p>
                    {getSection("Suggested Tone") ||
                      getSection("Suggest Better Tone") ||
                      getSection("Suggestion") ||
                      "Not found"}
                  </p>
                </div>

                {/* Raw Output */}
                <div style={{ marginTop: "15px" }}>
                  <h4>🔍 Raw Output:</h4>
                  <pre style={styles.raw}>{output}</pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// Styles
const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef2f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    width: "400px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  section: {
    marginBottom: "10px",
  },
  checkbox: {
    marginRight: "10px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  output: {
    marginTop: "20px",
  },
  resultCard: {
    background: "#f5f7fa",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  raw: {
    background: "#000",
    color: "#0f0",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
  },
};