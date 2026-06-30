import React, { useState, useMemo } from "react";
import {
  Compass, Brain, BookOpen, PlayCircle, MessageSquareText, CheckCircle2,
  Circle, Clock, Sparkles, ArrowRight, RotateCcw, Search, X
} from "lucide-react";
import "./Navexora.css";

// ---------- Data: hand-curated paths ----------

const PATHS = {
  "ml-engineer": {
    label: "ML Engineer",
    blurb: "Build and ship machine learning systems end to end.",
    phases: [
      {
        title: "Foundations",
        weeks: 8,
        skills: ["Python fundamentals", "Statistics & probability", "Linear algebra & calculus basics"],
        books: ["Python Crash Course – Eric Matthes", "Mathematics for Machine Learning – Deisenroth et al."],
        playlists: ["freeCodeCamp – Python for Everybody", "3Blue1Brown – Essence of Linear Algebra"],
        interview: ["Explain bias-variance tradeoff", "What is a p-value?", "Eigenvectors, intuitively?"]
      },
      {
        title: "Core Machine Learning",
        weeks: 10,
        skills: ["Supervised & unsupervised learning", "Feature engineering", "Scikit-learn pipelines"],
        books: ["Hands-On Machine Learning – Aurélien Géron", "An Introduction to Statistical Learning"],
        playlists: ["StatQuest – Machine Learning", "Andrew Ng – Machine Learning Specialization"],
        interview: ["Compare bagging vs boosting", "When would you use precision over recall?", "Explain regularization (L1 vs L2)"]
      },
      {
        title: "Deep Learning",
        weeks: 8,
        skills: ["Neural networks from scratch", "CNNs & RNNs", "PyTorch / TensorFlow"],
        books: ["Deep Learning – Goodfellow, Bengio, Courville", "Dive into Deep Learning (online, free)"],
        playlists: ["Andrej Karpathy – Neural Networks: Zero to Hero", "deeplizard – PyTorch in 1 hour"],
        interview: ["Why do we need activation functions?", "Explain vanishing gradients", "CNN vs RNN — when to use which?"]
      },
      {
        title: "Projects & Deployment",
        weeks: 5,
        skills: ["End-to-end ML pipeline", "Model serving & APIs", "Basic MLOps"],
        books: ["Designing Machine Learning Systems – Chip Huyen"],
        playlists: ["freeCodeCamp – MLOps Course", "Krish Naik – End to End ML Project"],
        interview: ["How do you monitor a model in production?", "Explain train/serve skew", "Walk through one project you deployed"]
      },
      {
        title: "Interview Prep",
        weeks: 5,
        skills: ["DSA for ML roles", "ML system design", "Behavioral rounds"],
        books: ["Cracking the Machine Learning Interview – Subhrajit Roy"],
        playlists: ["Exponent – ML System Design Mock Interviews"],
        interview: ["Design a recommendation system for 10M users", "Tell me about a time a model underperformed in prod"]
      }
    ]
  },
  "data-analyst": {
    label: "Data Analyst",
    blurb: "Turn raw data into decisions stakeholders can act on.",
    phases: [
      {
        title: "Foundations",
        weeks: 4,
        skills: ["Excel / Google Sheets mastery", "SQL basics", "Descriptive statistics"],
        books: ["SQL for Data Analysis – Cathy Tanimura"],
        playlists: ["Alex The Analyst – SQL for Beginners", "Luke Barousse – Excel for Data Analytics"],
        interview: ["Difference between WHERE and HAVING?", "What is a primary key vs foreign key?"]
      },
      {
        title: "Analysis & Visualization",
        weeks: 6,
        skills: ["Advanced SQL (joins, window functions)", "Python with pandas", "Tableau / Power BI"],
        books: ["Storytelling with Data – Cole Nussbaumer Knaflic"],
        playlists: ["Alex The Analyst – Power BI Course", "Keith Galli – Pandas Tutorial"],
        interview: ["Explain a window function use case", "How do you choose the right chart type?"]
      },
      {
        title: "Business & Statistics",
        weeks: 5,
        skills: ["A/B testing", "Cohort analysis", "Business metrics (LTV, CAC, churn)"],
        books: ["Trustworthy Online Controlled Experiments – Kohavi et al."],
        playlists: ["StatQuest – Hypothesis Testing", "365 Data Science – A/B Testing"],
        interview: ["Design an A/B test for a new checkout flow", "What's statistical significance, simply?"]
      },
      {
        title: "Portfolio Projects",
        weeks: 4,
        skills: ["End-to-end analysis case study", "Dashboard building", "Presenting insights"],
        books: ["The Big Book of Dashboards"],
        playlists: ["Luke Barousse – Real World Data Analyst Project"],
        interview: ["Walk me through a project end to end", "How did you validate your findings?"]
      },
      {
        title: "Interview Prep",
        weeks: 3,
        skills: ["Case studies", "SQL whiteboarding", "Behavioral rounds"],
        books: ["Ace the Data Science Interview (analyst chapters)"],
        playlists: ["Data Interview Pro – Case Study Practice"],
        interview: ["Revenue dropped 10% last month — how do you investigate?"]
      }
    ]
  },
  "backend-dev": {
    label: "Backend Developer",
    blurb: "Design and build the systems that power applications.",
    phases: [
      {
        title: "Foundations",
        weeks: 6,
        skills: ["A core language (Python/Java/Go)", "Git & CLI fluency", "HTTP & REST basics"],
        books: ["Clean Code – Robert C. Martin"],
        playlists: ["freeCodeCamp – Backend Development Course"],
        interview: ["Explain REST principles", "GET vs POST vs PUT vs PATCH"]
      },
      {
        title: "Databases & APIs",
        weeks: 7,
        skills: ["SQL & NoSQL databases", "API design", "Authentication (JWT/OAuth)"],
        books: ["Designing Data-Intensive Applications – Martin Kleppmann"],
        playlists: ["Hussein Nasser – Backend Engineering", "Traversy Media – Node/Express APIs"],
        interview: ["SQL vs NoSQL — when to use which?", "Explain how JWT authentication works"]
      },
      {
        title: "System Design",
        weeks: 8,
        skills: ["Caching, queues, load balancing", "Microservices basics", "Scalability patterns"],
        books: ["System Design Interview Vol 1 & 2 – Alex Xu"],
        playlists: ["Gaurav Sen – System Design", "ByteByteGo – System Design Animations"],
        interview: ["Design a URL shortener", "How would you scale a read-heavy API?"]
      },
      {
        title: "Projects & DevOps",
        weeks: 5,
        skills: ["CI/CD basics", "Docker & deployment", "Testing & monitoring"],
        books: ["The Docker Book – James Turnbull"],
        playlists: ["TechWorld with Nana – Docker & CI/CD"],
        interview: ["Walk through your deployment pipeline for a project"]
      },
      {
        title: "Interview Prep",
        weeks: 5,
        skills: ["DSA practice", "System design mocks", "Behavioral rounds"],
        books: ["Cracking the Coding Interview – Gayle Laakmann McDowell"],
        playlists: ["NeetCode – DSA Patterns"],
        interview: ["Solve: detect a cycle in a linked list", "Design a rate limiter"]
      }
    ]
  }
};

