import { useState } from "react";
import { Button } from "../components/ui/button";
import { Lock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function RansomwareSimulation({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const steps = [
    {
      id: 1,
      icon: Lock,
      title: "Suspicious File Downloaded",
      description:
        "You receive an email containing an attached ZIP file claiming to be an invoice. The sender appears legitimate but the message feels slightly unusual.",
      options: {
        open: false,
        scan: true,
        delete: true,
      },
      best: "scan",
    },
    {
      id: 2,
      icon: AlertTriangle,
      title: "Malicious Script Executed",
      description:
        "A PowerShell script seems to be running in the background. Your screen lags for a second.",
      options: {
        ignore: false,
        disconnect: true,
        restart: false,
      },
      best: "disconnect",
    },
    {
      id: 3,
      icon: Lock,
      title: "Files Start Encrypting",
      description:
        "Your documents suddenly become inaccessible and turn into .LOCKED files. A red window appears demanding Bitcoin.",
      options: {
        pay: false,
        report: true,
        shutDown: true,
      },
      best: "report",
    },
  ];

  const handleChoice = (choice) => {
    setSelected(choice);

    const correct = choice === steps[step].best;
    setResult(correct);

    setTimeout(() => {
      if (step < steps.length - 1) {
        setSelected(null);
        setResult(null);
        setStep(step + 1);
      } else {
        const score = calculateFinalScore();
        onComplete(score, score >= 75);
      }
    }, 1500);
  };

  const calculateFinalScore = () => {
    const total = steps.length;
    let correct = 0;

    steps.forEach((s, i) => {
      if (selected === s.best) correct++;
    });

    return Math.round((correct / total) * 100);
  };

  const s = steps[step];
  const Icon = s.icon;

  return (
    <div className="space-y-6 fade-in">
      <div className="glass p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold">Ransomware Attack Simulation</h2>
        <p className="text-gray-600">Step {step + 1} of {steps.length}</p>
      </div>

      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <Icon className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-bold">{s.title}</h3>
        </div>

        <p className="text-gray-700 mb-6">{s.description}</p>

        <div className="space-y-3">
          {Object.keys(s.options).map((key) => (
            <Button
              key={key}
              onClick={() => handleChoice(key)}
              disabled={selected !== null}
              className={`w-full h-14 ${
                selected === key
                  ? result
                    ? "bg-green-600"
                    : "bg-red-600"
                  : "bg-gray-800"
              } text-white`}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
