"use client";
import { useState } from "react";

export default function TestVectorSearch() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/queryVectorSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // you can add dynamic question/projectId later if needed
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test queryVectorSearch API</h1>

      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Testing..." : "Run Test"}
      </button>

      {error && (
        <div className="mt-4 text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Response:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
