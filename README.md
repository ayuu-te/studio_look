# Photo Share App

A minimal, clean platform for photographers to upload, share, collect selections, comment, and deliver photos to clients quickly. Think "Google Drive clone + selection + Pinterest-style gallery" designed specifically for photography workflows.

## Problem
Photographers shoot hundreds of photos, but clients need only a subset. Using Google Drive/email is messy, slow, and frustrating.

## Solution
A focused web app for uploading, selecting, commenting, and delivering photos seamlessly.

## Core Personas
- Photographer (Admin)
- Client (Gallery)

## Roadmap
1. Authentication & Access
   - Secure login/signup (email + password; later Google login)
   - Roles: Photographer (Admin) and Client (Gallery)
2. Photographer Dashboard
   - Create/manage projects and folders
   - Upload unlimited files; edit, delete, add anytime
   - Search via metadata (name, date, size, camera data)
   - Filters: selected, rejected, pending, date, type
   - Mood board functionality for visual references
3. Client Gallery (Pinterest-style)
   - Access via secure sharable link; must sign up/login
   - Grid view with Select/Reject/Pending toggle
   - Inline commenting + threaded replies
   - Bulk actions: select/reject multiple images
   - Search & filter same as photographer
   - "Mark as Complete" → notifies photographer
4. Selection & Collaboration Tools
   - Activity Timeline: track client actions
   - Selection Summary Report: auto-generate choices
   - Watermark Protection: optional watermarks until delivery
   - Custom Client Branding: logos, brand colors, welcome message
   - Comment threads under image-specific notes
5. Delivery & Download Management
   - After selections: photographer uploads final folder
   - Generate secure download link
   - Clients can download in multiple formats/sizes (web-ready, high-res)
6. Advanced Features (AI + Analytics)
   - Automated Culling & Smart Tags: AI auto-tags (smiling, outdoor, etc.) + first-pass selection suggestions
   - Analytics Dashboard: track most-viewed photos, time spent, client engagement
7. Responsive Design
   - Fully responsive, optimized for desktop, tablet, mobile

## Build Order
- Authentication (roles)
- Photographer dashboard (projects, folders, uploads)
- Client gallery (Pinterest-style + selection/comments)
- Search & filter system
- Notifications (completion)
- Collaboration tools (bulk, watermark, mood board)
- Delivery (final folder + secure downloads)
- AI & analytics features
- Custom branding + polish
- Responsive mobile-first UI

## Tech Stack (initial)
- Frontend: React + TypeScript + Vite
- Backend: Node.js (Express) + TypeScript
- Package manager: npm (or pnpm/yarn if preferred)

## Getting Started
Prerequisites: Node.js 18+

Install dependencies:
- Frontend: `cd frontend && npm install`
- Backend: `cd backend && npm install`

Development:
- Frontend: `npm run dev`
- Backend: `npm run dev`

Build:
- Frontend: `npm run build`
- Backend: `npm run build`

## Monorepo Layout
- `frontend/` — React app (Vite)
- `backend/` — API server (Express)
- `docs/` — specifications and notes
- `database/` — schemas/migrations (future)
- `deployment/` — infra configs (future)

