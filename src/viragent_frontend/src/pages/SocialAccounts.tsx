import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Plus, Users, TrendingUp, Zap } from "lucide-react";

const platforms = [
  {
    id: "twitter",
    name: "Twitter",
    connected: !!localStorage.getItem("twitter_access_token"),
    connectPath: "/auth/twitter",
    color: "#1DA1F2",
    icon: "🐦",
    description: "Share quick updates and engage with trending topics",
    features: ["Real-time engagement", "Hashtag trends", "Quick posting"],
  },
  {
    id: "instagram",
    name: "Instagram",
    connected: !!localStorage.getItem("instagram_access_token"),
    connectPath: "/auth/instagram",
    color: "#E4405F",
    icon: "📷",
    description: "Visual storytelling with photos and videos",
    features: ["Visual content", "Stories", "Reels"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    connected: !!localStorage.getItem("linkedin_access_token"),
    connectPath: "/auth/linkedin",
    color: "#0077B5",
    icon: "💼",
    description: "Professional networking and career content",
    features: ["Professional network", "Thought leadership", "B2B content"],
  },
  {
    id: "facebook",
    name: "Facebook",
    connected: !!localStorage.getItem("facebook_access_token"),
    connectPath: "/auth/facebook",
    color: "#4267B2",
    icon: "📘",
    description: "Connect with friends and share personal updates",
    features: ["Community engagement", "Events", "Groups"],
  },
  {
    id: "medium",
    name: "Medium",
    connected: !!localStorage.getItem("medium_access_token"),
    connectPath: "/auth/medium",
    color: "#00AB6C",
    icon: "📝",
    description: "Publish long-form articles and thought leadership",
    features: ["Long-form content", "Professional audience", "SEO benefits"],
  },
];

export default function SocialAccounts() {
  const navigate = useNavigate();
  
  const connectedCount = platforms.filter((p) => p.connected).length;
  const totalPlatforms = platforms.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">
            Social Accounts
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect your social media platforms to start publishing with
            AI-powered content
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="web3-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary">
                  {connectedCount}/{totalPlatforms}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Platforms Connected
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-accent">AI Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Content Generation
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-success">
                  {connectedCount > 0 ? "Active" : "Waiting"}
                </h3>
                <p className="text-sm text-muted-foreground">System Status</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card className="web3-card group hover:scale-[1.02] transition-all duration-300">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <h3
                          className="text-xl font-space-grotesk font-semibold"
                          style={{ color: platform.color }}
                        >
                          {platform.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {platform.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {platform.connected ? (
                        <Badge className="bg-success/20 text-success border-success/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground"
                        >
                          Not Connected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Features:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {platform.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Action Button */}
                  <div className="flex justify-end">
                    {platform.connected ? (
                      <div className="flex gap-2">
                        <Button variant="glass" size="sm">
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="web3"
                        onClick={() => navigate(platform.connectPath)}
                        className="group/btn"
                      >
                        <Plus className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Connect to {platform.name}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        {connectedCount > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="web3-card">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-space-grotesk font-bold">
                  Ready to Create Amazing Content?
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You've connected {connectedCount} platform
                  {connectedCount !== 1 ? "s" : ""}! Start creating AI-powered
                  content that engages your audience.
                </p>
                <Button
                  variant="web3"
                  size="lg"
                  onClick={() => navigate("/upload")}
                  className="group"
                >
                  <Zap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Creating Content
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>Secure Connection:</strong> All platform connections
              use OAuth2 for maximum security. Your credentials are never stored
              on our servers.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 