// ---------- Data: full catalogue of fields, grouped ----------

const FIELD_CATALOGUE = {
  "Engineering & Technology": [
    "ML Engineer", "Data Analyst", "Backend Developer", "Frontend Developer",
    "Full-Stack Developer", "DevOps Engineer", "Cybersecurity Analyst",
    "Cloud Architect", "Mobile App Developer", "Data Engineer",
    "Robotics Engineer", "Embedded Systems Engineer", "Civil Engineer",
    "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer",
    "Aerospace Engineer", "Biomedical Engineer"
  ],
  "Data & AI": [
    "Data Scientist", "AI Research Scientist", "NLP Engineer",
    "Computer Vision Engineer", "MLOps Engineer", "Quantitative Analyst"
  ],
  "Medicine & Health Sciences": [
    "Medical Doctor (MBBS/MD)", "Nursing", "Pharmacist", "Dentist",
    "Physiotherapist", "Public Health Specialist", "Clinical Psychologist",
    "Biotechnologist", "Veterinarian"
  ],
  "Business & Management": [
    "Product Manager", "Business Analyst", "Investment Banker",
    "Chartered Accountant", "Marketing Manager", "HR Manager",
    "Supply Chain Manager", "Entrepreneur / Startup Founder", "Consultant"
  ],
  "Law & Governance": [
    "Lawyer (Corporate)", "Civil Services (UPSC/Govt.)", "Judge / Judiciary",
    "Policy Analyst", "Diplomat / Foreign Service"
  ],
  "Design & Creative Arts": [
    "UI/UX Designer", "Graphic Designer", "Architect", "Film Director",
    "Animator", "Fashion Designer", "Game Designer", "Photographer"
  ],
  "Science & Research": [
    "Physicist", "Chemist", "Biologist / Researcher", "Astronomer",
    "Environmental Scientist", "Mathematician"
  ],
  "Education & Social Sciences": [
    "Teacher / Professor", "Economist", "Journalist", "Social Worker",
    "Psychologist (Counseling)"
  ],
  "Sports & Other": [
    "Sports Coach / Analyst", "Pilot (Commercial Aviation)", "Chef / Culinary Arts"
  ]
};

