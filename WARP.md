# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a photo sharing application designed for photographer-client workflows. It enables photographers to upload photos, share them with clients for selection/review, and manage the delivery process. Think "Google Drive clone + selection + Pinterest-style gallery" specifically for photography workflows.

## Architecture
- **Monorepo structure** with separate frontend and backend packages
- **Frontend**: React + TypeScript + Vite (React 18+ with modern JSX transform)
- **Backend**: Node.js + Express + TypeScript (ES modules)
- **Target**: Node.js 18+ for both frontend and backend
- **Module system**: ES modules throughout (type: "module" in package.json)

## Core Components Structure
- `frontend/src/widgets/` - Main React components (current: App.tsx)
- `backend/src/` - Main server code (current: Express app with health endpoint)
- `backend/config/` - Configuration files
- `backend/controllers/` - Route handlers
- `backend/middleware/` - Express middleware
- `backend/models/` - Data models
- `backend/routes/` - API routes
- `backend/services/` - Business logic
- `backend/utils/` - Utility functions

## Development Commands

### Frontend (from frontend/ directory)
- Start development server: `npm run dev` (uses Vite)
- Build for production: `npm run build` (TypeScript check + Vite build)
- Preview production build: `npm run preview`

### Backend (from backend/ directory)
- Start development server: `npm run dev` (uses ts-node-dev with auto-reload)
- Build for production: `npm run build` (TypeScript compilation to dist/)
- Start production server: `npm run start` (runs compiled dist/index.js)
- Type check only: `npm run typecheck`

### Full Stack Development
Run both servers simultaneously:
1. Terminal 1: `cd frontend && npm run dev`
2. Terminal 2: `cd backend && npm run dev`

Frontend serves on default Vite port, backend on port 4000 (configurable via PORT env var).

## Code Standards
- **Formatting**: Prettier configured with single quotes, semicolons, 100 char width, trailing commas
- **Editor**: EditorConfig for consistent spacing (2 spaces, LF line endings, UTF-8)
- **TypeScript**: Strict mode enabled, modern ES2022 target
- **React**: Uses modern function components with hooks, React.StrictMode enabled

## Key Development Notes
- Backend uses ES modules with bundler module resolution
- Frontend uses React 18 JSX transform (no React import needed in components)
- TypeScript compilation outputs to dist/ directories
- Development uses hot reload (Vite for frontend, ts-node-dev for backend)
- Environment variables loaded from .env files (see .env.example)

## Planned Features (from roadmap)
1. Authentication system (roles: Photographer/Admin, Client/Gallery)
2. Project and folder management
3. Pinterest-style photo gallery
4. Selection system (Select/Reject/Pending)
5. Commenting and collaboration tools
6. Delivery and download management
7. AI features (auto-culling, smart tags)
8. Mobile-responsive design

## Current Implementation Status
The application now includes all core features:

### Completed Features
- **Authentication System**: Email/password login, signup, role-based access (photographer/client)
- **Project Management**: Create, view, share, and manage photo projects
- **Photo Gallery**: Pinterest-style grid with folder organization
- **Selection System**: Select/Reject/Pending workflow with bulk actions
- **Comments System**: Threaded commenting on individual photos
- **Client Access**: Secure share tokens for client gallery access
- **Status Management**: Draft → Shared → Completed workflow
- **Search & Filters**: Filter by folder, selection status, and metadata

### API Endpoints Available
- `/api/auth/*` - Authentication (login, signup, logout, user info)
- `/api/projects/*` - Project CRUD and folder management  
- `/api/gallery/*` - Client gallery access and selection management
- `/api/comments/*` - Photo commenting system

### Demo Data
- Photographer: `photographer@example.com` / `password123`
- Client: `client@example.com` / `password123`  
- Demo gallery: `/gallery/share-wedding-smith-2024`

## File Upload Architecture (planned)
Future enhancements will include file upload capabilities, metadata extraction, watermarking, and multiple format delivery. Consider implementing chunked uploads and background processing for production builds.
