# Viragent 🚀

<div align="center">
  <img src="src/viragent_frontend/public/viragent-logo.svg" alt="Viragent Logo" width="120" height="120">
  <h3>AI-Powered Social Media Management Platform on the Internet Computer</h3>
  <p><strong>Web3-Native AI Social Media Automation</strong></p>
</div>

Viragent is a revolutionary social media management platform that combines cutting-edge artificial intelligence with Web3 technology. Built on the Internet Computer Protocol (ICP), Viragent offers unprecedented security, privacy, and functionality for content creators, marketers, and businesses looking to dominate social media.

## ✨ Key Features

### 🤖 AI-Powered Content Generation
- **Smart Captions**: Generate engaging captions that match your brand voice
- **Hashtag Optimization**: AI-driven hashtag suggestions for maximum reach
- **Content Enhancement**: Improve existing content with AI recommendations
- **Tone Analysis**: Automatic tone detection and adjustment
- **Multi-Provider AI**: Support for OpenAI, GitHub Models, and Claude

### � Advanced Web3 Security
- **vetKeys Integration**: Industry-leading cryptographic privacy technology
- **Identity-Based Encryption (IBE)**: Secure content sharing without key exchange
- **Time-Lock Encryption**: Schedule content with cryptographic time locks
- **Secure API Key Management**: Encrypted storage prevents reverse engineering
- **Internet Identity**: Password-free authentication with biometrics
- **Decentralized Storage**: Your data remains private and secure on ICP

### �📊 Viral Prediction & Analytics
- **Engagement Prediction**: Get viral score analysis before posting
- **Performance Insights**: Track and analyze content performance across platforms
- **Trend Analysis**: Stay ahead with AI-powered trend detection
- **Real-time Analytics**: Live performance monitoring and insights

### ⏰ Smart Scheduling & Automation
- **Optimal Timing**: Post at peak engagement times for your audience
- **Multi-Platform Sync**: Coordinate posts across all social platforms
- **Automated Publishing**: Set it and forget it with intelligent scheduling
- **Content Queues**: Bulk upload and schedule content efficiently

### 👥 Team Collaboration & Premium Features
- **Role-Based Access**: Secure team management with customizable permissions
- **Approval Workflows**: Streamlined content approval processes
- **Premium Content Control**: Encrypt premium content with subscriber access
- **Secure Team Messaging**: End-to-end encrypted team communications

### 📱 Multi-Platform Support
- **Twitter/X**: Full API integration with OAuth 2.0
- **Instagram**: Post scheduling and analytics
- **TikTok**: Content optimization for short-form video
- **LinkedIn**: Professional network integration
- **Facebook**: Comprehensive page management
- **Discord**: Community engagement tools

## 🏗️ Architecture & Technology Stack

Viragent leverages a modern, fully decentralized architecture combining the best of Web3 and AI:

### **Frontend Stack**
- **React 18** + **TypeScript** for type-safe development
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible components
- **Framer Motion** + **GSAP** for smooth animations
- **React Query** for efficient data management

### **Backend Stack**
- **Motoko** canisters on Internet Computer Protocol
- **vetKeys** for advanced cryptographic privacy
- **Internet Identity** for secure authentication
- **ICP Storage** for decentralized data persistence

### **AI & Security Integration**
- **OpenAI GPT-4** for content generation
- **GitHub Models** for free AI access
- **Claude AI** for advanced reasoning
- **vetKeys IBE** for identity-based encryption
- **Time-lock encryption** for scheduled content security
- **Encrypted API key storage** to prevent reverse engineering

### **Social Platform APIs**
- **Twitter API v2** with OAuth 2.0
- **Instagram Graph API**
- **TikTok Business API**
- **LinkedIn API**
- **Facebook Graph API**

## 🎬 Demo

Experience Viragent in action with our interactive demo video. Click "Watch Demo" on the landing page to see:

- Real-time AI content generation
- Smart scheduling interface
- Multi-platform publishing
- Analytics dashboard
- Team collaboration features
- vetKeys security in action

## 🔒 Security Features

### vetKeys Integration
Viragent is one of the first platforms to integrate **vetKeys**, DFINITY's revolutionary cryptographic privacy technology:

- **Identity-Based Encryption (IBE)**: Encrypt content for specific users without key exchange
- **Time-Lock Encryption**: Cryptographically enforce content release schedules
- **Secure Messaging**: End-to-end encrypted team communications
- **Premium Content Control**: Subscriber-only access with cryptographic enforcement
- **API Key Protection**: Encrypted storage prevents reverse engineering even in deployed code

### Internet Identity
- **Biometric Authentication**: Use TouchID, FaceID, or hardware keys
- **No Passwords**: Eliminate password-related security risks
- **Cross-Device Sync**: Secure access across all your devices
- **Privacy Preserving**: Your identity remains anonymous on-chain

