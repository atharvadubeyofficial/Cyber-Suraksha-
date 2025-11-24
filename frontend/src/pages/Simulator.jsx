import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/button";
import { Progress } from "../components/progress";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import PhishingSimulation from "../simulations/PhishingSimulation";
import WeakPasswordSimulation from "../simulations/WeakPasswordSimulation";
import MalwareSimulation from "../simulations/MalwareSimulation";
import SqlInjectionSimulation from "../simulations/SqlInjectionSimulation";
import RansomwareSimulation from "../simulations/RansomwareSimulation";
import SocialEngineeringSimulation from "../simulations/SocialEngineeringSimulation";

// Vercel-compatible env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const simulationComponents = {
  phishing: PhishingSimulation,
  weak_password: WeakPasswordSimulation,
  malware: MalwareSimulation,
  sql_injection: SqlInjectionSimulation,
  ransomware: RansomwareSimulation,
  social_engineering: SocialEngineeringSimulation,
};

export default function Simulator({ user }) {
  const { type } = useParams();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleComplete = async (score, passed, answers) => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    try {
      await axios.post(`${API}/simulations`, {
        user_id: user.id,
        simulation_type: type,
        score,
        passed,
        duration_seconds: duration,
        answers,
      });

      setResults({ score, passed });
      setCompleted(true);

      passed
        ? toast.success("Simulation completed successfully!")
        : toast.warning("Simulation completed. Review recommendations.");
    } catch (error) {
      toast.error("Failed to save results");
    }
  };

  const handleBackToDashboard = () => navigate("/dashboard");

  if (!user) return null;

  const SimulationComponent = simulationComponents[type];

  /* Invalid Simulation Fallback */
  if (!SimulationComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Simulation Not Found
          </h2>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  /* Results Screen */
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="glass p-12 rounded-2xl shadow-xl text-center fade-in">
            {results.passed ? (
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            ) : (
              <XCircle className="w-20 h-20 text-orange-600 mx-auto mb-6" />
            )}

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {results.passed ? "Excellent Work!" : "Simulation Complete"}
            </h2>

            <div className="text-6xl font-bold gradient-text mb-6">
              {results.score}/100
            </div>

            <p className="text-gray-600 mb-8 text-lg">
              {results.passed
                ? "You demonstrated strong cybersecurity awareness!"
                : "Review the recommendations below to improve your security posture."}
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleBackToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setCompleted(false);
                  setStarted(false);
                  setResults(null);
                }}
              >
                Retry Simulation
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Pre-start Screen */
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Button
            onClick={handleBackToDashboard}
            variant="ghost"
            className="mb-8 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>

          <div className="glass p-12 rounded-2xl shadow-xl text-center fade-in">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start?
            </h2>

            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              This simulation will test your ability to identify and respond to
              a real-world cyber threat. Pay close attention to details and
              think critically about each scenario.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-sm text-orange-800">
                <strong>Important:</strong> This is a safe training environment.
                No real systems will be affected.
              </p>
            </div>

            <Button
              onClick={handleStart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Begin Simulation →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* Actual Simulation */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Button
          onClick={handleBackToDashboard}
          variant="ghost"
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Simulation</span>
        </Button>

        <SimulationComponent onComplete={handleComplete} />
      </div>
    </div>
  );
              }
