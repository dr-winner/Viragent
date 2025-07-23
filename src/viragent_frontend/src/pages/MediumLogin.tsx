import React from "react";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, BookOpen, Users, TrendingUp, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MediumLogin() {
  const handleLogin = () => {
    // Medium OAuth2 flow
    const clientId = import.meta.env.VITE_MEDIUM_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_MEDIUM_REDIRECT_URI || `${window.location.origin}/auth/medium/callback`;
    
    if (!clientId) {
      alert("Medium Client ID not configured. Please check your environment variables.");
      return;
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "basicProfile,publishPost",
      state: "medium_auth_" + Math.random().toString(36).substring(7),
    });

    window.location.href = `https://medium.com/m/oauth/authorize?${params.toString()}`;
  };

  const features = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Publish Articles",
      description: "Create and publish long-form content directly to your Medium profile"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Reach Readers",
      description: "Access Medium's engaged community of millions of readers"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Track Performance",
      description: "Monitor article views, reads, and engagement metrics"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered Content",
      description: "Use Viragent's AI to generate compelling article ideas and content"
    }
  ];

  const benefits = [
    "Schedule articles for optimal publishing times",
    "AI-generated content suggestions and optimization",
    "Cross-platform content distribution strategy",
    "Analytics and performance tracking",
    "Professional article formatting and SEO"
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-space-grotesk font-bold mb-2 gradient-text">
            Connect to Medium
          </h1>
          <p className="text-muted-foreground text-lg">
            Expand your reach with AI-powered long-form content on Medium's platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Card */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="web3-card">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-space-grotesk font-semibold mb-2">
                  Medium Integration
                </h2>
                <p className="text-muted-foreground">
                  Connect your Medium account to publish articles directly from Viragent
                </p>
              </div>

              <Alert className="mb-6 bg-green-500/10 border-green-500/20">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-100">
                  You'll need a Medium account and API access to connect. Medium uses OAuth2 for secure authentication.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  What you'll get:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleLogin} 
                variant="web3"
                size="lg"
                className="w-full group"
              >
                <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Connect to Medium
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By connecting, you agree to Medium's terms of service and privacy policy
              </p>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="web3-card">
              <h3 className="text-xl font-space-grotesk font-semibold mb-6">
                Medium Features
              </h3>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-4 hover:bg-card/90 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4">
                  Medium Platform Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-1">170M+</div>
                    <div className="text-xs text-muted-foreground">Monthly Readers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">7M+</div>
                    <div className="text-xs text-muted-foreground">Writers</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Professional Network
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    High-Quality Content
                  </Badge>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="glass-card p-4 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground">
              🚀 <strong>Pro Tip:</strong> Medium is perfect for thought leadership, tutorials, case studies, and in-depth analysis. 
              Combine it with Viragent's AI to create compelling long-form content that engages your professional audience.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
