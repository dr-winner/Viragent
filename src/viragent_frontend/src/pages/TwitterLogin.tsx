import React from "react";
import pkceChallenge from "pkce-challenge";

export default function TwitterLogin() {
  const handleLogin = () => {
    const { code_challenge, code_verifier } = pkceChallenge();
    localStorage.setItem("twitter_code_verifier", code_verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: import.meta.env.VITE_TWITTER_CLIENT_ID!,
      redirect_uri: import.meta.env.VITE_TWITTER_REDIRECT_URI!,
      scope: "tweet.read tweet.write users.read offline.access",
      state: "random_state_123",
      code_challenge,
      code_challenge_method: "plain",
    });

    window.location.href = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Connect to Twitter</h2>
      <button onClick={handleLogin} style={{ padding: 12, fontSize: 16 }}>
        Connect to Twitter
      </button>
    </div>
  );
} 