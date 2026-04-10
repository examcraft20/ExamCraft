"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Server, Globe, Shield } from "lucide-react";

type TestResult = {
  name: string;
  status: "pass" | "fail" | "warning" | "testing";
  message: string;
  icon: any;
};

export default function ConnectionTestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  useEffect(() => {
    runAllTests();
  }, []);

  async function runAllTests() {
    setIsRunning(true);
    setAllPassed(null);
    
    const testResults: TestResult[] = [];

    // Test 1: Check DEMO_MODE
    testResults.push({
      name: "Environment Mode",
      status: "testing",
      message: "Checking environment configuration...",
      icon: Database
    });
    setTests([...testResults]);

    await new Promise(resolve => setTimeout(resolve, 500));

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    testResults[0] = {
      name: "Environment Mode",
      status: isDemoMode ? "warning" : "pass",
      message: isDemoMode 
        ? "DEMO MODE: Using mock data (no database connection)" 
        : "DATABASE MODE: Using real database connection",
      icon: Database
    };
    setTests([...testResults]);

    // Test 2: Check Supabase URL
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    testResults.push({
      name: "Supabase URL",
      status: supabaseUrl ? "pass" : "fail",
      message: supabaseUrl || "NEXT_PUBLIC_SUPABASE_URL not configured",
      icon: Globe
    });
    setTests([...testResults]);

    // Test 3: Try to fetch from Supabase API
    await new Promise(resolve => setTimeout(resolve, 500));

    if (supabaseUrl && !isDemoMode) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "GET",
          headers: {
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
          }
        });

        testResults.push({
          name: "Supabase API Connection",
          status: response.ok || response.status === 404 ? "pass" : "warning",
          message: response.ok 
            ? "Successfully connected to Supabase API" 
            : `API responded with HTTP ${response.status} (server is running)`,
          icon: Server
        });
      } catch (error) {
        testResults.push({
          name: "Supabase API Connection",
          status: "fail",
          message: "Cannot reach Supabase API. Is the database running?",
          icon: Server
        });
      }
    } else if (isDemoMode) {
      testResults.push({
        name: "Supabase API Connection",
        status: "warning",
        message: "Skipped (Demo Mode active)",
        icon: Server
      });
    } else {
      testResults.push({
        name: "Supabase API Connection",
        status: "fail",
        message: "Supabase URL not configured",
        icon: Server
      });
    }
    setTests([...testResults]);

    // Test 4: Check Auth Service
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const authUrl = supabaseUrl.replace("54321", "9999");
      await fetch(`${authUrl}/health`, { method: "GET" });
      
      testResults.push({
        name: "Auth Service",
        status: "pass",
        message: "Authentication service is running",
        icon: Shield
      });
    } catch (error) {
      testResults.push({
        name: "Auth Service",
        status: isDemoMode ? "warning" : "fail",
        message: isDemoMode ? "Skipped (Demo Mode active)" : "Auth service not responding",
        icon: Shield
      });
    }
    setTests([...testResults]);

    // Test 5: API Backend
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(apiUrl, { method: "GET" });
      
      testResults.push({
        name: "Backend API",
        status: response.ok || response.status === 404 ? "pass" : "warning",
        message: `Backend API is running (${apiUrl})`,
        icon: Server
      });
    } catch (error) {
      testResults.push({
        name: "Backend API",
        status: "warning",
        message: "Backend API not responding (may not be started yet)",
        icon: Server
      });
    }
    setTests([...testResults]);

    // Final summary
    const hasFailures = testResults.some(t => t.status === "fail");
    setAllPassed(!hasFailures);
    setIsRunning(false);
  }

  function getStatusIcon(test: TestResult) {
    switch (test.status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "testing":
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  }

  function getStatusColor(test: TestResult) {
    switch (test.status) {
      case "pass":
        return "border-green-500/30 bg-green-500/5";
      case "fail":
        return "border-red-500/30 bg-red-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "testing":
        return "border-blue-500/30 bg-blue-500/5";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Database Connection Test
          </h1>
          <p className="text-slate-400">
            Verify your ExamCraft database connection status
          </p>
        </div>

        {/* Summary Card */}
        {allPassed !== null && !isRunning && (
          <div className={`mb-6 p-6 rounded-2xl border ${
            allPassed 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}>
            <div className="flex items-center gap-3">
              {allPassed ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-lg font-bold text-green-400">All Tests Passed!</h3>
                    <p className="text-sm text-slate-300">Your database connection is working correctly.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-400">Some Tests Failed</h3>
                    <p className="text-sm text-slate-300">Check the results below for troubleshooting steps.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl border transition-all ${getStatusColor(test)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {getStatusIcon(test)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white">{test.name}</h3>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      test.status === "pass" ? "text-green-400" :
                      test.status === "fail" ? "text-red-400" :
                      test.status === "warning" ? "text-yellow-400" :
                      "text-blue-400"
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{test.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                🔄 Re-run Tests
              </>
            )}
          </button>

          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
          >
            ← Back to App
          </button>
        </div>

        {/* Troubleshooting */}
        {allPassed === false && (
          <div className="mt-8 p-6 rounded-2xl bg-slate-800/50 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">🛠️ Troubleshooting Steps:</h3>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">1.</span>
                <span>Make sure Docker Desktop is running</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">2.</span>
                <span>Start database: <code className="bg-white/10 px-2 py-0.5 rounded">pnpm db:start</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">3.</span>
                <span>Wait 15 seconds for services to initialize</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">4.</span>
                <span>Check environment variables (NEXT_PUBLIC_DEMO_MODE=false)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">5.</span>
                <span>Restart database: <code className="bg-white/10 px-2 py-0.5 rounded">pnpm db:restart</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-indigo-400">6.</span>
                <span>View logs: <code className="bg-white/10 px-2 py-0.5 rounded">pnpm db:logs</code></span>
              </li>
            </ol>
          </div>
        )}

        {/* Quick Commands */}
        <div className="mt-6 p-6 rounded-2xl bg-slate-800/50 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">⚡ Quick Commands:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <code className="text-indigo-300">pnpm test:db-connection</code>
              <span className="text-slate-400">Run terminal test</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <code className="text-indigo-300">pnpm db:start</code>
              <span className="text-slate-400">Start database</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <code className="text-indigo-300">pnpm db:status</code>
              <span className="text-slate-400">Check status</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <code className="text-indigo-300">pnpm db:logs</code>
              <span className="text-slate-400">View logs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
