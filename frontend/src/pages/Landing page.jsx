import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Shield, Lock, AlertTriangle, Eye, Database, Users } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please enter your name and email");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/users`, { name, email });
      setUser(response.data);
      localStorage.setItem("cyber_user", JSON.stringify(response.data));
      toast.success("Welcome! Starting your cybersecurity training...");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CyberShield</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Official MSME Cybersecurity Training Platform</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="fade-in">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span>Trusted by 10,000+ MSMEs</span>
                </div>

                <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Protect Your Business from
                  <span className="block gradient-text mt-2">
                    Cyber Threats
                  </span>
                </h2>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Interactive vulnerability simulator designed for MSMEs. Learn
                  to identify and defend against phishing, malware, ransomware,
                  and more — without the risk.
                </p>

                {/* Registration Form */}
                <div className="glass p-8 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Start Your Free Training
                  </h3>
                  <form onSubmit={handleStart} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Business Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg"
                    >
                      {loading ? "Starting..." : "Start Training →"}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    No credit card required • Complete in 30 minutes • Get
                    certified
                  </p>
                </div>
              </div>

              {/* Right Content */}
              <div className="fade-in">
                <div className="grid gap-6">
                  <FeatureCard
                    icon={<Lock className="w-6 h-6 text-blue-600" />}
                    title="6 Real-World Attack Scenarios"
                    description="Experience phishing, weak passwords, malware, SQL injection, ransomware, and social engineering attacks in a safe environment."
                  />
                  <FeatureCard
                    icon={<Eye className="w-6 h-6 text-blue-600" />}
                    title="Impact Visualization"
                    description="See exactly what happens when your business is breached. Understand the real cost of security vulnerabilities."
                  />
                  <FeatureCard
                    icon={<Database className="w-6 h-6 text-blue-600" />}
                    title="Actionable Recommendations"
                    description="Get practical security steps you can implement immediately."
                  />
                  <FeatureCard
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    title="AI Security Assistant"
                    description="24/7 AI-powered chatbot that explains cybersecurity in simple language."
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Stats */}
        <section className="relative z-10 px-6 py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <StatCard number="60%" label="MSMEs Attacked Annually" color="text-red-600" />
              <StatCard number="₹12L" label="Average Breach Cost" color="text-orange-600" />
              <StatCard number="30 min" label="Training Duration" color="text-blue-600" />
              <StatCard number="100%" label="Free & Certified" color="text-green-600" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass p-6 rounded-xl card-hover">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-50 p-3 rounded-lg shrink-0">{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label, color }) {
  return (
    <div className="fade-in">
      <div className={`text-4xl font-bold ${color} mb-2`}>{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
                            }
