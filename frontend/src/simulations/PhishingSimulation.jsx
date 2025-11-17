import { useState } from 'react';
import { Button } from '../components/ui/button';
import { AlertTriangle, CheckCircle, Mail, ExternalLink, Paperclip } from 'lucide-react';

export default function PhishingSimulation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  const phishingEmails = [
    {
      id: 1,
      from: 'security@paypa1-verify.com',
      subject: 'URGENT: Your Account Will Be Suspended',
      body: `Dear valued customer,

We have detected unusual activity on your PayPal account. To prevent suspension, please verify your identity immediately by clicking the link below:

http://paypa1-verify.com/secure-login

You have 24 hours to complete this verification or your account will be permanently suspended.

Best regards,
PayPal Security Team`,
      isPhishing: true,
      redFlags: [
        'Suspicious sender domain (paypa1 instead of paypal)',
        'Creates urgency and fear',
        'Suspicious URL',
        'Threatening account suspension'
      ]
    },
    {
      id: 2,
      from: 'hr@yourcompany.com',
      subject: 'Updated Employee Handbook',
      body: `Hi Team,

Please find attached the updated employee handbook for 2024. All employees are required to review this document.

If you have any questions, please contact HR department.

Thank you,
Human Resources`,
      isPhishing: false,
      explanation: 'This email appears legitimate with proper company domain and professional tone.'
    },
    {
      id: 3,
      from: 'support@bankofamerica-secure.net',
      subject: 'Confirm Your Banking Details',
      body: `Dear Customer,

Due to recent security updates, we need you to confirm your banking details. Please click here and enter your:
- Account Number
- ATM PIN
- Social Security Number

This is mandatory to keep your account active.

Bank of America Security`,
      isPhishing: true,
      redFlags: [
        'Asks for sensitive information (PIN, SSN)',
        'Wrong domain (.net instead of .com)',
        'Banks never ask for PIN via email',
        'Generic greeting'
      ]
    }
  ];

  const handleAnswer = (isPhishing) => {
    const email = phishingEmails[currentStep];
    const correct = email.isPhishing === isPhishing;

    setAnswers(prev => ({
      ...prev,
      [email.id]: { correct, userAnswer: isPhishing }
    }));

    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentStep < phishingEmails.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowExplanation(false);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    const correctAnswers = Object.values(answers).filter(a => a.correct).length;
    const score = Math.round((correctAnswers / phishingEmails.length) * 100);
    const passed = score >= 70;
    onComplete(score, passed, answers);
  };

  const email = phishingEmails[currentStep];

  return (
    <div className="space-y-6 fade-in">

      <div className="glass p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Phishing Detection Simulation</h2>
          <span className="text-sm text-gray-600">
            Email {currentStep + 1} of {phishingEmails.length}
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Examine the email below carefully. Is this a phishing attempt or a legitimate email?
        </p>
      </div>

      {/* Email Display */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Email Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">{email.subject}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">From:</span>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">{email.from}</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {email.body}
          </div>
          {email.isPhishing && (
            <div className="mt-4 flex items-center space-x-2 text-blue-600">
              <Paperclip className="w-4 h-4" />
              <span className="text-sm">Click here to verify</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Answer Section */}
      {!showExplanation ? (
        <div className="glass p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Assessment:</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              data-testid="phishing-btn"
              onClick={() => handleAnswer(true)}
              className="h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-medium"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              This is Phishing
            </Button>
            <Button
              data-testid="legitimate-btn"
              onClick={() => handleAnswer(false)}
              className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-medium"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              This is Legitimate
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass p-6 rounded-xl shadow-lg fade-in">
          <div className="flex items-start space-x-4">
            {answers[email.id].correct ? (
              <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
            )}

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {answers[email.id].correct ? 'Correct!' : 'Incorrect'}
              </h3>

              <p className="text-gray-700 mb-4">
                This email is <strong>{email.isPhishing ? 'a PHISHING attempt' : 'LEGITIMATE'}</strong>.
              </p>

              {email.isPhishing && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-900 mb-2">Red Flags Detected:</h4>
                  <ul className="space-y-1">
                    {email.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-800 flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!email.isPhishing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">{email.explanation}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Protection Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always verify sender's email address carefully</li>
                  <li>• Hover over links before clicking to see actual URL</li>
                  <li>• Never share passwords, PINs, or SSN via email</li>
                  <li>• Contact the company directly if unsure</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            data-testid="next-btn"
            onClick={handleNext}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            {currentStep < phishingEmails.length - 1 ? 'Next Email →' : 'Complete Simulation'}
          </Button>
        </div>
      )}

      {/* Impact Visualization */}
      <div className="glass p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-World Impact of Phishing:</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <ImpactCard
            title="Data Breach"
            description="Customer data, passwords, and financial information stolen"
            severity="high"
          />
          <ImpactCard
            title="Financial Loss"
            description="Average cost: ₹12-15 lakhs for MSMEs"
            severity="high"
          />
          <ImpactCard
            title="Reputation Damage"
            description="Loss of customer trust and business credibility"
            severity="medium"
          />
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ title, description, severity }) {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-orange-50 border-orange-200 text-orange-900',
    low: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  );
              }