const ALL_FIELDS = Object.values(FIELD_CATALOGUE).flat();

// ---------- Backend call: real AI roadmap generation ----------
// Backend URL — change if you deploy the backend somewhere else.
const API_BASE = "http://localhost:5050";

async function fetchAIRoadmap({ fieldName, level, hours }) {
  const res = await fetch(`${API_BASE}/api/roadmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldName, level, hours }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate roadmap.");
  }
  const data = await res.json();
  return data.phases;
}

// Calls the backend to get a fresh, differently-worded batch of
// interview questions for a given phase — used by the "New questions" button.
async function fetchFreshQuestions({ fieldName, phaseTitle }) {
  const res = await fetch(`${API_BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldName, phaseTitle }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate questions.");
  }
  const data = await res.json();
  return data.questions;
}

// Builds a direct, clickable link for a book or playlist title.
// Books -> Google Books search. Playlists -> YouTube search.
// This always works even without a real curated URL on file.
function bookLink(title) {
  return `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(title)}`;
}
function playlistLink(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
}

// ---------- Helpers ----------

const LEVELS = ["Just starting", "Some basics", "Comfortable, want depth"];
const HOURS = ["5 hrs/wk", "10 hrs/wk", "20+ hrs/wk"];

function speedFactor(level, hours) {
  let f = 1;
  if (level === "Some basics") f -= 0.15;
  if (level === "Comfortable, want depth") f -= 0.3;
  if (hours === "10 hrs/wk") f -= 0.15;
  if (hours === "20+ hrs/wk") f -= 0.3;
  return Math.max(f, 0.45);
}

// ---------- Main component ----------

