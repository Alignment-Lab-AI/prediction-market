# Prediction Market Pages Overview

## Global Components

### Header (components/Header.tsx)
- Purpose: Provide navigation and user account information
- Content:
  - Logo and platform name
  - Navigation links:
    - Home
    - Markets
    - Create Market (if user is whitelisted)
    - My Bets
  - Search bar for markets
  - User account section:
    - Connect Wallet button (if not connected)
    - User's balance
    - Dropdown menu with:
      - Profile link
      - My Bets link
      - Logout option

### Footer (components/Footer.tsx)
- Purpose: Provide additional links and information
- Content:
  - Copyright information
  - Links to:
    - About Us
    - Terms of Service
    - Privacy Policy
    - FAQ
  - Social media links
  - Newsletter signup (optional)

## 1. Home Page (index.tsx)
- Purpose: Introduce users to the platform and provide a quick overview
- Content:
  - Brief explanation of how the prediction market works
  - Featured or trending markets
  - Quick stats (total markets, total bets, total volume)
  - Call-to-action buttons (Explore Markets, Create Market)
  - Recent market resolutions or significant events

## 2. Markets Page (markets.tsx)
- Purpose: Allow users to browse and search all markets
- Content:
  - List of all markets with key information (question, end time, total volume)
  - Filters for market status (Active, Closed, Settled, Disputed)
  - Search functionality
  - Pagination or infinite scroll for large number of markets
  - Quick view of current probabilities for each market

## 3. Individual Market Page (market/[id].tsx)
- Purpose: Provide detailed information about a specific market and allow user interactions
- Content:
  - Market details (question, description, options, start/end time)
  - Current implied probabilities for each option
  - Betting interface:
    - Tab or toggle to switch between Market Order and Limit Order
    - Market Order Interface:
      - Simple interface showing stake amount, current probability, and potential winnings
      - "Buy Yes" and "Buy No" buttons for each option
    - Limit Order Interface:
      - Input for stake amount and desired odds
      - Orderbook display for each option (Yes and No):
        - List of open buy and sell orders
        - Depth chart visualization
  - User's current bets on this market
  - Market timeline (Active -> Closed -> Result Proposed -> Disputed -> Settled)
  - Result proposal interface (when market is closed)
  - Challenge proposal interface (when a result is proposed)
  - Voting interface (when market is disputed)
  - Market activity feed (recent trades, large bets, etc.)

## 4. Create Market Page (create-market.tsx)
- Purpose: Allow whitelisted users to create new markets
- Content:
  - Form with fields for all market parameters
  - Option to add multiple choices for the market
  - Settings for market duration, collateral amount, and reward amount
  - Preview of the market
  - Submission button (connects to Keplr for transaction)

## 5. My Bets Page (my-bets.tsx)
- Purpose: Show users their betting activity and allow redemption
- Content:
  - Summary of total bets, wins, losses, and current balance
  - List of user's active bets:
    - Market details
    - Bet details (amount, odds, potential winnings)
    - Option to cancel bet (if allowed)
  - List of user's past bets:
    - Market details
    - Bet outcome
    - Winnings (if any)
  - Redemption interface:
    - List of eligible bets for redemption
    - Batch redemption option for multiple winning bets
    - Redemption history

## 6. Admin Dashboard (admin-dashboard.tsx)
- Purpose: Provide admin functions
- Content:
  - Whitelist management interface:
    - Add/remove addresses from whitelist
    - View current whitelisted addresses
  - Market management:
    - List of all markets with quick actions (pause, close, cancel)
    - Ability to edit market parameters if needed
  - List of disputed markets requiring resolution:
    - Market details
    - Voting results
    - Interface to resolve voting and settle the market
  - Platform statistics and analytics
  - Fee management and treasury overview

## 7. User Profile Page (profile.tsx)
- Purpose: Allow users to view and manage their account
- Content:
  - User's Keplr wallet address
  - Account balance
  - Betting statistics (total bets, win rate, etc.)
  - Transaction history
  - Notification settings

## 8. FAQ and Help Page (faq.tsx)
- Purpose: Provide information and assistance to users
- Content:
  - Explanation of how prediction markets work
  - Guide on how to use the platform
  - FAQ section
  - Contact form for support


# Updated Prediction Market Project Directory Structure

```
prediction-market/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── markets/
│   │   │   └── page.tsx        # Markets list page
│   │   ├── market/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Individual market page
│   │   ├── create-market/
│   │   │   └── page.tsx        # Create market page
│   │   ├── my-bets/
│   │   │   └── page.tsx        # My bets page
│   │   ├── admin-dashboard/
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── profile/
│   │   │   └── page.tsx        # User profile page
│   │   └── faq/
│   │       └── page.tsx        # FAQ page
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── styles/
│   ├── utils/
│   │   ├── api.ts
│   │   └── web3.ts
│   ├── hooks/
│   │   ├── useMarkets.ts
│   │   └── useBets.ts
│   └── contexts/
│       └── Web3Context.tsx
├── public/
├── package.json
└── tsconfig.json
```

Now, let's go through the purpose of each file and directory we've created:

src/components/:

Purpose: Contains reusable React components.
Header.tsx: The top navigation bar component.
Footer.tsx: The bottom footer component.
These components will be used across multiple pages for consistent layout.


src/app/:

Purpose: Contains the main application pages and routes.
layout.tsx: The root layout component that wraps all pages.
page.tsx: The home page component.
(routes)/: A group of routes that share the same layout.

Each subdirectory (markets/, market/[id]/, etc.) represents a route in your application.
page.tsx in each subdirectory is the main component for that route.




src/utils/:

Purpose: Contains utility functions and helpers.
api.ts: Will contain functions for making API calls to your backend.
web3.ts: Will contain functions for interacting with the blockchain and smart contracts.


src/hooks/:

Purpose: Contains custom React hooks for reusable logic.
useMarkets.ts: A hook for fetching and managing market data.
useBets.ts: A hook for fetching and managing bet data.


src/contexts/:

Purpose: Contains React context providers for global state management.
Web3Context.tsx: Will provide Web3 connection state and functions to the entire app.



How these will work together:

The layout.tsx file sets up the overall structure of your app, including the ChakraProvider for styling, and the Header and Footer components.
Each page.tsx file in the app/ directory and its subdirectories represents a different route in your application. These will use the components, hooks, and utilities to render the page content.
Components like Header and Footer will be reused across all pages due to their inclusion in the root layout.
Custom hooks (useMarkets, useBets) will be used within your page components to fetch and manage data.
The Web3Context will wrap your application (you'll need to add this to layout.tsx) to provide Web3 functionality throughout the app.
Utility functions in api.ts and web3.ts will be called from within your components or hooks to interact with your backend and the blockchain.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.