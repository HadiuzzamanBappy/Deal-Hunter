# PROJECT CONTEXT: DEAL HUNTER AI

## Project Goal
To build a product search aggregator website named "Deal Hunter AI". The site allows users to search for a product and see results from both global e-commerce APIs (like eBay) and scraped local websites (like Daraz in Bangladesh). An AI (Google Gemini) provides a summary of the best deals found across all sources. The application also features a comprehensive favorites system allowing users to save, manage, and compare products across searches.

## High-Level User Flow
### Search & Discovery Flow
- User enters a search term and selects a country using the enhanced SearchBar with smart suggestions.
- Frontend sends the search term and country to the backend.
- Backend initiates parallel searches: one via the eBay API, and another via a Puppeteer scraper if the country is "Bangladesh".
- The results are combined and processed.
- The combined list is sent to the Google Gemini API for an intelligent summary.
- The backend returns a single JSON object containing the combined product list and the AI summary.
- Frontend displays the AI summary and the list of products, with badges indicating their source (eBay or Daraz).

### Favorites Management Flow
- User can add/remove products to/from favorites using heart-shaped buttons on product cards.
- Each user gets a unique auto-generated ID stored in localStorage.
- Favorite products are saved persistently and detected across different searches.
- Users can view all favorites in a dedicated page with price comparison and management features.
- Navigation between search and favorites views is seamless via header controls.

## Technology Stack & Structure
- **Root Directory:** `deal-hunter-app/`
- **Backend (`/backend`):**
  - Language: Node.js with Express.js, using ES Modules.
  - Structure: Modular (routes, controllers, services).
  - `server.js`: Main entry point. Sets up server, middleware, and connects all routers (search, suggestions, favorites).
  - `routes/searchRoutes.js`: Defines the POST /api/search endpoint.
  - `routes/suggestionRoutes.js`: Defines endpoints for smart search suggestions and trending searches.
  - `routes/favoritesRoutes.js`: Defines endpoints for favorites management (add, remove, toggle, check status).
  - `controllers/searchController.js`: Manages the search request flow. Calls necessary services in parallel and combines results.
  - `controllers/suggestionController.js`: Manages search suggestion recording and retrieval.
  - `controllers/favoritesController.js`: Manages all favorites operations with proper error handling.
  - `services/ebayService.js`: Handles all communication with the eBay Finding API.
  - `services/darazService.js`: Handles all web scraping logic using Puppeteer. This is a fragile component that depends on Daraz's HTML structure.
  - `services/geminiService.js`: Handles all communication with the Google Gemini API to generate summaries.
  - `services/searchSuggestionService.js`: Manages persistent search suggestions and trending analysis.
  - `services/favoritesService.js`: Handles favorites storage, product identification, and comparison logic.
  - `data/`: Directory containing JSON files for persistent storage (suggestions.json, favorites.json).
  - `.env` file: Contains EBAY_SANDBOX_APP_ID, GEMINI_API_KEY, and PORT.

- **Frontend (`/frontend`):**
  - Library: React (created with Create React App).
  - **Main Components:**
    - `App.js`: The main component. Manages global state including current view (search/favorites), search parameters, and results. Handles navigation between views.
    - `Header.js`: Enhanced header with theme toggle, favorites navigation, and responsive controls.
    - `SearchBar.js`: Modern search interface with country selection and enhanced styling.
    - `SmartSearchInput.js`: Intelligent search input with auto-complete, trending suggestions, and user history.
    - `Results.js`: Displays AI analysis and product grid with interactive favorite buttons and clean card design.
    - `Favorites.js`: Dedicated favorites management page with comparison features and navigation back to search.
    - `TrendingSearches.js`: Shows popular search terms with click-to-search functionality.
    - `SearchDemo.js`: Interactive demo section for new users.
  - **Services:**
    - `services/userService.js`: Manages user identification and preferences via localStorage.
    - `services/favoritesService.js`: Handles all favorites API calls and product identification.
  - **Context:**
    - `context/ThemeContext.js`: Global theme management (light/dark mode).
    - `context/AuthContext.js`: Authentication context for future user management.

- **Containerization (`/`):**
  - `docker-compose.yml`: Defines and orchestrates the backend and frontend services. Manages port mapping and uses volumes for live-reloading during development.
  - `backend/Dockerfile`: Builds the backend container. Includes a crucial RUN apk add ... command to install system dependencies for Puppeteer/Chromium.
  - `frontend/Dockerfile`: Builds the frontend development server container.

## Key Features Implemented

### 🔍 Smart Search System
- **Intelligent Suggestions**: Auto-complete with debounced queries
- **Trending Analysis**: Shows popular searches from all users
- **User History**: Remembers individual user's search patterns
- **Persistent Storage**: Suggestions saved across sessions

### ❤️ Comprehensive Favorites System
- **One-Click Favorites**: Heart-shaped buttons on all product cards
- **Cross-Search Detection**: Same products marked as favorites across different searches
- **User Persistence**: Automatic user identification without login required
- **Price Comparison**: Groups similar products and highlights best deals
- **Management Interface**: Dedicated favorites page with removal and comparison features

### 🎨 Modern UI/UX Design
- **Glassmorphism Design**: Modern transparent effects with backdrop blur
- **Responsive Layout**: Perfect experience across all device sizes
- **Dark/Light Theme**: System-aware theme switching with persistence
- **Smooth Animations**: Hover effects, loading states, and transitions
- **Typography Optimization**: Carefully balanced font sizes for readability

### 🚀 Enhanced Performance
- **Debounced Searches**: Optimized API calls for suggestions
- **Async Operations**: Non-blocking favorites management
- **Error Handling**: Graceful error recovery with user feedback
- **Loading States**: Clear visual feedback during operations

## Data Structures

### Favorites Storage Format
```json
{
  "favorites": [
    {
      "id": "unique_timestamp_id",
      "userId": "user_generated_id",
      "productId": "source_itemid_combination",
      "addedAt": "ISO_timestamp",
      "product": {
        "title": "Product Name",
        "price": "$99.99",
        "source": "eBay|Daraz",
        "galleryURL": "image_url",
        "viewItemURL": "product_url",
        "itemId": "source_item_id"
      }
    }
  ]
}
```

### Search Suggestions Storage Format
```json
{
  "suggestions": [
    {
      "query": "search_term",
      "count": 5,
      "lastSearched": "ISO_timestamp"
    }
  ]
}
```

## API Endpoints

### Search Endpoints
- `POST /api/search` - Main product search
- `GET /api/suggestions/trending` - Get trending searches
- `POST /api/suggestions/record` - Record a search

### Favorites Endpoints
- `GET /api/favorites/user/:userId` - Get user's favorites
- `POST /api/favorites/add` - Add product to favorites
- `POST /api/favorites/remove` - Remove product from favorites  
- `POST /api/favorites/toggle` - Smart add/remove toggle
- `POST /api/favorites/check-status` - Check favorite status for multiple products

## Development Workflow
1. **Local Development**: Use `npm run dev` in backend/ for hot-reloading
2. **Container Development**: Use `docker compose up --build` for full-stack testing
3. **Environment Setup**: Configure `.env` file with API keys
4. **Data Persistence**: JSON files in `backend/data/` for development storage

---
Please use this updated context for all future requests regarding the "Deal Hunter AI" project.
