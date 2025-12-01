# EverGo Holistic Review & Roadmap

## Executive Summary
EverGo has a strong technical foundation and a rich feature set for an MVP. The social, gamification, and monetization layers are well-integrated. However, for a sports/fitness application, it currently lacks some "table stakes" features like interactive maps and automated data ingestion, and the search functionality is currently cosmetic.

## Current State Analysis

### Strengths
- **Architecture**: Modern stack (Next.js 15, Prisma, SQLite) ensures performance and developer velocity.
- **UI/UX**: Consistent design system, responsive layout, and "native-like" feel on mobile (PWA).
- **Feature Breadth**: Covers all major pillars: Activity Tracking, Social, Gamification, and Monetization.
- **Code Quality**: Modular components, strong typing, and clean separation of concerns.

### Critical Gaps
1.  **Search Functionality**: The search bar in the header is non-functional. Users cannot search for friends, teams, or challenges.
2.  **Interactive Maps**: Activities currently rely on static image URLs. Users expect interactive maps to zoom/pan their routes.
3.  **Data Ingestion**: Activities must be manually entered. This is high friction. Competitors offer wearable integration (Garmin/Apple) or GPX import.
4.  **Onboarding**: New users drop into the app without setting preferences or goals.

## Recommendations & Roadmap

### Phase 1: Core Experience Polish (Immediate)
-   **Implement Global Search**: Make the header search bar functional. It should search Users, Teams, and Challenges.
-   **Interactive Maps**: Integrate `react-leaflet` (OpenStreetMap) to visualize activity routes.
-   **Activity Detail Page**: Enhance the activity view with splits, elevation graphs, and the map.

### Phase 2: Friction Reduction (Short-term)
-   **GPX File Import**: Allow users to upload a `.gpx` file to automatically create an activity with route data.
-   **Onboarding Flow**: A 3-step wizard to set Profile Photo, Primary Sport, and First Goal.

### Phase 3: Advanced Features (Long-term)
-   **Real-time Chat**: Upgrade the Team Chat to use WebSockets (Pusher or Socket.io) for real-time messaging.
-   **Wearable Integration**: Connect with Strava/Garmin APIs.

## Proposed Next Steps
I recommend we tackle **Phase 1** immediately to make the app feel complete.

1.  **Fix Search**: Create a `/api/search` endpoint and a search results dropdown.
2.  **Add Maps**: Install `leaflet` and `react-leaflet` and add a map view to the Activity Card.
