# Viragent 🚀

**AI-Powered Social Media Management Platform on the Internet Computer**

Viragent is a cutting-edge social media management platform that leverages artificial intelligence and blockchain technology to help content creators, marketers, and businesses maximize their social media impact. Built on the Internet Computer Protocol (ICP), Viragent combines the power of decentralized computing with advanced AI capabilities.

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Smart Captions**: Generate engaging captions that match your brand voice
- **Hashtag Optimization**: AI-driven hashtag suggestions for maximum reach
- **Content Enhancement**: Improve existing content with AI recommendations

### 📊 Viral Prediction & Analytics
- **Engagement Prediction**: Get viral score analysis before posting
- **Performance Insights**: Track and analyze content performance
- **Trend Analysis**: Stay ahead with AI-powered trend detection

### ⏰ Smart Scheduling
- **Optimal Timing**: Post at peak engagement times for your audience
- **Multi-Platform Sync**: Coordinate posts across all social platforms
- **Automated Publishing**: Set it and forget it with intelligent scheduling

### 👥 Team Collaboration
- **Role-Based Access**: Secure team management with customizable permissions
- **Approval Workflows**: Streamlined content approval processes
- **Team Analytics**: Collaborative performance tracking

### 🔐 Web3 Security
- **Internet Identity**: Secure authentication without passwords
- **Blockchain Storage**: Decentralized data storage on ICP
- **Privacy First**: Your data remains private and secure

### 📱 Multi-Platform Support
- Twitter/X
- Instagram
- TikTok
- LinkedIn
- Facebook
- And more platforms coming soon!

## 🏗️ Architecture

Viragent is built using a modern, decentralized architecture:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Motoko canisters on Internet Computer
- **Authentication**: Internet Identity
- **UI Components**: shadcn/ui component library
- **Animations**: Framer Motion + GSAP
- **State Management**: React Query + Context API

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

2. **Install dependencies**
   ```bash
   npm install
   cd src/viragent_frontend
   npm install
   cd ../..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual API keys and configuration
   # Required: OPENAI_API_KEY (get from https://platform.openai.com/api-keys)
   # Optional: Social media platform API credentials
   ```

4. **Start the local Internet Computer replica**
   ```bash
   dfx start --background
   ```

5. **Deploy the canisters**
   ```bash
   dfx deploy
   ```

5. **Access the application**
   
   Your application will be available at the URLs shown after deployment, typically:
   - Frontend: `http://{canister-id}.localhost:4943/`
   - Backend Candid UI: `http://127.0.0.1:4943/?canisterId={candid-ui-id}&id={backend-id}`

## � Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and configure the following:

#### OpenAI API (Required for AI features)
```bash
OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```
Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

#### Social Media Platform APIs (Optional)

**Twitter/X API v2**
```bash
VITE_TWITTER_CLIENT_ID=your_twitter_client_id_here
VITE_TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```
Get credentials from [Twitter Developer Portal](https://developer.twitter.com)

**Instagram Basic Display API**
```bash
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id_here
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_here
```
Get credentials from [Facebook Developers](https://developers.facebook.com)

**LinkedIn API**
```bash
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```
Get credentials from [LinkedIn Developer Portal](https://developer.linkedin.com)

⚠️ **Important**: Never commit your actual API keys to version control. The `.env` file is ignored by Git for security.

## �🛠️ Development

### Project Structure

```
viragent/
├── src/
│   ├── viragent_backend/          # Motoko backend canister
│   │   └── main.mo               # Main backend logic
│   └── viragent_frontend/        # React frontend application
│       ├── src/
│       │   ├── components/       # Reusable UI components
│       │   ├── contexts/         # React contexts
│       │   ├── hooks/            # Custom React hooks
│       │   ├── lib/              # Utility functions
│       │   └── pages/            # Application pages
│       ├── package.json
│       └── vite.config.js
├── dfx.json                      # DFX configuration
├── package.json                  # Root package configuration
└── README.md
```

### Available Scripts

In the root directory:

- `npm run build` - Build all workspaces
- `npm start` - Start development servers
- `npm test` - Run tests

In the frontend directory (`src/viragent_frontend`):

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Development

The backend is written in Motoko and handles:
- User authentication and authorization
- Content storage and management
- AI integration endpoints
- Social media platform APIs

### Frontend Development

The frontend is a modern React application featuring:
- **Authentication**: Secure login with Internet Identity
- **Dashboard**: Comprehensive content management interface
- **Upload**: Media and content upload functionality
- **AI Review**: Content analysis and optimization
- **Scheduling**: Smart post scheduling interface

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests only
cd src/viragent_frontend
npm test
```

## 📦 Building for Production

```bash
# Build the entire project
npm run build

# Deploy to Internet Computer mainnet
dfx deploy --network ic
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Internet Computer](https://internetcomputer.org/)
- [DFINITY SDK Documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Motoko Programming Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [React Documentation](https://react.dev/)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/dr-winner/viragent/issues) page
2. Create a new issue if your problem isn't already reported
3. Join our community discussions

## 🌟 Acknowledgments

- Built on the Internet Computer Protocol
- Powered by DFINITY technology
- UI components by shadcn/ui
- Icons by Lucide React

---

**Made with ❤️ by the Viragent Team**