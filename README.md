# 🚀 Opsy

> **AI-Powered Developer Productivity Platform**  
> A college project exploring AI capabilities - analyze commits, chat with your codebase, and summarize meetings!

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://opsy-sable.vercel.app/dashboard)
[![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)]()

[**🌐 Try Opsy Now**](https://opsy-sable.vercel.app/dashboard)

---

## 📖 About This Project

**Opsy** is a learning project I built as a college student to explore AI integration in developer tools. It helps developers understand repositories better, track changes, and manage meeting notes through intelligent automation and natural language processing.

> **Note:** This is an educational project created to learn about AI, full-stack development, and modern web technologies. Feel free to explore, fork, and learn from it!

### ✨ What It Does

- 🔍 **Smart Commit Analysis** - Get AI-generated summaries of commit history
- 💬 **Chat with Your Codebase** - Ask questions about any GitHub repository using RAG
- 🎧 **Meeting Summarizer** - Upload audio files and get instant summaries with action items
- 💳 **Credit-Based System** - Simple usage model with credit purchasing (using Razorpay test mode)

---

## 🎯 Features Breakdown

### 1️⃣ GitHub Commit Analyzer

Transform your commit history into readable, human-friendly summaries.

**How it works:**
- Connect your GitHub repository
- Fetches commits using GitHub API (Octokit)
- Each commit message and diff is analyzed by Gemini AI
- Displays commit message, AI summary, author, and date

**Perfect for:** Code reviews, changelog generation, understanding project evolution

---

### 2️⃣ Repository Knowledge Base (RAG-Powered Q&A)

The main feature — chat with your entire codebase like it's ChatGPT.

**Process Flow:**

#### 📥 Indexing Phase
1. **Fetch Files**: LangChain retrieves all files from the repository (ignoring binaries, node_modules, etc.)
2. **Generate Embeddings**: Each file is converted into vector embeddings using Gemini API
3. **Create Summaries**: AI generates concise summaries for every file
4. **Store in MongoDB**: All data (embeddings, summaries, metadata) is saved for instant retrieval

#### 💬 Query Phase
1. User asks a question in natural language
2. Question is converted to a vector embedding
3. System performs vector similarity search to find top 10 most relevant files
4. Retrieved context + question sent to Gemini for final answer
5. Response includes:
   - AI-generated answer
   - Top 10 matched files
   - Individual file summaries

**Use Cases:**
- "Where is the authentication logic?"
- "How does the payment system work?"
- "Find all API endpoints related to user management"

**Credit Cost:** 1 credit per file processed during indexing

---

### 3️⃣ Meeting Summarizer

Upload meeting recordings and get instant, structured summaries.

**Workflow:**
1. Upload MP3/audio file (stored in Cloudinary)
2. File sent to AssemblyAI for transcription
3. Transcript analyzed by Gemini AI to extract:
   - Executive summary
   - Key discussion points
   - Action items
   - Speaker identification (optional)

**Perfect for:** Standup meetings, client calls, brainstorming sessions

---

### 4️⃣ Credits System

Simple usage model to manage API costs fairly.

#### 🎁 Free Tier
- **50 free credits** on signup
- Enough to explore all features

#### 💰 Credit Usage
- **Repository Indexing**: 1 credit per file processed
- **Questions**: Configurable credit cost
- **Meetings**: Custom credit allocation

#### 💳 Purchasing Credits
- Integrated with **Razorpay** (currently in test mode for learning purposes)
- Mock payment processing for demonstration
- Instant credit top-up
- Transaction history stored in MongoDB

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| **Frontend**     | React, Tailwind CSS, shadcn/ui      |
| **Backend**      | Node.js, Express / Next.js API      |
| **Database**     | MongoDB                             |
| **AI/ML**        | Google Gemini (embeddings, chat)    |
| **Repository**   | Octokit (GitHub API), LangChain     |
| **Transcription**| AssemblyAI                          |
| **Storage**      | Cloudinary (audio files)            |
| **Payments**     | Razorpay (test mode)                |
| **Auth**         | Clerk (OAuth, email verification)   |

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.x
MongoDB instance
Clerk account
Gemini API key
AssemblyAI API key
Cloudinary account
Razorpay account (for test mode)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/opsy.git

# Navigate to project
cd opsy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys and credentials

# Run development server
npm run dev
```

### Environment Variables

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Database
MONGO_URI=your_mongodb_connection_string

# GitHub
GITHUB_TOKEN=your_github_personal_access_token

# AI Services
AI_KEY=your_gemini_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Firebase (if used)
FIREBASE=your_firebase_config

# Cloud Storage (Cloudinary)
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Payments (Razorpay)
NEXT_PUBLIC_RAZORPAY_ID=your_razorpay_key_id
RAZORPAY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret_key

# Application URL
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## 📊 Architecture

```
┌─────────────┐
│   Frontend  │ (React + shadcn/ui)
└──────┬──────┘
       │
┌──────▼──────────────────────────┐
│      API Layer (Express/Next)    │
├──────┬──────┬──────┬────────────┤
│ Auth │ RAG  │ File │  Payments  │
│Clerk │Logic │Upload│ Razorpay   │
└──┬───┴───┬──┴───┬──┴─────┬──────┘
   │       │      │        │
┌──▼───┐ ┌▼──────▼─┐   ┌──▼────┐
│Gemini│ │Cloudinary│   │MongoDB│
│  AI  │ │AssemblyAI│   │   DB  │
└──────┘ └──────────┘   └───────┘
```

---

## 💡 Learning Outcomes

Building this project helped me learn:

- **RAG Implementation**: Understanding vector embeddings and similarity search
- **AI Integration**: Working with multiple AI APIs (Gemini, AssemblyAI)
- **Full-Stack Development**: Building a complete MERN application
- **Payment Integration**: Implementing Razorpay for transactions
- **Authentication**: Using Clerk for secure OAuth and user management
- **Cloud Services**: Managing file uploads with Cloudinary
- **Database Design**: Structuring MongoDB schemas for complex data

---

## 🗺️ Future Ideas

Things I'd like to add when I get time:

- [ ] Support for more AI providers (OpenAI, Claude)
- [ ] Code generation from questions
- [ ] GitHub PR summaries
- [ ] Slack/Discord integration for meeting summaries
- [ ] Multi-repository knowledge base
- [ ] Team collaboration features
- [ ] API access for developers

---

## 🤝 Want to Contribute or Learn?

This is a learning project, and I'm open to collaborations! If you're a student or developer wanting to explore AI integration:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Feel free to reach out if you have questions or want to discuss the implementation!

---

## Technologies & Resources Used

This project wouldn't be possible without these amazing tools:

- [Gemini AI](https://ai.google.dev/) for embeddings and chat capabilities
- [AssemblyAI](https://www.assemblyai.com/) for audio transcription
- [Clerk](https://clerk.com/) for authentication infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [LangChain](https://www.langchain.com/) for RAG implementation
- [Vercel](https://vercel.com/) for hosting and deployment

---

## 📧 Connect With Me

Built as a learning project by Rishi Jaiswal 🎓

- **Live Demo**: [opsy-sable.vercel.app](https://opsy-sable.vercel.app/dashboard)
- **Twitter**: [@__Rishiiii__](https://x.com/__Rishiiii__)
- **Email**: rishijaiswal249@gmail.com

---

<div align="center">

**If you find this project interesting or helpful for learning, consider giving it a ⭐️!**

*Made with ❤️ and lots of coffee ☕*

</div>