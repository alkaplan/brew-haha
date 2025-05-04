# BrewHaha: Coffee Tasting Web App

BrewHaha is an interactive web application designed for coffee tasting events, allowing users to taste, rate, and compare different coffee varieties while learning about flavor profiles.

## Features

- **User-friendly Coffee Tasting Flow**:
  - Simple user registration and onboarding
  - Guided tasting process with flavor tag selection
  - Coffee ranking and review system
  - Comprehensive results visualization

- **Interactive Results Page**:
  - Detailed tasting notes comparison between user selections and official tags
  - Medal table showing top-rated coffees with weighted scoring
  - Visual flavor analysis with charts and comparisons
  - Personal ranking highlights

- **Admin Dashboard**:
  - Coffee configuration and management
  - User data management
  - Flavor tag administration with CRUD operations
  - Detailed analytics and results reporting
  - Data export functionality

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Supabase (PostgreSQL + REST API)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with inline styling
- **Visualization**: Chart.js for data visualization
- **Deployment**: Vercel/Netlify (recommended)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd brew-haha
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Database Schema

The application requires the following tables in Supabase:

- `coffees` - Coffee information and official flavor tags
- `users` - User registration data
- `tastings` - User tasting notes for each coffee
- `reviews` - User rankings for coffees
- `flavor_tags` - Database of available flavor tags

## Key Pages

- `/` - Welcome and registration page
- `/choose` - Coffee selection page
- `/taste` - Tasting form with flavor tag selection
- `/review` - Final review and ranking page
- `/results` - Comprehensive results visualization
- `/admin` - Admin dashboard for data management

## License

[MIT](LICENSE)
