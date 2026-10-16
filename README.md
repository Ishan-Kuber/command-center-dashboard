# Team 5C – Command Center Dashboard

Real-time analytics dashboard for monitoring Team 5B edge devices.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- MQTT
- WebSocket
- Leaflet
- Recharts
- Zustand

## Project Structure

```text
command-center-dashboard/
│
├── public/
│   ├── favicon.ico
│   ├── images/
│   └── assets/
│
├── src/
│   │
│   ├── app/                         # Next.js application and routes
│   │   ├── layout.tsx               # Root layout, fonts, global providers
│   │   ├── page.tsx                 # Main command center dashboard
│   │   ├── globals.css              # Global styles and Tailwind
│   │   ├── loading.tsx              # Loading UI
│   │   ├── error.tsx                # Error boundary UI
│   │   └── api/                     # Optional backend API routes
│   │       └── ...
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── navigation.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── overview-cards.tsx
│   │   │   ├── device-status.tsx
│   │   │   ├── telemetry-chart.tsx
│   │   │   ├── alerts-panel.tsx
│   │   │   └── activity-feed.tsx
│   │   │
│   │   ├── devices/
│   │   │   ├── device-list.tsx
│   │   │   ├── device-card.tsx
│   │   │   └── device-details.tsx
│   │   │
│   │   ├── telemetry/
│   │   │   ├── telemetry-chart.tsx
│   │   │   ├── metric-card.tsx
│   │   │   └── telemetry-table.tsx
│   │   │
│   │   ├── alerts/
│   │   │   ├── alert-list.tsx
│   │   │   ├── alert-card.tsx
│   │   │   └── alert-filters.tsx
│   │   │
│   │   └── map/
│   │       ├── device-map.tsx
│   │       └── map-markers.tsx
│   │
│   └── lib/                         # Application logic and utilities
│       │
│       ├── aggregation/
│       │   ├── aggregate-metrics.ts
│       │   └── calculate-statistics.ts
│       │
│       ├── alerts/
│       │   ├── alert-rules.ts
│       │   ├── alert-service.ts
│       │   └── alert-types.ts
│       │
│       ├── devices/
│       │   ├── device-service.ts
│       │   ├── device-types.ts
│       │   └── device-status.ts
│       │
│       ├── map/
│       │   ├── map-config.ts
│       │   └── map-utils.ts
│       │
│       ├── telemetry/
│       │   ├── mqtt-client.ts
│       │   ├── websocket-client.ts
│       │   ├── telemetry-service.ts
│       │   └── telemetry-types.ts
│       │
│       ├── store/
│       │   └── dashboard-store.ts
│       │
│       └── utils.ts
│
├── .gitignore
├── README.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```
