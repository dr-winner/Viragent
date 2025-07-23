import React from "react";
import pkceChallenge from "pkce-challenge";
import { useLocation } from "react-router-dom";

export default function TwitterLogin() {
  const location = useLocation();
  const isInstagram = location.pathname.includes("instagram");
  const isLinkedIn = location.pathname.includes("linkedin");
  const isFacebook = location.pathname.includes("facebook");

  const handleLogin = () => {
    if (isInstagram || isLinkedIn || isFacebook) {
      alert("OAuth2 flow for this platform is coming soon!");
      return;
    }
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

  let platform = "Twitter";
  if (isInstagram) platform = "Instagram";
  if (isLinkedIn) platform = "LinkedIn";
  if (isFacebook) platform = "Facebook";

  return (
    <div style={{ padding: 32 }}>
      <h2>Connect to {platform}</h2>
      <button onClick={handleLogin} style={{ padding: 12, fontSize: 16 }}>
        Connect to {platform}
      </button>
      {(isInstagram || isLinkedIn || isFacebook) && (
        <div style={{ marginTop: 16, color: "#888" }}>
          <b>Coming soon:</b> OAuth2 flow for {platform} will be available in a future update.
        </div>
      )}
    </div>
  );
} 