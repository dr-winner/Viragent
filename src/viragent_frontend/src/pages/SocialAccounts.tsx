import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const platforms = [
  {
    id: "twitter",
    name: "Twitter",
    connected: !!localStorage.getItem("twitter_access_token"),
    connectPath: "/auth/twitter",
    color: "#1DA1F2",
    icon: "🐦"
  },
  {
    id: "instagram",
    name: "Instagram",
    connected: !!localStorage.getItem("instagram_access_token"),
    connectPath: "/auth/instagram",
    color: "#E4405F",
    icon: "📷"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    connected: !!localStorage.getItem("linkedin_access_token"),
    connectPath: "/auth/linkedin",
    color: "#0077B5",
    icon: "💼"
  },
  {
    id: "facebook",
    name: "Facebook",
    connected: !!localStorage.getItem("facebook_access_token"),
    connectPath: "/auth/facebook",
    color: "#4267B2",
    icon: "📘"
  }
];

export default function SocialAccounts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Social Accounts</h1>
        <div className="space-y-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-card"
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 32 }}>{platform.icon}</span>
                <span className="font-medium text-lg" style={{ color: platform.color }}>{platform.name}</span>
                <span className={platform.connected ? "text-success" : "text-muted-foreground"}>
                  {platform.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <Button
                variant={platform.connected ? "outline" : "web3"}
                onClick={() => navigate(platform.connectPath)}
                disabled={platform.connected}
              >
                {platform.connected ? "Connected" : `Connect to ${platform.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 