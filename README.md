# DateIt - Dating App Frontend

A modern dating web application built with Next.js and TypeScript for the WC Launchpad Builder Round.

## 📱 Overview

DateIt is a desktop and mobile oriented dating platform that enables users to create profiles, discover matches through an intuitive swipe interface, and chat with matched users in real-time.

## ✨ Features Implemented

- **User Authentication**: Email/password registration and login
- **Profile Management**: Create and edit profiles with name, age, bio, and profile photo
- **User Discovery**: Browse profiles with drag-to-swipe interface (right to like, left to skip)
- **Smart Matching**: Mutual likes create matches automatically
- **Real-time Chat**: Messaging unlocked after matching
- **Match List**: View all current matches with unmatch capability
- **Filters**: Age profile filtering (bonus)

## 🛠 Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** + **Zod** - Form handling and validation

## 📋 Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm** or **yarn** or **pnpm**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/NelTeano/DateIT-Client.git
cd dateit-client or the folder name
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> **Note**: Replace with your actual backend API URL when deploying to production.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
DateIT-Client/
├── app/                      # Next.js App Router
│   ├── auth/                # Authentication pages
│   ├── chat/                # Chat interface
│   ├── match/               # Match/discovery pages
│   ├── my-matches/          # Matches list
│   ├── profile/             # Profile management
│   ├── upload/              # Image upload pages
│   ├── upload-multiple/     # Multiple image upload
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── socket.js            # Socket.io client
├── components/              # Reusable components
├── context/                 # React context providers
├── lib/                     # Utilities and helpers
├── middlewares/             # Next.js middlewares
├── public/                  # Static assets
├── types/                   # TypeScript type definitions
├── .env.local              # Environment variables
├── .gitignore              # Git ignore rules
├── components.json          # shadcn/ui config
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── postcss.config.mjs      # PostCSS config
├── README.md               # This file
└── tsconfig.json           # TypeScript config
```

## 🔧 Configuration

### API Integration

The app communicates with the backend through a single environment variable:

- `NEXT_PUBLIC_API_URL`: Base URL for all API requests

All API calls are centralized in `src/lib/api.ts` for easy maintenance.

## 🚢 Deployment

### Using Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings.


### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Fly.io
- AWS Amplify
- Cloudflare Pages
- Heroku

## 🧪 Development

### Code Quality

- **TypeScript**: Full type safety across the application
- **ESLint**: Configured for Next.js and TypeScript
- **Prettier**: Consistent code format

## 📝 Features Guide

### Authentication
- Navigate to `/auth/register` to create an account
- Navigate to `/auth/login` to sign in
- JWT tokens stored securely in httpOnly cookies

### Profile Management
- Upload profile photos (JPEG, PNG supported)
- Edit bio, age, and personal details

### Discovery & Matching
- Drag cards right to like, left to pass
- Automatic match notification when mutual like occurs
- Profiles never repeat once swiped

### Chat
- Real-time messaging
- Chat unlocked only after matching
- Message history persisted in database

### Match Management
- View all active matches
- Unmatch to remove chat access
- Filter by age 

## 🐛 Known Limitations

- No dark mode toggle (planned for future)
- No push notifications (planned for future)

## 📧 Support

For questions or issues, contact: launchpad@whitecloak.com

---

**WC Launchpad Builder Deadline: October 31, 2025, 11:59 PM