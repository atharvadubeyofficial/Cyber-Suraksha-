import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/button";
import { Progress } from "../components/progress";
import {
  Shield,
  Mail,
  Key,
  Bug,
  Code,
  Lock as LockIcon,
  Users as UsersIcon,
  Award,
  Download,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

// VERCEL-FRIENDLY ENV FIX
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

const simulationTypes = [
  {
    id: "phishing",
    title: "Phishing Attack",
    description: "Learn to identify suspicious emails and prevent data breaches",
    icon: Mail,
    color: "text-red-600",
    bgColor: "bg-red-50",
    difficulty: "Beginner",
  },
  {
    id: "weak_password",
    title: "Weak Password Attack",
    description: "Understand password security and brute force attacks",
    icon: Key,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    difficulty: "Beginner",
  },
  {
    id: "malware",
    title: "Malware Scenario",
    description: "Recognize malicious software and protect your systems",
    icon: Bug,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    difficulty: "Intermediate",
  },
  {
    id: "sql_injection",
    title: "SQL Injection",
    description: "Learn how attackers exploit database vulnerabilities",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    difficulty: "Advanced",
  },
  {
    id: "ransomware",
    title: "Ransomware Attack",
    description: "Experience a ransomware scenario and learn prevention",
    icon: LockIcon,
    color: "text-red-700",
    bgColor: "bg-red-50",
    difficulty: "Advanced",
  },
  {
    id: "social_engineering",
    title: "Social Engineering",
    description: "Identify manipulation tactics used by attackers",
    icon: UsersIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    difficulty: "Intermediate",
  },
];

export default function Dashboard({ user }) {
  const [vulnerabilityScore, setVulnerabilityScore] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const [scoreRes, certRes] = await Promise.all([
        axios.get(`${API}/vulnerability-score/${user.id}`),
        axios.get(`${API}/certificate/${user.id}`),
      ]);
      setVulnerabilityScore(scoreRes.data);
      setCertificate(certRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulationClick = (type) => {
    navigate(`/simulator/${type}`);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(`${API}/report/${user.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `security_report_${user.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const response = await axios.post(`${API}/certificate/${user.id}`);
      setCertificate(response.data);
      toast.success("Congratulations! Certificate generated!");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to generate certificate"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CyberShield</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleDownloadReport}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Score Card */}
        <div className="glass p-8 rounded-2xl shadow-xl mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Security Score
              </h2>
              <p className="text-gray-600">Overall vulnerability assessment</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold gradient-text">
                {vulnerabilityScore?.overall_score || 0}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ScoreItem
              label="Phishing Detection"
              score={vulnerabilityScore?.phishing_score || 0}
              icon={<Mail className="w-5 h-5" />}
            />
            <ScoreItem
              label="Password Security"
              score={vulnerabilityScore?.password_score || 0}
              icon={<Key className="w-5 h-5" />}
            />
            <ScoreItem
              label="Malware Awareness"
              score={vulnerabilityScore?.malware_score || 0}
              icon={<Bug className="w-5 h-5" />}
            />
            <ScoreItem
              label="SQL Injection"
              score={vulnerabilityScore?.sql_injection_score || 0}
              icon={<Code className="w-5 h-5" />}
            />
            <ScoreItem
              label="Ransomware Defense"
              score={vulnerabilityScore?.ransomware_score || 0}
              icon={<LockIcon className="w-5 h-5" />}
            />
            <ScoreItem
              label="Social Engineering"
              score={vulnerabilityScore?.social_engineering_score || 0}
              icon={<UsersIcon className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Certificate Section */}
        {certificate && (
          <div className="glass p-6 rounded-2xl shadow-xl mb-8 fade-in border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Certified Cybersecurity Professional
                  </h3>
                  <p className="text-gray-600">
                    Certificate #{certificate.certificate_number}
                  </p>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
        )}

        {/* Certificate button */}
        {!certificate && user?.completed_simulations?.length === 6 && (
          <div className="glass p-6 rounded-2xl shadow-xl mb-8 fade-in text-center">
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h3>
            <p className="text-gray-600 mb-4">
              You've completed all simulations. Generate your certificate!
            </p>
            <Button
              onClick={handleGenerateCertificate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Certificate
            </Button>
          </div>
        )}

        {/* Simulation Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Attack Simulations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulationTypes.map((sim, index) => {
              const Icon = sim.icon;
              const completed = user?.completed_simulations?.includes(sim.id);

              return (
                <div
                  key={sim.id}
                  className="glass p-6 rounded-xl card-hover fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${sim.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${sim.color}`} />
                    </div>
                    {completed && (
                      <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Completed
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sim.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {sim.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {sim.difficulty}
                    </span>
                    <Button
                      onClick={() => handleSimulationClick(sim.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {completed ? "Retry" : "Start"} →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function ScoreItem({ label, score, icon }) {
  const getColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-lg font-bold ${getColor(score)}`}>
          {score}
        </span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
  }
