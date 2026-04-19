# DayWise - AI-Powered Daily Decision Maker

✅ **Production-ready full-stack application** - All features implemented and tested

A personalized web application that provides AI-powered advice for everyday decisions like what to wear, eat, do, and more. Each user can create multiple profiles with custom preferences, and DayWise learns from their profile to deliver tailored recommendations.

## Features

### 1. **User Authentication**
- Secure sign-in and sign-up via Manus OAuth
- Session-based authentication with JWT tokens
- Automatic user profile creation on first login

### 2. **Multi-Profile Support**
- Create multiple profiles per account (e.g., "Work Me", "Weekend Me")
- Each profile has a custom emoji avatar
- Easy profile switching and deletion
- Independent preference storage per profile

### 3. **Onboarding Questionnaire**
- 10-question preference questionnaire covering:
  - Demographics (age, gender, lifestyle)
  - Diet preferences
  - Fashion style
  - Health goals
  - Climate/location
  - Budget mindset
  - Sleep patterns
  - Interests
- Visual progress tracking with progress bar
- Step-by-step navigation with back/next buttons
- Answers stored securely in database

### 4. **AI-Powered Dashboard**
- Personalized greeting with current date
- 8 decision categories:
  - **What to Wear** - Outfit suggestions
  - **What to Eat** - Meal recommendations
  - **Today's Activity** - Exercise/activity ideas
  - **Mood Boost** - Mood-lifting tips
  - **Productivity Tip** - Focus strategies
  - **Social Plan** - Connection ideas
  - **Buy or Not Buy** - Purchase decision help
  - **Self-Care** - Wellness routines
- Multi-select category interface
- Real-time AI advice generation (via Claude/Forge API)
- Per-category advice regeneration
- Fallback mock responses for development
- Loading states and error handling

### 5. **Color Palette Customization** ✨ *[FULLY IMPLEMENTED]*
- Create custom color palettes with live color picker
- Preset palettes (Ocean Blue, Forest Green, Sunset)
- Save palettes to database
- Apply saved palettes to dynamically update app theme
- Palette preference persisted per user
- CSS variable system for dynamic theming
- Hex color input for precise customization

### 6. **Responsive Design**
- Mobile-first responsive layout
- Works seamlessly on phones, tablets, and desktops
- Smooth animations and transitions
- Accessible UI components
- Dark theme optimized for eye comfort

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end type-safe API
- **Vite** - Build tool

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime
- **tRPC** - API layer
- **Drizzle ORM** - Database ORM

### Database
- **MySQL/TiDB** - Data persistence
- Drizzle migrations for schema management

### AI Integration
- **Claude API** - LLM for advice generation
- Forge API proxy for seamless integration
- Fallback mock responses for development

### Authentication
- **Manus OAuth** - User authentication
- **JWT** - Session management

## Project Structure

```
daywise-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Auth.tsx
│   │   │   ├── ProfilePicker.tsx
│   │   │   ├── Questionnaire.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                 # Backend Express application
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database queries
│   └── _core/             # Core framework files
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Table definitions
│   └── migrations/        # SQL migration files
├── shared/                # Shared types and constants
└── package.json           # Dependencies and scripts
```

## Database Schema

### Tables
- **users** - User accounts (from Manus OAuth)
- **profiles** - User profiles with emoji avatars
- **questionnaire_answers** - Stored preference answers
- **color_palettes** - Custom color palettes
- **user_preferences** - User settings and preferences

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database
- Manus account for OAuth

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dchanda29/daywise-app.git
cd daywise-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env.local and update values:
cp .env.example .env.local

# Required environment variables:
DATABASE_URL=mysql://user:password@host:3306/daywise_db
JWT_SECRET=your_jwt_secret_key_min_32_chars
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://app.manus.im

# LLM Configuration (for AI advice generation):
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
```

4. Run database migrations:
```bash
pnpm db:push
# or manually:
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. Start development server:
```bash
pnpm dev
```

6. Open browser to `http://localhost:3000`

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Starting Production Server
```bash
pnpm start
```

### Type Checking
```bash
pnpm check
```

### Code Formatting
```bash
pnpm format
```

## API Endpoints

All API endpoints are under `/api/trpc` and use tRPC protocol.

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Sign out user

### Profiles
- `profiles.list` - Get all profiles for user
- `profiles.create` - Create new profile
- `profiles.update` - Update profile
- `profiles.delete` - Delete profile

### Questionnaire
- `questionnaire.save` - Save answers
- `questionnaire.get` - Get answers for profile

### AI Advice
- `advice.generate` - Generate AI advice for categories

### Color Palettes
- `palettes.list` - Get user's palettes
- `palettes.create` - Create new palette
- `palettes.update` - Update palette
- `palettes.delete` - Delete palette

### Preferences
- `preferences.get` - Get user preferences
- `preferences.update` - Update preferences

## Design Philosophy

DayWise is built with the following principles:

1. **Personalization** - Every recommendation is tailored to the user's profile
2. **Simplicity** - Clean, intuitive interface with minimal friction
3. **Speed** - Fast advice generation and responsive interactions
4. **Accessibility** - WCAG compliant design for all users
5. **Privacy** - Secure data storage and OAuth-based authentication

## Color Palette

Default dark theme with accent colors:
- **Background** - #0D0D0F
- **Surface** - #16161A
- **Accent** - #F0C060 (warm gold)
- **Text** - #F0EDE6 (off-white)
- **Muted** - #7A7A8A (gray)

## Future Enhancements

- [ ] Export advice history
- [ ] Share profiles with others
- [ ] Advice scheduling and reminders
- [ ] Integration with calendar apps
- [ ] Mobile native apps
- [ ] Advanced analytics dashboard
- [ ] Community features and advice sharing
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feedback:
- Open an issue on GitHub
- See SETUP.md for comprehensive troubleshooting guide
- Contact: support@daywise.app

## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Powered by Claude AI for advice generation via Forge API
- Authentication via Manus OAuth
- UI components from shadcn/ui

---

**DayWise** - Making everyday decisions easier, one recommendation at a time. ✨