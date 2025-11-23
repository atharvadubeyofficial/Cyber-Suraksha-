import React from "react";
import { useState } from "react";
import {
  Button
} from "../components/button";
import {
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function SocialEngineeringSimulation({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);

  const scenarios = [
    {
      id: 1,
      icon: Phone,
      title: "Urgent IT Support Call",
      content:
        "Caller: 'This is Raj from IT. We detected suspicious activity. Tell me your employee ID and password.'",
      redFlags: [
        "IT NEVER asks for passwords",
        "Urgency pressure",
        "Requests credentials",
        "Caller ID spoof possible"
      ],
      correctAction: "refuse",
    },
    {
      id: 2,
      icon: Mail,
      title: "CEO Urgent Transfer Email",
      content:
        "Email pretending to be CEO requesting immediate transfer of ₹15,00,000 to external account.",
      redFlags: [
        "Suspicious domain",
        "Unusual urgency",
        "Bypassing protocols",
        "High-value transfer"
      ],
      correctAction: "verify",
    },
    {
      id: 3,
      icon: MessageSquare,
      title: "Vendor Bank Change Scam",
      content:
        "WhatsApp message claiming vendor bank details changed. Urgent payment requested.",
      redFlags: [
        "Unknown number",
        "Bank change without notice",
        "WhatsApp used unprofessionally",
        "Attachment may be malware"
      ],
      correctAction: "verify",
    },
    {
      id: 4,
      icon: Phone,
      title: "Fake ISP Technician",
      content:
        "Security calls: 'ISP guy here needs server room access urgently.'",
      redFlags: [
        "No scheduled visit",
        "Unverified technician",
        "Urgent access request",
        "Uniform can be faked"
      ],
      correctAction: "refuse",
    },
  ];

  const scenario = scenarios[current];
  const Icon = scenario.icon;

  const handleAnswer = (action) => {
    const correct = action === scenario.correctAction;

    setAnswers((p) => ({
      ...p,
      [scenario.id]: { correct, action }
    }));

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (current < scenarios.length - 1) {
      setCurrent(current + 1);
      setShowFeedback(false);
    } else {
      const score = calculateScore();
      onComplete(score, score >= 75, answers);
    }
  };

  const calculateScore = () => {
    const correct = Object.values(answers).filter((a) => a.correct).length;
    return Math.round((correct / scenarios.length) * 100);
  };

  return (
    <div className="space-y-6 fade-in">

      <div className="glass p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Engineering Detection</h2>
        <p className="text-gray-600">
          Scenario {current + 1} of {scenarios.length}
        </p>
      </div>

      {/* SCENARIO CARD */}
      <div className="glass p-8 rounded-xl shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <Icon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{scenario.title}</h3>
        </div>

        <p className="text-gray-800 whitespace-pre-wrap mb-6">{scenario.content}</p>

        {!showFeedback && (
          <div className="space-y-3">
            <Button
              onClick={() => handleAnswer("comply")}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white"
            >
              Comply Immediately
            </Button>

            <Button
              onClick={() => handleAnswer("verify")}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white"
            >
              Verify Through Official Channels
            </Button>

            <Button
              onClick={() => handleAnswer("refuse")}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refuse & Report
            </Button>
          </div>
        )}
      </div>

      {/* FEEDBACK */}
      {showFeedback && (
        <div className="glass p-8 rounded-xl shadow-lg fade-in">
          <div className="flex items-start space-x-4">

            {answers[scenario.id].correct ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}

            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">
                {answers[scenario.id].correct ? "Correct Response!" : "Not the Best Response"}
              </h3>

              {/* Red Flags */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-900 mb-2">Red Flags:</h4>
                <ul className="space-y-2">
                  {scenario.redFlags.map((flag, i) => (
                    <li key={i} className="text-sm text-red-800 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2" /> {flag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Correct Action Explanation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-900 mb-2">Correct Action:</h4>
                <p className="text-sm text-green-800">
                  {scenario.correctAction === "verify"
                    ? "Always verify through official channels before acting."
                    : "Refuse the request and report immediately. Never share credentials."}
                </p>
              </div>

              {/* Extra Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Protection Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always verify identity independently</li>
                  <li>• Be skeptical of urgency</li>
                  <li>• Never share credentials</li>
                  <li>• Follow official protocols</li>
                </ul>
              </div>

              <Button
                onClick={handleNext}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                {current < scenarios.length - 1 ? "Next Scenario →" : "Complete Simulation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* IMPACT SECTION */}
      <div className="glass p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Real-World Impact of Social Engineering
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <ImpactCard
            title="Financial Fraud"
            description="CEO fraud causes ₹20+ crore losses every year."
            severity="high"
          />
          <ImpactCard
            title="Data Breaches"
            description="98% of cyberattacks use social engineering."
            severity="high"
          />
          <ImpactCard
            title="Unauthorized Access"
            description="Impersonation leads to physical & digital breaches."
            severity="medium"
          />
        </div>
      </div>

    </div>
  );
}

/* IMPACT CARD COMPONENT */
function ImpactCard({ title, description, severity }) {
  const colors = {
    high: "bg-red-50 border-red-200 text-red-900",
    medium: "bg-orange-50 border-orange-200 text-orange-900",
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  );
            }
