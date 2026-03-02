# Resonate Client

React-based frontend for the Resonate Health fitness and wellness platform.

## Features

- 🏠 **Dashboard** - User profile, stats, weekly trends
- 🏋️ **Workouts** - AI-generated workout plans
- 🥗 **Nutrition** - Daily meal plans and food analysis
- 📊 **Diagnostics** - Blood report parsing and biomarker tracking
- 📱 **Mobile-first** - Responsive design with bottom navigation

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router 7
- **Styling**: TailwindCSS 3
- **Auth**: Firebase Authentication
- **Icons**: Lucide React

## Project Structure

```
Resonate-Client/
├── src/
│   ├── components/
│   │   ├── nav/           # Navigation components
│   │   │   ├── DesktopNav.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── UserDropdown.jsx
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── StatsGrid.jsx
│   │   │   ├── GoalCard.jsx
│   │   │   ├── ProfileForm.jsx
│   │   │   └── ProfileDisplay.jsx
│   │   ├── Navbar.jsx
│   │   ├── WeeklyTrends.jsx
│   │   └── DailyCheckInModal.jsx
│   ├── pages/             # Page components
│   ├── App.jsx            # Main app with routing
│   ├── api.js             # API utilities
│   ├── firebase.js        # Firebase config
│   └── index.css          # Global styles
├── public/
├── package.json
└── vite.config.js
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   VITE_API_MICROSERVICE_URL=http://localhost:10000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Component Architecture

### Navigation Components (`/components/nav/`)
- **DesktopNav** - Desktop header navigation with dropdown menus
- **MobileMenu** - Slide-out menu for mobile
- **BottomNav** - Fixed bottom navigation bar
- **UserDropdown** - User profile dropdown

### UI Components (`/components/ui/`)
- **ProfileHeader** - Welcome message and avatar
- **StatsGrid** - Age, weight, BMI, height cards
- **GoalCard** - Current fitness goal display
- **ProfileForm** - Edit profile form
- **ProfileDisplay** - Read-only profile view

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Server API URL |
| `VITE_API_MICROSERVICE_URL` | Yes | Microservice URL |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |

## License

Proprietary - Resonate Health
