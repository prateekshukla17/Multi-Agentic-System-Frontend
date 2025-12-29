# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React + TypeScript frontend application built with Vite and Mantine UI components. It implements a multi-agent chat interface that connects to a backend WebSocket server (Socket.IO) and includes HR Assistant, IT Assistant, and Image-Generator agents.

## Commands

### Development
- `npm run dev` - Start Vite dev server (default: http://localhost:5173)
- `npm run preview` - Preview production build locally

### Building
- `npm run build` - Type check with TypeScript, then build production bundle

### Testing & Quality
- `npm run test` - Run full test suite (typecheck + prettier + lint + vitest + build)
- `npm run vitest` - Run vitest tests once
- `npm run vitest:watch` - Run vitest in watch mode
- `npm run typecheck` - Type check without emitting files
- `npm run lint` - Run both ESLint and Stylelint
- `npm run eslint` - Run ESLint only (with cache)
- `npm run stylelint` - Run Stylelint on CSS files (with cache)
- `npm run prettier` - Check code formatting
- `npm run prettier:write` - Auto-format all TS/TSX files

### Storybook
- `npm run storybook` - Start Storybook dev server on port 6006
- `npm run storybook:build` - Build static Storybook to `storybook-static/`

### Package Manager
Uses Yarn 4.12.0 (configured via packageManager field)

## Architecture

### Tech Stack
- **UI Framework**: React 19 with TypeScript
- **Component Library**: Mantine v8 (core + hooks)
- **Build Tool**: Vite 7 with @vitejs/plugin-react
- **Routing**: react-router-dom v7 (BrowserRouter)
- **Real-time Communication**: Socket.IO Client v4
- **Testing**: Vitest + React Testing Library + jsdom
- **Code Quality**: ESLint (with mantine config) + Stylelint + Prettier
- **Documentation**: Storybook 10

### Application Structure

**Entry Point**: `src/main.tsx` → `src/App.tsx` → `src/Router.tsx`

**Routing** (defined in `src/Router.tsx`):
- `/` - Home page with Welcome component and theme toggle
- `/help` - Help page (with nested `/help/hr` route for HR-specific help)
- `/chat` - Main chat interface for multi-agent interaction

**Key Architectural Patterns**:
- **Centralized Theme**: All Mantine theme customizations go in `src/theme.ts`
- **MantineProvider Wrapper**: App-level provider wraps entire Router with theme config
- **CSS Modules**: Components use `.module.css` files (e.g., `ChatInterface.module.css`)
- **Path Aliases**: `@/*` maps to `src/*`, `@test-utils` maps to `test-utils/` (defined in tsconfig.json)

### Chat Interface Architecture

The `src/components/chatInterface/chatInterface.tsx` component is the core of the application:

**WebSocket Connection**:
- Connects to `http://localhost:3000` using Socket.IO websocket transport
- Backend server must be running separately on port 3000

**Socket Events**:
- **Emits**: `send_message` with `{ message: string }`
- **Listens for**:
  - `connect` / `disconnect` / `connect_error` - Connection state
  - `receive_message` - Assistant responses with `{ content, agent?, imageUrl? }`
  - `status` - Triggers typing indicator
  - `error` - Error messages from backend

**Message Flow**:
1. User submits message via TextInput
2. Message added to local state immediately
3. Socket emits to backend
4. Typing indicator shown
5. Backend responds via `receive_message` event
6. Assistant message (with optional agent type and image) added to state
7. Auto-scroll to latest message

**Agent Types** (from backend):
- HR Assistant
- IT Assistant
- Image-Generator (includes `imageUrl` in response)

### Testing Infrastructure

**Test Utils** (`test-utils/`):
- Custom `render()` wrapper that provides MantineProvider with theme
- Import via `@test-utils` alias
- Vitest setup mocks DOM APIs (matchMedia, ResizeObserver, scrollIntoView)

**Test Configuration**:
- Vitest runs in jsdom environment
- Global test utilities available
- Setup file: `vitest.setup.mjs`
- Jest-DOM matchers included

### Code Style Conventions

**Import Order** (enforced by Prettier):
1. CSS imports (styles.css files)
2. React, Next.js built-ins
3. Node built-in modules
4. Third-party packages
5. @mantine packages
6. Local @/* imports
7. Relative imports (../, ./)
8. CSS module imports

**File Naming**:
- Components: PascalCase with `.tsx` extension
- Pages: `*.page.tsx` pattern
- Stories: `*.story.tsx` pattern
- Tests: `*.test.tsx` pattern
- CSS Modules: `*.module.css`

**TypeScript**:
- Strict mode enabled
- Target: ESNext with bundler module resolution
- No JS files allowed (allowJs: false)
- Path aliases configured for cleaner imports

### Styling

**PostCSS Configuration**:
- Uses `postcss-preset-mantine` for Mantine-specific transformations
- Custom breakpoint variables defined in `postcss.config.cjs`:
  - xs: 36em, sm: 48em, md: 62em, lg: 75em, xl: 88em
- CSS variables available in CSS modules

**Mantine Styling**:
- Import `@mantine/core/styles.css` at app level (done in App.tsx)
- Use Mantine components with inline style props or CSS modules
- Theme customizations in `src/theme.ts`

## Development Notes

### Backend Dependency
The chat interface requires a separate backend server running on `localhost:3000` with Socket.IO support. The frontend will show a connection error alert if the backend is not available.

### Storybook Console Logging
ESLint's no-console rule is disabled for `*.story.tsx` files to allow console usage in Storybook stories.

### ESLint Ignores
All `.mjs`, `.cjs`, `.js`, `.d.ts`, and `.d.mts` files are ignored by ESLint (configured in eslint.config.js).
