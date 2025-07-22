import React, { useState } from "react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory as backendIdl, canisterId as backendCanisterId } from "../../../declarations/viragent_backend";

export default function TwitterTest() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");

  const postTweet = async () => {
    try {
      const accessToken = localStorage.getItem("twitter_access_token");
      if (!accessToken) {
        setResult("No Twitter access token found. Please connect to Twitter first.");
        return;
      }
      const agent = new HttpAgent({ host: "http://localhost:4943" });
      const backend = Actor.createActor(backendIdl, {
        agent,
        canisterId: backendCanisterId,
      });
      const res = await backend.testTwitterPost(content, accessToken);
      setResult(res);
    } catch (err) {
      setResult("Error: " + String(err));
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Test Twitter Posting</h2>
      <input
        type="text"
        placeholder="Tweet content"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: 300, marginBottom: 8 }}
      />
      <br />
      <button onClick={postTweet} style={{ padding: 12, fontSize: 16 }}>
        Post Tweet
      </button>
      <div style={{ marginTop: 16 }}>
        <b>Result:</b> {result}
      </div>
    </div>
  );
} 