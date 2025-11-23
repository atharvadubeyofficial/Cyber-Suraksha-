import { useState } from 'react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { AlertTriangle, Database, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function SqlInjectionSimulation({ onComplete }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [showInjection, setShowInjection] = useState(false);
  const [injectionSuccess, setInjectionSuccess] = useState(false);
  const [showingData, setShowingData] = useState(false);
  const [step, setStep] = useState(1);

  const handleLogin = () => {
    setAttempt(attempt + 1);

    const sqlPatterns = [
      "' OR '1'='1",
      "' OR 1=1--",
      "admin'--",
      "' OR 'a'='a",
      "1' OR '1'='1"
    ];

    const isInjection = sqlPatterns.some(pattern =>
      username.includes(pattern) || password.includes(pattern)
    );

    if (isInjection) {
      setShowInjection(true);
      setInjectionSuccess(true);
      setTimeout(() => setShowingData(true), 2000);
    } else {
      setShowInjection(true);
      setInjectionSuccess(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
      setUsername('');
      setPassword('');
      setShowInjection(false);
      setInjectionSuccess(false);
      setShowingData(false);
    } else {
      const score = attempt === 1 && injectionSuccess ? 100 : injectionSuccess ? 85 : 70;
      const passed = injectionSuccess;
      onComplete(score, passed, { attempts: attempt, exploited: injectionSuccess });
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-6 fade-in">
        <div className="glass p-8 rounded-xl shadow-lg text-center">
          <Shield className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">SQL Injection Prevention</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg">How SQL Injection Works:</h3>

            <div className="space-y-3 text-blue-800">
              <p className="text-sm leading-relaxed">
                SQL injection exploits vulnerabilities in database queries. Attackers insert malicious SQL code 
                into input fields to manipulate database operations.
              </p>

              <div className="bg-white rounded-lg p-4 font-mono text-xs">
                <p className="text-gray-600 mb-2">Vulnerable query:</p>
                <p className="text-red-600">SELECT * FROM users WHERE username = '{username}'</p>

                <p className="text-gray-600 mt-3 mb-2">Attacker input:</p>
                <p className="text-red-600">admin' OR '1'='1</p>

                <p className="text-gray-600 mt-3 mb-2">Resulting query:</p>
                <p className="text-red-600">SELECT * FROM users WHERE username = 'admin' OR '1'='1'</p>

                <p className="text-orange-600 mt-2">This always returns true — authentication bypassed!</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-green-900 mb-4 text-lg">Protection Measures:</h3>

            <ul className="space-y-3">
              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <strong>Use Prepared Statements</strong>
                  <p className="text-sm mt-1">Separate SQL code from data using parameterized queries</p>
                </div>
              </li>

              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <strong>Input Validation</strong>
                  <p className="text-sm mt-1">Validate and sanitize all user inputs</p>
                </div>
              </li>

              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <strong>Least Privilege</strong>
                  <p className="text-sm mt-1">Database account should have minimum permissions</p>
                </div>
              </li>

              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <strong>Web Application Firewall (WAF)</strong>
                  <p className="text-sm mt-1">Filter malicious input before it reaches the database</p>
                </div>
              </li>

              <li className="flex items-start text-green-800">
                <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <strong>Regular Security Audits</strong>
                  <p className="text-sm mt-1">Test applications for SQLi vulnerabilities</p>
                </div>
              </li>
            </ul>
          </div>

          <Button
            data-testid="complete-sql-sim-btn"
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Complete Simulation
          </Button>
        </div>

        {/* Impact */}
        <div className="glass p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Real-World Impact of SQL Injection:
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <ImpactCard
              title="Data Breach"
              description="Complete database exposure: passwords, customer info, financial records"
              severity="high"
            />

            <ImpactCard
              title="Data Manipulation"
              description="Attackers can modify, delete, or corrupt critical data"
              severity="high"
            />

            <ImpactCard
              title="Compliance Violations"
              description="GDPR/PCI-DSS violations leading to heavy fines"
              severity="high"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">

      <div className="glass p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SQL Injection Attack Simulation</h2>
        <p className="text-gray-600 mb-2">
          This is a vulnerable login form. Try bypassing authentication using SQL injection.
        </p>

        <p className="text-sm text-orange-600 font-medium">
          Hint: Try using SQL operators like OR, --, or quotes (')
        </p>
      </div>

      {/* Vulnerable Login Form */}
      <div className="glass p-8 rounded-xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border-2 border-gray-300 p-8">

            <div className="flex items-center justify-center mb-6">
              <Database className="w-12 h-12 text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Admin Portal Login
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>

                <Input
                  data-testid="sql-username-input"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <Input
                  data-testid="sql-password-input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                data-testid="sql-login-btn"
                onClick={handleLogin}
                disabled={!username || !password}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Login
              </Button>
            </div>

            {/* Show underlying query */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">Underlying SQL Query:</p>

              <div className="font-mono text-xs bg-gray-800 text-green-400 p-3 rounded">
                SELECT * FROM admins<br />
                WHERE username = '{username || "..."}' <br />
                AND password = '{password || "..."}';
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {showInjection && (
        <div
          className={`glass p-8 rounded-xl shadow-lg fade-in border-2 ${
            injectionSuccess ? "border-red-500" : "border-green-500"
          }`}
        >
          <div className="text-center">
            {injectionSuccess ? (
              <>
                <AlertTriangle className="w-20 h-20 text-red-600 mx-auto mb-6 pulse" />
                <h3 className="text-3xl font-bold text-red-900 mb-4">
                  SQL INJECTION SUCCESSFUL!
                </h3>

                <p className="text-gray-700 mb-6 text-lg">
                  Authentication bypassed — unauthorized admin access granted.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Login Failed
                </h3>

                <p className="text-gray-700 mb-6">
                  Your input didn’t exploit the vulnerability. Try SQL injection patterns.
                </p>
              </>
            )}

            {showingData && (
              <div className="bg-red-50 rounded-lg p-6 mb-6 text-left fade-in">
                <h4 className="font-semibold text-red-900 mb-4 text-center">
                  Exposed Database Records:
                </h4>

                <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Username</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Password Hash</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-200">
                        <td className="p-2">1</td>
                        <td className="p-2">admin</td>
                        <td className="p-2">admin@company.com</td>
                        <td className="p-2">5f4dcc3b5aa...</td>
                      </tr>

                      <tr className="border-b border-gray-200">
                        <td className="p-2">2</td>
                        <td className="p-2">john_doe</td>
                        <td className="p-2">john@company.com</td>
                        <td className="p-2">e99a18c428...</td>
                      </tr>

                      <tr>
                        <td className="p-2">3</td>
                        <td className="p-2">jane_smith</td>
                        <td className="p-2">jane@company.com</td>
                        <td className="p-2">8d969eef6e...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-red-800 mt-4 text-center">
                  All admin accounts & sensitive data exposed!
                </p>
              </div>
            )}

            <Button
              data-testid="sql-continue-btn"
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Continue →
            </Button>
          </div>
        </div>
      )}

      {/* SQLi Patterns */}
      <div className="glass p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Common SQL Injection Patterns:
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <code className="text-sm font-mono text-gray-800">admin' --</code>
            <p className="text-xs text-gray-600 mt-2">Comments out password check</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <code className="text-sm font-mono text-gray-800">' OR '1'='1</code>
            <p className="text-xs text-gray-600 mt-2">Always true statement</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <code className="text-sm font-mono text-gray-800">' OR 1=1--</code>
            <p className="text-xs text-gray-600 mt-2">Bypasses authentication</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <code className="text-sm font-mono text-gray-800">admin' OR 'a'='a</code>
            <p className="text-xs text-gray-600 mt-2">Alternative true condition</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ title, description, severity }) {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-900'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[severity]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  );
                }
