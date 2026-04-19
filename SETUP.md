# DayWise App - Complete Setup Guide

## Prerequisites

- **Node.js**: v22 or higher
- **pnpm**: v10+ ([install here](https://pnpm.io/installation))
- **MySQL/TiDB Database**: A running MySQL or TiDB instance
- **Manus OAuth Account**: For authentication ([get one here](https://manus.im))
- **Forge API Key**: For AI advice generation (provided by Manus)

## Quick Start

### 1. Clone & Install Dependencies

```bash
cd daywise-app-main
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with:

```env
# Database
DATABASE_URL=mysql://root:password@localhost:3306/daywise_db

# JWT Secret (generate a strong random string, min 32 chars)
JWT_SECRET=your_secure_random_jwt_secret_key_here

# Manus OAuth (get from your Manus dashboard)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://app.manus.im

# AI/LLM Integration (provided by Manus)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# Optional
NODE_ENV=development
PORT=3000
```

### 3. Initialize Database

```bash
# Generate and run migrations
pnpm db:push
```

Or manually:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at: **http://localhost:3000**

### 5. Production Build

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Architecture Overview

```
Frontend (React 19)          Backend (Node/Express)       Database (MySQL)
├── client/                  ├── server/                  └── Drizzle ORM
│  ├── pages/               │  ├── _core/                    └── Tables:
│  │  ├── Auth.tsx          │  │  ├── oauth.ts                 - users
│  │  ├── ProfilePicker     │  │  ├── llm.ts                   - profiles
│  │  ├── Questionnaire     │  │  └── context.ts               - questionnaire_answers
│  │  └── Dashboard         │  ├── routers.ts                  - color_palettes
│  └── components/          │  ├── db.ts                       - user_preferences
└── vite.config.ts          └── _core/index.ts
```

## Key Features & How They Work

### 1. Authentication (Manus OAuth)
- User clicks "Sign In with Manus" on Auth page
- Redirected to Manus OAuth portal
- After approval, callback to `/api/oauth/callback`
- JWT session token created and stored in secure cookie
- User profile auto-created on first login

### 2. Multi-Profile Support
- Each user can create multiple "profiles" (e.g., "Work Me", "Gym Me")
- Each profile has its own:
  - Questionnaire answers (preferences)
  - AI advice history
  - Color palette preference

### 3. Onboarding Questionnaire
- 10-question form to understand user preferences
- Covers: age, gender, diet, style, health, climate, budget, sleep, interests
- Answers stored per profile
- Required before AI advice can be generated

### 4. AI-Powered Dashboard
- 8 decision categories:
  - What to Wear (outfit suggestions)
  - What to Eat (meal recommendations)
  - Today's Activity (exercise ideas)
  - Mood Boost (wellness tips)
  - Productivity Tip (focus strategies)
  - Social Plan (connection ideas)
  - Buy or Not Buy (purchase advice)
  - Self-Care (wellness routines)
- Select categories → Click "Get Advice"
- AI generates personalized recommendations based on profile preferences
- Fallback mock responses if LLM is unavailable

### 5. Color Palette Customization
- Create custom color palettes with color picker
- Save palettes to database
- Apply any saved palette to update app theme
- Palette choice persisted per user

## API Routes (tRPC)

All endpoints use `/api/trpc` prefix with tRPC protocol.

### Authentication
- `auth.me` - Get current authenticated user
- `auth.logout` - Sign out and clear session

### Profiles
- `profiles.list` - Get all user profiles
- `profiles.create` - Create new profile
- `profiles.update` - Update profile name/emoji
- `profiles.delete` - Delete profile

### Questionnaire
- `questionnaire.save` - Save preference answers
- `questionnaire.get` - Retrieve saved answers

### AI Advice
- `advice.generate` - Generate personalized advice

### Color Palettes
- `palettes.list` - Get saved palettes
- `palettes.create` - Create new palette
- `palettes.update` - Update palette colors
- `palettes.delete` - Delete palette

### Preferences
- `preferences.get` - Get user preferences
- `preferences.update` - Update selected palette/theme

## Troubleshooting

### Database Connection Error
```
Error: "Database not available"
```
**Solution**: Check `DATABASE_URL` in `.env.local` is correct and database is running.

### LLM Advice Returns Mock Response
- LLM is falling back to mock response (still works, just not AI-generated)
- Check `BUILT_IN_FORGE_API_KEY` is set and valid
- Verify `BUILT_IN_FORGE_API_URL` is accessible

### OAuth Sign-In Loop
- Verify `VITE_APP_ID` matches your Manus app configuration
- Check redirect URI is correct: `http://localhost:3000/api/oauth/callback`
- Ensure `VITE_OAUTH_PORTAL_URL` and `OAUTH_SERVER_URL` are correct

### Port Already in Use
```bash
# Use a different port
PORT=3001 pnpm dev
```

### TypeScript Errors
```bash
# Run type checking
pnpm check

# Format code
pnpm format
```

## Development Commands

```bash
# Run development server
pnpm dev

# Type checking
pnpm check

# Format code with Prettier
pnpm format

# Run tests
pnpm test

# Build for production
pnpm build

# Start production build
pnpm start

# Database migrations
pnpm db:push
```

## Project Structure

```
daywise-app/
├── client/                  # React frontend
│  ├── src/
│  │  ├── pages/            # Page components (Auth, Dashboard, etc)
│  │  ├── components/       # Reusable UI components
│  │  ├── lib/              # Utilities (tRPC client, etc)
│  │  ├── contexts/         # React contexts (Theme, etc)
│  │  ├── _core/            # Core hooks and utilities
│  │  ├── App.tsx           # Main app component
│  │  └── main.tsx          # Entry point
│  └── public/              # Static assets
├── server/                  # Node/Express backend
│  ├── _core/               # Core utilities
│  │  ├── index.ts          # Express server setup
│  │  ├── oauth.ts          # OAuth flow
│  │  ├── llm.ts            # LLM integration
│  │  ├── context.ts        # tRPC context
│  │  └── ...
│  ├── routers.ts           # tRPC procedure definitions
│  ├── db.ts                # Database queries
│  └── auth.logout.test.ts  # Tests
├── drizzle/                # Database schema & migrations
│  ├── schema.ts            # Table definitions
│  └── migrations/          # SQL migrations
├── shared/                 # Shared code
│  ├── types.ts             # Type definitions
│  ├── const.ts             # Constants
│  └── _core/               # Core shared utilities
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite build config
├── vitest.config.ts        # Test config
├── .env.example            # Environment variables template
├── .env.local              # Local environment (DO NOT COMMIT)
└── README.md               # Documentation
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Vite
- **Backend**: Node.js, Express, tRPC, Drizzle ORM
- **Database**: MySQL/TiDB
- **Authentication**: Manus OAuth, JWT
- **AI**: Claude API via Forge proxy
- **Styling**: Tailwind CSS with custom theme system
- **HTTP Client**: Axios (for OAuth), fetch (for LLM)
- **Form Handling**: React Hook Form, Zod validation
- **Routing**: Wouter (lightweight)
- **State Management**: React Query (tRPC)
- **Notifications**: Sonner (toast notifications)

## Next Steps

1. **Customize Theme**: Edit `client/src/contexts/ThemeContext.tsx` to change colors
2. **Add More Categories**: Add more decision categories in `Dashboard.tsx`
3. **Deploy**: See README.md deployment section
4. **Extend Features**: Add analytics, export history, sharing, etc.

## Support

For issues, see the troubleshooting section above or open an issue on GitHub.

---

**Happy coding! 🚀**