## 🚀 Quick Start

### Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install) (DFINITY SDK)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dr-winner/viragent.git
   cd viragent
   ```

2. **Set up environment variables**
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env and add your API keys:
   # - OpenAI API key for AI features
   # - GitHub token for free AI (alternative)
   # - Twitter credentials for social integration
   nano .env
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd src/viragent_frontend
   npm install
   cd ../..
   ```

4. **Start the local Internet Computer replica**
   ```bash
   dfx start --background
   ```

5. **Deploy the canisters**
   ```bash
   dfx deploy
   ```

6. **Initialize with your API keys**
   ```bash
   # Run the initialization script
   chmod +x init-env.sh
   ./init-env.sh
   ```

7. **Access the application**
   
   Your application will be available at the URLs shown after deployment, typically:
   - Frontend: `http://{canister-id}.localhost:4943/`
   - Backend Candid UI: `http://127.0.0.1:4943/?canisterId={candid-ui-id}&id={backend-id}`

## 🔐 Environment Setup

### Required Environment Variables

Create a `.env` file based on `.env.example` and configure:

```bash
# AI Providers (Configure at least one)
OPENAI_API_KEY=sk-proj-your-openai-key-here           # Premium OpenAI API
GITHUB_TOKEN=ghp_your-github-token-here               # Free GitHub Models API
ANTHROPIC_API_KEY=sk-ant-your-claude-key-here         # Claude AI API

# Social Media Integration
VITE_TWITTER_CLIENT_ID=your-twitter-client-id
VITE_TWITTER_CLIENT_SECRET=your-twitter-client-secret
VITE_TWITTER_REDIRECT_URI=http://localhost:4943/twitter/callback

# Development Settings
VITE_DFX_NETWORK=local
VITE_BACKEND_CANISTER_ID=auto-generated-during-deploy
VITE_FRONTEND_CANISTER_ID=auto-generated-during-deploy

# Optional: Custom API Endpoints
VITE_CUSTOM_AI_ENDPOINT=https://your-custom-ai-api.com
```

### 🔑 Getting API Keys

1. **OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create account and add billing information
   - Generate new API key with appropriate permissions

