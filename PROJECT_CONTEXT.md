# PROJECT CONTEXT: DEAL HUNTER AI

## Project Goal
To build a product search aggregator website named "Deal Hunter AI". The site allows users to search for a product and see results from both global e-commerce APIs (like eBay) and scraped local websites (like Daraz in Bangladesh). An AI (Google Gemini) provides a summary of the best deals found across all sources.

## High-Level User Flow
- User enters a search term and selects a country.
- Frontend sends the search term and country to the backend.
- Backend initiates parallel searches: one via the eBay API, and another via a Puppeteer scraper if the country is "Bangladesh".
- The results are combined.
- The combined list is sent to the Google Gemini API for an intelligent summary.
- The backend returns a single JSON object containing the combined product list and the AI summary.
- Frontend displays the AI summary and the list of products, with badges indicating their source (eBay or Daraz).

## Technology Stack & Structure
- **Root Directory:** `deal-hunter-app/`
- **Backend (`/backend`):**
  - Language: Node.js with Express.js, using ES Modules.
  - Structure: Modular (routes, controllers, services).
  - `server.js`: Main entry point. Sets up server, middleware, and connects the main router.
  - `routes/searchRoutes.js`: Defines the POST /api/search endpoint.
  - `controllers/searchController.js`: Manages the request flow. It calls the necessary services in parallel using Promise.all and combines their results.
  - `services/ebayService.js`: Handles all communication with the eBay Finding API.
  - `services/darazService.js`: Handles all web scraping logic using Puppeteer. This is a fragile component that depends on Daraz's HTML structure.
  - `services/geminiService.js`: Handles all communication with the Google Gemini API to generate the summary.
  - `.env` file: Contains EBAY_SANDBOX_APP_ID, GEMINI_API_KEY, and PORT.
- **Frontend (`/frontend`):**
  - Library: React (created with Create React App).
  - `App.js`: The main component. Manages state for search term, country, loading status, and results. Renders the UI and uses axios to call the backend at http://localhost:5001/api/search.
- **Containerization (`/`):**
  - `docker-compose.yml`: Defines and orchestrates the backend and frontend services. Manages port mapping and uses volumes for live-reloading during development.
  - `backend/Dockerfile`: Builds the backend container. Includes a crucial RUN apk add ... command to install system dependencies for Puppeteer/Chromium.
  - `frontend/Dockerfile`: Builds the frontend development server container.

---
Please use this context for all future requests regarding the "Deal Hunter AI" project.
