import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Key } from 'lucide-react';

export default function WeakPasswordSimulation({ onComplete }) {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [bruteForceTime, setBruteForceTime] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [step, setStep] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [showingCrack, setShowingCrack] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);

  const analyzePassword = (pwd) => {
    setPassword(pwd);
    let score = 0;
    let feedbackItems = [];

    // Length check
    if (pwd.length >= 12) {
      score += 25;
      feedbackItems.push({ text: 'Good length (12+ characters)', positive: true });
    } else if (pwd.length >= 8) {
      score += 15;
      feedbackItems.push({ text: 'Length acceptable (8+ characters)', positive: false });
    } else {
      feedbackItems.push({ text: 'Too short (less than 8 characters)', positive: false });
    }

    // Character variety
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
      score += 25;
      feedbackItems.push({ text: 'Mixed case letters', positive: true });
    }
    if (/[0-9]/.test(pwd)) {
      score += 20;
      feedbackItems.push({ text: 'Contains numbers', positive: true });
    }
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      score += 30;
      feedbackItems.push({ text: 'Contains special characters', positive: true });
    }

    // Common patterns
    if (/^(password|123456|qwerty|admin)/i.test(pwd)) {
      score -= 30;
      feedbackItems.push({ text: 'Contains common password pattern', positive: false });
    }

    setStrength(Math.max(0, Math.min(100, score)));
    setFeedback(feedbackItems);

    calculateBruteForceTime(pwd, score);
  };

  const calculateBruteForceTime = (pwd, score) => {
    if (pwd.length === 0) {
      setBruteForceTime('');
      return;
    }

    let time;
    if (score < 40) time = 'Less than 1 minute';
    else if (score < 60) time = '1-30 minutes';
    else if (score < 80) time = '1-6 hours';
    else time = '1+ years';

    setBruteForceTime(time);
  };

  const handleTestPassword = () => {
    setAttempts(attempts + 1);
    if (strength >= 70) {
      setStep(2);
    } else {
      simulateBruteForce();
    }
  };

  const simulateBruteForce = () => {
    setShowingCrack(true);
    setCrackProgress(0);

    const interval = setInterval(() => {
      setCrackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowingCrack(false), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleComplete = () => {
    const score =
      attempts === 1 && strength >= 80
        ? 100
        : attempts === 1
        ? 80
        : 70;

    const passed = strength >= 70;
    onComplete(score, passed, { passwordStrength: strength, attempts });
  };

  if (step === 2) {
    return (
      <div className="space-y-6 fade-in">
        <div className="glass p-8 rounded-xl shadow-lg text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Strong Password Created!</h2>

          <p className="text-gray-600 mb-8 text-lg">
            Your password would take <strong>{bruteForceTime}</strong> to crack using brute force.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-green-900 mb-4">Password Best Practices:</h3>
            <ul className="space-y-2">
              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                Use unique passwords for each account
              </li>
              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                Enable Two-Factor Authentication (2FA)
              </li>
              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                Use a password manager
              </li>
            </ul>
          </div>

          <Button
            data-testid="complete-password-sim-btn"
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Complete Simulation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="glass p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Security Simulation</h2>
        <p className="text-gray-600 mb-4">
          Create a strong password and see how long it would take an attacker to crack it.
        </p>
      </div>

      <div className="glass p-8 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Enter Your Password</h3>
        </div>

        <Input
          data-testid="password-input"
          type="text"
          placeholder="Type your password..."
          value={password}
          onChange={(e) => analyzePassword(e.target.value)}
          className="h-14 text-lg mb-6"
        />

        {password && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                <span
                  className={`text-sm font-bold ${
                    strength >= 80
                      ? 'text-green-600'
                      : strength >= 60
                      ? 'text-blue-600'
                      : strength >= 40
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                >
                  {strength}%
                </span>
              </div>

              <Progress value={strength} className="h-3" />
              <div className="mt-2 text-sm text-gray-600">
                <strong>Estimated time to crack:</strong> {bruteForceTime}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Analysis:</h4>
              <div className="space-y-2">
                {feedback.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    {item.positive ? (
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${item.positive ? 'text-green-800' : 'text-red-800'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              data-testid="test-password-btn"
              onClick={handleTestPassword}
              disabled={strength === 0}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test This Password
            </Button>
          </>
        )}
      </div>

      {showingCrack && (
        <div className="glass p-8 rounded-xl shadow-lg fade-in border-2 border-red-500">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4 pulse" />
            <h3 className="text-2xl font-bold text-red-900 mb-4">Simulating Brute Force Attack...</h3>

            <Progress value={crackProgress} className="h-4 mb-4" />
            <p className="text-sm text-gray-600">{crackProgress}% Complete</p>

            {crackProgress === 100 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 font-semibold">Password Cracked! Try a stronger password.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactCard({ title, description, severity }) {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-orange-50 border-orange-200 text-orange-900',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  );
}

function TipCard({ icon, text }) {
  return (
    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
      {icon}
      <span className="text-sm text-gray-800">{text}</span>
    </div>
  );
    }
