# Cluster Conductor

## Overview

Cluster Conductor is an interactive 3D game that teaches Kubernetes orchestration concepts. Players schedule pods onto nodes by clicking and dragging, learning container orchestration through hands-on gameplay. Built as a full-stack TypeScript application with a React Three Fiber 3D frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe UI development
- **React Three Fiber** for 3D WebGL rendering with Three.js
- **@react-three/drei** for pre-built 3D components and helpers
- **@react-three/postprocessing** for visual effects
- **Zustand** for lightweight state management (game state, audio state)
- **TailwindCSS** with dark theme for styling the UI overlay
- **Radix UI** components via shadcn/ui for accessible UI primitives
- **Vite** as the build tool with HMR support and GLSL shader loading

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations with PostgreSQL
- **In-memory storage** as default with interface for database swap
- Development uses Vite middleware for HMR; production serves static files

### Project Structure
```
client/           # React frontend
  src/
    game/         # 3D game components (Scene, Node, Pod, Player, UI)
    lib/stores/   # Zustand state stores
    components/   # UI components (shadcn/ui)
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Data storage interface
shared/           # Shared types and schema
  schema.ts       # Drizzle database schema
```

### Key Design Patterns
- **Storage Interface Pattern**: `IStorage` interface in `server/storage.ts` allows swapping between in-memory and database storage
- **Component-based 3D**: Each game element (Pod, Node, Player) is a separate React component
- **State Separation**: Game logic in `useGame` store, audio in `useAudio` store
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared directory

## External Dependencies

### Database
- **PostgreSQL** via Drizzle ORM (configured in `drizzle.config.ts`)
- Schema defines users table with id, username, password
- Environment variable: `DATABASE_URL` required for database connection

### Build & Development
- **Vite** for frontend bundling with React plugin
- **esbuild** for server bundling in production
- **tsx** for TypeScript execution in development

### Audio
- Sound files expected in `/client/public/sounds/` (background.mp3, hit.mp3, success.mp3)

### Fonts
- Inter font via `@fontsource/inter`
- 3D text font file at `/client/public/fonts/inter.json`