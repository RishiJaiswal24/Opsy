"use client";

import { useState } from "react";

export default function TestGithubPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/test-github", { method: "POST" });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">🔍 Test GitHub Repo Loader</h1>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Run Repo Indexing"}
      </button>

      <pre className="mt-6 bg-white p-4 rounded-lg shadow-md text-sm w-full max-w-2xl overflow-auto">
        {result || "Click the button to start indexing..."}
      </pre>
    </div>
  );
}
