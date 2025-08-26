# Copilot Instructions for Deal Hunter App
## Core Engineering Principles (CodeArchitect)
- **Code Quality:** Write clean, modular, maintainable code. Follow SOLID principles. Add concise comments for complex logic, especially in scraping and orchestration.
- **Security:** All secrets (API keys, ports) must be managed via `.env` and never exposed in frontend code. Sanitize all user inputs and avoid leaking sensitive data.
- **Performance:** Use async/await for all I/O and API calls. Optimize scrapers and service layers for efficiency and non-blocking operations.
- **Modularity:** Strict separation of concerns—services handle external APIs/business logic, controllers handle request/response, routes define endpoints. React components should be focused and reusable.
- **Error Handling:** All async operations must use try/catch. Backend logs errors; frontend shows user-friendly messages.
- **Stack & Conventions:**
  - Backend: Node.js (ES Modules), Express.js
  - Frontend: React (Hooks), axios for HTTP
  - Scraping: Puppeteer (selectors may need updating)
  - Containerization: Docker, docker-compose.yml, Alpine for small images
  - Environment: All secrets/configs in `.env`

## Project Overview
  - User submits a search term and country in the frontend (`App.js`).
  - Frontend POSTs to `/api/search` on backend.
  - Backend controller (`controllers/searchController.js`) orchestrates:
    - eBay API search (`services/ebayService.js`)
    - Daraz scraping (Bangladesh only, via Puppeteer in `services/darazService.js`)
    - AI summary via Gemini (`services/geminiService.js`)
  - Results (products + AI summary) returned to frontend for display.

## Developer Workflows
  - `docker compose up --build` from project root builds and starts both frontend (port 3000) and backend (port 5001).
  - Hot-reloading enabled via volume mounts in `docker-compose.yml`.
  - Use `npm run dev` in `backend/` for local development (nodemon).
  - Environment variables in `backend/.env` (e.g., `EBAY_SANDBOX_APP_ID`, `GEMINI_API_KEY`).
  - Standard Create React App scripts (`npm start`, `npm test`, `npm run build`).

## Key Patterns & Conventions
  - If `country === 'BD'`, Daraz is scraped in addition to eBay.
  - Each external integration (eBay, Daraz, Gemini) is isolated in its own service file.
  - Backend returns structured JSON errors; frontend displays user-friendly messages.
  - Gemini is used for summarizing product results, prompt defined in `geminiService.js`.

## Integration Points

## Notable Files

## Example: Adding a New Marketplace

**Feedback requested:** Are any workflows, conventions, or integration details unclear or missing? Suggest improvements or ask for clarification to keep this guide actionable and up-to-date.