2. **GitHub Token (Free AI Access)**
   - Visit [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Generate new token (no special permissions needed)
   - Use with GitHub Models for free AI access

3. **Claude API Key**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create account and verify
   - Generate API key for Claude access

4. **Twitter Credentials**
   - Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create new app with OAuth 2.0
   - Copy Client ID and Client Secret

### 🛡️ Secure API Key Management

Viragent includes built-in secure API key management using vetKeys encryption:

- **Encrypted Storage**: API keys are encrypted before storage using vetKeys
- **Browser Encryption**: Keys are encrypted in the browser before sending to backend
- **Reverse Engineering Protection**: Even deployed code cannot expose your keys
- **Provider Management**: Support for multiple AI and social media providers
- **Key Rotation**: Easy key updates and rotation without redeployment

## 🛠️ Development

### Project Structure

```
viragent/
├── src/
│   ├── viragent_backend/              # Motoko backend canisters
│   │   ├── main.mo                   # Main backend logic & routing
│   │   ├── ai_service.mo             # AI integration & content generation
│   │   ├── analytics.mo              # Performance analytics & insights
│   │   ├── dispatch.mo               # Social media posting & scheduling
│   │   ├── media.mo                  # Media upload & management
│   │   ├── schedule.mo               # Smart scheduling algorithms
│   │   ├── tone.mo                   # Content tone analysis
│   │   ├── user.mo                   # User management & authentication
│   │   ├── vetkeys.mo                # vetKeys cryptographic privacy
│   │   ├── secure_config.mo          # Encrypted API key management
│   │   └── types.mo                  # Shared type definitions
│   └── viragent_frontend/            # React frontend application
│       ├── src/
│       │   ├── components/           # Reusable UI components
│       │   │   ├── ui/              # shadcn/ui base components
│       │   │   ├── VideoPlayer.tsx  # Custom video player
│       │   │   ├── Navbar.tsx       # Navigation component
│       │   │   └── ProtectedRoute.tsx
│       │   ├── contexts/            # React contexts
│       │   │   └── AuthContext.tsx  # Authentication state
│       │   ├── hooks/               # Custom React hooks
│       │   │   ├── useBackend.ts    # Backend integration
│       │   │   ├── use-mobile.tsx   # Mobile detection
│       │   │   └── use-toast.ts     # Toast notifications
│       │   ├── lib/                 # Utility functions
│       │   │   └── utils.ts         # General utilities
│       │   ├── pages/               # Application pages
│       │   │   ├── Landing.tsx      # Landing page with demo
│       │   │   ├── Dashboard.tsx    # Main dashboard
│       │   │   ├── Upload.tsx       # Content upload
│       │   │   ├── AIReview.tsx     # AI content analysis
│       │   │   ├── Schedule.tsx     # Scheduling interface
│       │   │   ├── VetKeysTest.tsx  # vetKeys demo page
│       │   │   ├── SecureApiKeyManager.tsx # API key management
│       │   │   └── Auth.tsx         # Authentication page
│       │   ├── services/            # API services
│       │   │   ├── backend.ts       # Backend communication
│       │   │   ├── vetkeys.ts       # vetKeys integration
│       │   │   └── secureApiKeys.ts # Encrypted key management
│       │   └── types/               # TypeScript definitions
│       │       └── backend.ts       # Backend type definitions
│       ├── public/                  # Static assets
│       │   ├── viragent-logo.svg    # Application logo
│       │   └── viragenVid.mp4       # Demo video
│       ├── package.json
│       └── vite.config.js
├── dfx.json                         # DFX configuration
├── package.json                     # Root package configuration
├── init-env.sh                      # Environment setup script
└── README.md
```

### 🚀 Available Scripts

**Root Directory:**
```bash
npm run build          # Build all workspaces
npm start              # Start development servers  
npm test               # Run all tests
dfx start --background # Start local IC replica
dfx deploy             # Deploy canisters
```

**Frontend Directory (`src/viragent_frontend`):**
```bash
npm run dev            # Start Vite development server (localhost:5173)
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
```

**Development Workflow:**
```bash
# Terminal 1: Start IC replica
dfx start --background

# Terminal 2: Deploy backend
dfx deploy viragent_backend

# Terminal 3: Start frontend development server
cd src/viragent_frontend && npm run dev

# Access at: http://localhost:5173
```

### Backend Development

The backend is written in **Motoko** and organized into modular canisters:

**Core Modules:**
- **`main.mo`**: Primary routing and canister orchestration
- **`ai_service.mo`**: Multi-provider AI integration (OpenAI, GitHub, Claude)
- **`user.mo`**: User management and Internet Identity integration
- **`analytics.mo`**: Performance tracking and viral prediction algorithms

**Advanced Features:**
- **`vetkeys.mo`**: Cryptographic privacy with IBE and time-lock encryption
- **`secure_config.mo`**: Encrypted API key storage and management
- **`dispatch.mo`**: Multi-platform social media posting
- **`schedule.mo`**: Intelligent content scheduling algorithms
- **`media.mo`**: Secure media upload and processing
- **`tone.mo`**: AI-powered content tone analysis

### Frontend Development

The frontend is a modern **React 18** application with **TypeScript**:

**Key Features:**
- **Authentication**: Seamless Internet Identity integration
- **Dashboard**: Comprehensive content management interface  
- **Upload**: Drag-and-drop media and content upload
- **AI Review**: Real-time content analysis and optimization
- **Scheduling**: Smart post scheduling with calendar interface
- **Analytics**: Interactive charts and performance insights
- **Team Management**: Role-based access and collaboration tools

**Security Integration:**
- **Secure API Keys**: In-app encrypted key management (/secure-api-keys)
- **vetKeys Demo**: Cryptographic features showcase (/vetkeys-test)
- **Protected Routes**: Authentication-gated application areas
- **Encrypted Communications**: All sensitive data encrypted in transit

**UI/UX Features:**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: System-aware theme switching
- **Smooth Animations**: Framer Motion and GSAP integration
- **Video Demo**: Interactive product demonstration
- **Progressive Loading**: Optimized asset loading and caching

## 🧪 Testing & Quality Assurance

### Testing Strategy
```bash
# Run all tests
npm test

# Frontend-specific tests
cd src/viragent_frontend && npm test

# Backend canister tests
dfx test

# Integration tests
npm run test:integration

# Type checking
npm run type-check
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Full type safety across the application
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Security Testing
- **vetKeys Integration Tests**: Cryptographic function validation
- **API Key Encryption Tests**: Secure storage verification
- **Authentication Flow Tests**: Internet Identity integration
- **Permission System Tests**: Role-based access control

## 📦 Deployment

### Local Development
```bash
# Start local Internet Computer replica
dfx start --background

# Deploy to local network
dfx deploy

# Access application
open http://localhost:5173
```

### Production Deployment
```bash
# Build optimized production bundle
npm run build

# Deploy to Internet Computer mainnet
dfx deploy --network ic --with-cycles 1000000000000

# Verify deployment
dfx canister --network ic status viragent_backend
dfx canister --network ic status viragent_frontend
```

### Deployment Features
- **Automatic Asset Optimization**: Compressed images and videos
- **CDN Integration**: Global content delivery
- **Canister Scaling**: Auto-scaling based on usage
- **Backup & Recovery**: Automated data backup strategies
- **Monitoring**: Real-time performance and error tracking

## 🔧 Configuration & Customization

### Environment Configuration
```bash
# Development
VITE_DFX_NETWORK=local
VITE_DEV_MODE=true

# Staging  
VITE_DFX_NETWORK=playground
VITE_DEV_MODE=false

# Production
VITE_DFX_NETWORK=ic
VITE_DEV_MODE=false
```

### Feature Flags
- **ENABLE_VETKEYS**: Toggle vetKeys cryptographic features
- **ENABLE_AI_PROVIDERS**: Configure available AI providers
- **ENABLE_SOCIAL_PLATFORMS**: Control social media integrations
- **ENABLE_ANALYTICS**: Toggle analytics and tracking features

### Custom Branding
- Replace logo in `src/viragent_frontend/public/viragent-logo.svg`
- Update colors in `tailwind.config.ts`
- Modify demo video at `src/viragent_frontend/public/viragenVid.mp4`
- Customize landing page content in `src/viragent_frontend/src/pages/Landing.tsx`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Important Links & Resources

### **Platform & Documentation**
- [Internet Computer](https://internetcomputer.org/) - Blockchain platform
- [DFINITY SDK Documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install) - Development tools
- [Motoko Programming Language](https://internetcomputer.org/docs/current/motoko/main/motoko) - Backend language
- [vetKeys Documentation](https://internetcomputer.org/docs/current/developer-docs/integrations/vetkeys/) - Cryptographic privacy

### **Frontend Technologies**
- [React 18 Documentation](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Framer Motion](https://www.framer.com/motion/) - Animations

### **AI & API Integration**
- [OpenAI Platform](https://platform.openai.com/) - Premium AI API
- [GitHub Models](https://github.com/marketplace/models) - Free AI access
- [Anthropic Claude](https://console.anthropic.com/) - Advanced AI reasoning
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api) - Social integration

### **Security & Authentication**
- [Internet Identity](https://identity.ic0.app/) - Secure authentication
- [vetKeys Whitepaper](https://eprint.iacr.org/2023/616.pdf) - Cryptographic privacy research
- [ICP Security Best Practices](https://internetcomputer.org/docs/current/developer-docs/security/) - Security guidelines

## 🆘 Support & Community

### **Getting Help**
1. **Documentation**: Check this README and inline code comments
2. **Issues**: [GitHub Issues](https://github.com/dr-winner/viragent/issues) for bug reports
3. **Discussions**: [GitHub Discussions](https://github.com/dr-winner/viragent/discussions) for questions
4. **Community**: Join our Discord server for real-time help

### **Common Issues & Solutions**

**Issue**: "Cannot connect to local Internet Computer replica"
```bash
# Solution: Restart the replica
dfx stop && dfx start --background
```

**Issue**: "Frontend not loading after deployment"
```bash
# Solution: Clear browser cache and check canister URLs
dfx canister call viragent_frontend http_request '(record{url="/"; method="GET"; headers=vec{}; body=vec{}})'
```

**Issue**: "API keys not working in secure storage"
```bash
# Solution: Verify encryption is working
dfx canister call viragent_backend hasSecureApiKey '("openai")'
```

### **Performance Optimization**
- **Bundle Size**: Use dynamic imports for large features
- **Image Optimization**: Compress assets before deployment  
- **Caching Strategy**: Implement service worker for offline functionality
- **CDN Setup**: Configure Internet Computer asset optimization

## 🌟 Acknowledgments & Credits

### **Core Technologies**
- **DFINITY Foundation** - Internet Computer Protocol and vetKeys
- **OpenAI** - GPT models for content generation
- **Anthropic** - Claude AI for advanced reasoning
- **Vercel** - shadcn/ui component system inspiration

### **Open Source Libraries**
- **Lucide React** - Beautiful icon system
- **React Query** - Data fetching and caching
- **date-fns** - Date manipulation utilities
- **crypto-js** - Client-side cryptography helpers

### **Design & UX**
- **Tailwind Team** - Utility-first CSS framework
- **Framer** - Motion library for smooth animations
- **GSAP** - High-performance animation engine

### **Community Contributors**
Special thanks to all contributors who have helped make Viragent possible. See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list.

---

<div align="center">
  <img src="src/viragent_frontend/public/viragent-logo.svg" alt="Viragent Logo" width="60" height="60">
  <br>
  <strong>Made with ❤️ by the Viragent Team</strong>
  <br>
  <em>Empowering creators with Web3-native AI social media automation</em>
  <br><br>
  
  [![Internet Computer](https://img.shields.io/badge/Internet_Computer-Protocol-29ABE2?style=for-the-badge&logo=internetcomputer)](https://internetcomputer.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Motoko](https://img.shields.io/badge/Motoko-F7F7F7?style=for-the-badge&logo=motoko&logoColor=black)](https://motoko.org/)
  
</div>
