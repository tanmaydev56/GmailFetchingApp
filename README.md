# Email Archive Manager

A Next.js application for efficient email management with Gmail API integration, attachment handling, Neon PostgreSQL database, and secure OAuth 2.0 authentication.

![App Screenshot](https://github.com/user-attachments/assets/f828b600-96ae-477d-bbbc-854f26aa5626)
## Features

- **Email Management**
  - View and organize your email archive
  - Efficient email processing interface
  - Clean, user-friendly dashboard
  - Persistent storage with Neon PostgreSQL

- **Attachment Handling**
  - Fetch and download email attachments
  - Store attachments metadata in database
  - Integrated with Google Drive API
  - Attachment content stored in Neon database

- **Secure Authentication**
  - OAuth 2.0 implementation
  - Google Sign-In integration
  - Protected routes and sessions

## Technologies Used

- **Frontend**
  - Next.js 15 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS v2.0

- **Backend**
  - Next.js API Routes
  - Google APIs:
    - Gmail API
    - Google Drive API
    - OAuth 2.0
  - Neon PostgreSQL (Serverless Postgres)

- **Database**
  - Neon.tech PostgreSQL
  - Prisma ORM
  - Email and attachment metadata storage

- **Authentication**
  - Next-Auth.js
  - Google OAuth Provider

## Getting Started

### Prerequisites

- Node.js 16+
- Google Cloud Platform project with:
  - Gmail API enabled
  - Google Drive API enabled
  - OAuth 2.0 credentials configured
- Neon.tech database account
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/email-archive-manager.git
   cd email-archive-manager
   ```
2. Install dependencies
   ```bash
   npm install
# or
yarn install
```
3.Set up environment variables:
Create a .env.local file with your credentials:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Neon Database
DATABASE_URL=postgres://user:password@ep-cool-water-123456.us-east-2.aws.neon.tech/neondb
```
## Setup Database(optional)
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Run the development server
```bash
npm run dev
```
## Configuration
# Google APIs Setup
Go to Google Cloud Console

Create a new project or select an existing one

Enable "Gmail API" and "Google Drive API"

Configure OAuth consent screen

Create OAuth 2.0 credentials

Add authorized redirect URIs (e.g., http://localhost:3000/api/auth/callback/google)

# Neon Database Setup
Create a free account at Neon.tech

Create a new PostgreSQL project

Copy your connection string (add to .env.local)

Set up database schema using Prisma migrations

# Deployment
Vercel (Recommended for Next.js):

Connect your GitHub repository

Add all environment variables

Enable automatic deployments

# Neon Production Database:

Create a production branch in Neon

Update connection string in production environment