export default function Navexora() {
  const [step, setStep] = useState("select");
  const [query, setQuery] = useState("");
  const [fieldName, setFieldName] = useState(null);
  const [pathKey, setPathKey] = useState(null);
  const [level, setLevel] = useState(null);
  const [hours, setHours] = useState(null);
  const [done, setDone] = useState({});
  const [openPhase, setOpenPhase] = useState(0);
  const [aiPhases, setAiPhases] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [customQuestions, setCustomQuestions] = useState({}); // { [phaseIndex]: [questions] }
  const [questionLoading, setQuestionLoading] = useState({}); // { [phaseIndex]: boolean }

  const curated = pathKey ? PATHS[pathKey] : null;
  const label = curated ? curated.label : fieldName;

  const filteredResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return ALL_FIELDS.filter((f) => f.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  const selectField = (name) => {
    const curatedKey = Object.keys(PATHS).find(
      (k) => PATHS[k].label.toLowerCase() === name.toLowerCase()
    );
    setPathKey(curatedKey || null);
    setFieldName(name);
    setAiPhases(null);
    setGenError(null);
    setStep("profile");
  };

  // Curated fields use the hand-written data instantly.
  // Any other field calls the backend, which calls Claude to generate
  // a real, field-specific roadmap on the spot.
  const generateRoadmap = async () => {
    if (curated) {
      setStep("roadmap");
      return;
    }
    setIsGenerating(true);
    setGenError(null);
    try {
      const phases = await fetchAIRoadmap({ fieldName, level, hours });
      setAiPhases(phases);
      setStep("roadmap");
    } catch (err) {
      setGenError(err.message || "Something went wrong generating your roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const basePhases = curated ? curated.phases : aiPhases || [];

  const adjustedPhases = useMemo(() => {
    const f = speedFactor(level, hours);
    return basePhases.map((p) => ({ ...p, weeks: Math.max(1, Math.round(p.weeks * f)) }));
  }, [basePhases, level, hours]);

  const totalWeeks = adjustedPhases.reduce((a, p) => a + p.weeks, 0);
  const totalSkills = adjustedPhases.reduce((a, p) => a + p.skills.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = totalSkills ? Math.round((doneCount / totalSkills) * 100) : 0;

  const toggleSkill = (pi, si) => {
    const key = `${pi}-${si}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
  };

  // Asks the AI for a fresh batch of differently-worded interview
  // questions for one phase, replacing what's shown for that phase only.
  const regenerateQuestions = async (pi, phaseTitle) => {
    setQuestionLoading((q) => ({ ...q, [pi]: true }));
    try {
      const questions = await fetchFreshQuestions({ fieldName: label, phaseTitle });
      setCustomQuestions((c) => ({ ...c, [pi]: questions }));
    } catch (err) {
      setGenError(err.message || "Couldn't generate new questions.");
    } finally {
      setQuestionLoading((q) => ({ ...q, [pi]: false }));
    }
  };

  const reset = () => {
    setStep("select");
    setPathKey(null);
    setFieldName(null);
    setQuery("");
    setLevel(null);
    setHours(null);
    setDone({});
    setOpenPhase(0);
    setAiPhases(null);
    setGenError(null);
    setCustomQuestions({});
    setQuestionLoading({});
  };

  // ---------- Screen 1: Select a field ----------


  if (step === "select") {
    return (
      <div className="pf-app">
        <div className="pf-container">
          <div className="pf-header">
            <div className="pf-logo">
              <Compass size={20} />
            </div>
            <h1 className="pf-title">Navexora</h1>
          </div>
          <p className="pf-subtitle">
            Search any field taught at institutes worldwide, or browse by category.
          </p>

          <div className="pf-search-wrap">
            <Search size={18} className="pf-search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a field e.g. 'Mechanical Engineer', 'Lawyer', 'UX Designer'..."
              className="pf-search-input"
            />
            {query && (
              <button onClick={() => setQuery("")} className="pf-search-clear">
                <X size={16} />
              </button>
            )}
          </div>

          {filteredResults && (
            <div className="pf-results">
              {filteredResults.length === 0 && (
                <div className="pf-no-match">
                  <p>
                    No exact match — Navexora will still generate a roadmap for "{query}".
                  </p>
                  <button
                    className="pf-link-button"
                    onClick={() => selectField(query.trim())}
                  >
                    <Sparkles size={14} /> Generate roadmap for "{query.trim()}"{" "}
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
              {filteredResults.map((f) => (
                <button key={f} onClick={() => selectField(f)} className="pf-result-row">
                  <span>{f}</span>
                  {Object.values(PATHS).some((p) => p.label === f) && (
                    <span className="pf-tag-curated">curated</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!filteredResults &&
            Object.entries(FIELD_CATALOGUE).map(([category, fields]) => (
              <div key={category} className="pf-category-block">
                <p className="pf-category-label">{category}</p>
                <div className="pf-pill-row">
                  {fields.map((f) => (
                    <button key={f} onClick={() => selectField(f)} className="pf-pill">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ))}

          <div className="pf-note-box">
            <p>
              {Object.values(PATHS).length} field(s) currently ship with hand-curated books,
              playlists, and interview banks (marked "curated"). Every other field —{" "}
              {ALL_FIELDS.length - Object.values(PATHS).length}+ and counting — gets an
              AI-generated roadmap built on the spot from the same structure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Screen 2: Profile questions ----------

  if (step === "profile") {
    return (
      <div className="pf-app pf-center">
        <div className="pf-container-sm">
          <button onClick={() => setStep("select")} className="pf-back-link">
            ← back
          </button>
          <h2 className="pf-goal-heading">
            Goal: <span className="pf-goal-name">{label}</span>
          </h2>
          <p className="pf-helper-text">A couple of quick questions so the roadmap fits you.</p>

          <div className="pf-field-block">
            <p className="pf-field-label">Current level</p>
            <div className="pf-option-list">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`pf-option ${level === l ? "pf-option-active" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="pf-field-block pf-field-block-last">
            <p className="pf-field-label">Time available</p>
            <div className="pf-option-row">
              {HOURS.map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`pf-option ${hours === h ? "pf-option-active" : ""}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!level || !hours || isGenerating}
            onClick={generateRoadmap}
            className="pf-primary-button"
          >
            <Sparkles size={18} />
            {isGenerating ? "Generating with AI..." : "Generate my roadmap"}
            {!isGenerating && <ArrowRight size={16} />}
          </button>

          {!curated && (
            <p className="pf-helper-text" style={{ marginTop: "10px", fontSize: "12px" }}>
              No curated data exists for "{label}" yet — this will call Claude live to build a
              fresh roadmap.
            </p>
          )}

          {genError && (
            <p className="pf-progress-hint" style={{ marginTop: "10px" }}>
              {genError} — make sure the backend server is running on localhost:5050.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---------- Screen 3: Roadmap ----------

  return (
    <div className="pf-app">
      <div className="pf-container">
        <div className="pf-roadmap-top">
          <div>
            <p className="pf-roadmap-tag">
              <Brain size={16} /> AI-generated roadmap
            </p>
            <h2 className="pf-roadmap-heading">
              {label} in ~{totalWeeks} weeks
            </h2>
            <p className="pf-roadmap-meta">
              Level: {level} · {hours}
            </p>
          </div>
          <button onClick={reset} className="pf-reset-button">
            <RotateCcw size={14} /> Start over
          </button>
        </div>

        <div className="pf-progress-card">
          <div className="pf-progress-row">
            <span className="pf-progress-label">Overall progress</span>
            <span className="pf-progress-pct">{pct}%</span>
          </div>
          <div className="pf-progress-track">
            <div className="pf-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {pct > 0 && pct < 40 && (
            <p className="pf-progress-hint">
              Behind pace? Increase weekly hours in "Start over" and the plan recompresses
              automatically.
            </p>
          )}
        </div>

        <div className="pf-phase-list">
          {adjustedPhases.map((phase, pi) => {
            const isOpen = openPhase === pi;
            const phaseDone = phase.skills.filter((_, si) => done[`${pi}-${si}`]).length;
            return (
              <div key={pi} className="pf-phase-card">
                <button
                  onClick={() => setOpenPhase(isOpen ? -1 : pi)}
                  className="pf-phase-header"
                >
                  <div className="pf-phase-header-left">
                    <div
                      className={`pf-phase-number ${
                        phaseDone === phase.skills.length ? "pf-phase-complete" : ""
                      }`}
                    >
                      {pi + 1}
                    </div>
                    <div>
                      <div className="pf-phase-title">{phase.title}</div>
                      <div className="pf-phase-sub">
                        <Clock size={12} /> {phase.weeks} wks · {phaseDone}/
                        {phase.skills.length} skills done
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`pf-phase-chevron ${isOpen ? "pf-phase-open" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="pf-phase-body">
                    <p className="pf-skills-label">Skills to learn</p>
                    <div className="pf-skill-list">
                      {phase.skills.map((s, si) => {
                        const key = `${pi}-${si}`;
                        const isDone = !!done[key];
                        return (
                          <button
                            key={si}
                            onClick={() => toggleSkill(pi, si)}
                            className="pf-skill-row"
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} className="pf-skill-icon pf-skill-done" />
                            ) : (
                              <Circle size={16} className="pf-skill-icon" />
                            )}
                            <span className={`pf-skill-text ${isDone ? "pf-skill-done" : ""}`}>
                              {s}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pf-resource-grid">
                      <div>
                        <p className="pf-resource-col-label">
                          <BookOpen size={13} /> Books
                        </p>
                        <ul className="pf-resource-list">
                          {phase.books.map((b, i) => (
                            <li key={i}>
                              <a href={bookLink(b)} target="_blank" rel="noopener noreferrer" className="pf-resource-link">
                                {b}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="pf-resource-col-label">
                          <PlayCircle size={13} /> Playlists
                        </p>
                        <ul className="pf-resource-list">
                          {phase.playlists.map((b, i) => (
                            <li key={i}>
                              <a href={playlistLink(b)} target="_blank" rel="noopener noreferrer" className="pf-resource-link">
                                {b}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="pf-questions-header">
                          <p className="pf-resource-col-label" style={{ marginBottom: 0 }}>
                            <MessageSquareText size={13} /> Interview Qs
                          </p>
                          <button
                            className="pf-refresh-questions"
                            disabled={!!questionLoading[pi]}
                            onClick={() => regenerateQuestions(pi, phase.title)}
                            title="Generate different questions with AI"
                          >
                            <RotateCcw size={12} />
                            {questionLoading[pi] ? "..." : "New"}
                          </button>
                        </div>
                        <ul className="pf-resource-list">
                          {(customQuestions[pi] || phase.interview).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
