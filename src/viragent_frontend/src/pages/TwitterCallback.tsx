import React, { useEffect, useState } from "react";

export default function TwitterCallback() {
  const [result, setResult] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const codeVerifier = localStorage.getItem("twitter_code_verifier");

    if (code && codeVerifier) {
      fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: import.meta.env.VITE_TWITTER_CLIENT_ID!,
          redirect_uri: import.meta.env.VITE_TWITTER_REDIRECT_URI!,
          code_verifier: codeVerifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setResult(JSON.stringify(data, null, 2));
          if (data.access_token) {
            localStorage.setItem("twitter_access_token", data.access_token);
          }
        });
    }
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Twitter OAuth2 Callback</h2>
      <pre>{result}</pre>
    </div>
  );
} 