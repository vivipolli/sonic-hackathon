# BehavAI

A privacy-first mental health application that helps users track and analyze behavioral patterns through a secure multi-chain architecture:

- **Sonic Network**: Ensures complete data confidentiality through encrypted storage of user behavioral data and analysis results
- **EternalAI**: Provides secure and private AI analysis through blockchain-protected LLM interactions

This architecture ensures that sensitive mental health data remains confidential and secure, while still enabling powerful AI-driven analysis and evidence-based habit recommendations.

## ⭐ Key Features

- 🧠 **Private Behavioral Analysis:** AI-powered analysis with encrypted data through EternalAI
- 📊 **Smart Recommendations:** Personalized habit suggestions based on your behavioral patterns
- 📝 **Secure Habit Tracking:** Daily progress monitoring on Sonic Network with verifiable transactions
- 🔑 **Web3 Made Easy:** Secure access through familiar social logins (Google, Facebook, Twitter)
- 🛡️ **Privacy-First Design:** End-to-end encryption with blockchain-level security

---

## 🎯 Problem Statement

Mental health data is highly sensitive, yet many digital health solutions compromise privacy and accessibility. Centralized data storage often leaves user information vulnerable to breaches, with limited user control over data access and insecure AI analysis processes.

Beyond privacy concerns, patients frequently express dissatisfaction with the quality and cost of traditional therapy services. High prices and inconsistent service quality make mental health care inaccessible for many. As a result, some individuals turn to common language models (LLMs) for mental health advice. However, these alternatives lack privacy guarantees, store sensitive conversations without encryption, and offer no systematic progress tracking or professional oversight.

Our platform addresses these issues that integrates AI-driven analysis with professional mental health care, ensuring both data security and high-quality service. By leveraging behavioral analysis principles, our platform suggests personalized interventions to support users' mental health journeys. **It is important to note that while our platform offers valuable insights and recommendations, it is designed to complement, not replace, conventional therapy.**

## 💡 Solution

We leverage **Sonic Network** and **EternalAI** to create a secure platform where:

- 🔒 **Users maintain complete control** over their mental health data through Sonic Network's encrypted storage
- 🤖 **AI analysis is performed privately** through EternalAI's blockchain-protected LLM interactions
- 🔐 **All transactions are verifiable** while maintaining data confidentiality

---

# 🛠️ Development Deep Dive

## 🏗️ Architecture Overview

### 1. Frontend (React)

- 🔑 Web3Auth authentication
- 📱 Behavioral tracking interface
- 🔍 Progress visualization

### 2. Backend (FastAPI + ZerePy)

- 🤖 EternalAI: Behavioral analysis
- 💾 Sonic: Encrypted data storage

---

# 🚀 Technical Setup

## Prerequisites

### System Requirements

Required technologies:

- 🐍 Python 3.10+
- 📦 Poetry (dependency management)
- 💻 Node.js v16+ (for frontend)

## Installation

### 1. Backend Setup

```sh
# Clone repository and enter directory
git clone https://github.com/vivipolli/sonic-hackathon.git
cd sonic-hackathon

# Install dependencies with Poetry
poetry install --extras server

# Activate virtual environment
poetry shell

# Configure ZerePy connections
poetry run zerepy configure-connection eternalai  # For behavioral analysis
poetry run zerepy configure-connection sonic      # For encrypted storage
```

### 2. Frontend Setup

```sh
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
```

### Environment Configuration

```sh
VITE_API_BASE_URL=http://localhost:8000
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
```

## Running Locally

### 1. Start Backend

```sh
# Navigate to ZerePy directory
cd ZerePy

# Activate virtual environment
poetry shell

# Start server
python main.py --server --host 0.0.0.0 --port 8000
```

### 2. Start Frontend

```sh
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

# 🔮 Future Development

## Short Term (3 months)

- 📜 **Analysis History System**: Implementation of a secure retrieval system where transaction hashes are stored in centralized databases, with analysis recovery linked to both the hash and the encrypted user ID associated with the authentication token ID, ensuring privacy and data integrity.
- 📊 **Comprehensive Habit Tracking**: Recording of completed habits, habit history, and daily notes for AI-powered progress analysis
- 🤖 **AI Prompt Optimization**: Refinement of prompt engineering for more accurate and personalized behavioral analysis

## Medium Term (6-12 months)

- 📈 **Progress Analytics Dashboard**: Comprehensive graphical visualization of user's weekly, monthly, and annual habit progress
- 💡 **Alternative Habit Generation**: Smart feature to suggest alternative habits when users decline initial recommendations
- 💳 **Payment Integration**: Implementation of subscription-based model with secure payment processing

## Long Term (1-2 years)

- 🌐 **Social Media Integration**: Generation of customizable templates for sharing progress and achievements, encouraging community support and self-motivation
- 🤝 **Decentralized Mental Health Network**: Integration with a decentralized social platform focused on mental health, enabling private and secure community interactions

---

# 📚 References

- 🔗 [ZerePy Documentation](https://www.zerepy.org/docs/intro)
- 🌊 [Sonic Network Documentation](https://docs.soniclabs.com/)
- 🤖 [EternalAI Documentation](https://docs.eternalai.org/eternal-ai)
- 🔑 [Web3Auth Documentation](https://web3auth.io/docs/)
- 📦 [Poetry Documentation](https://python-poetry.org/docs/)
