# Deal Hunter AI 🤖

**A smart product aggregator that combines API data and local web scraping to find the best deals, summarized by AI.**

Deal Hunter AI is a full-stack web application designed to provide users with a comprehensive product search experience. It fetches product listings from global sources like the eBay API and simultaneously scrapes local e-commerce sites (e.g., Daraz in Bangladesh) for region-specific deals. The combined results are then analyzed by the Google Gemini AI to provide a concise, intelligent summary of the best available options.

The entire application is containerized with Docker, ensuring a consistent and easy-to-manage development environment.

## ✨ Key Features

*   **Dual Data Sourcing:** Aggregates data from both stable, official APIs (eBay) and dynamic web scrapers (Puppeteer).
*   **AI-Powered Summaries:** Leverages the Google Gemini API to analyze search results and provide users with a helpful summary of the best deals.
*   **Smart Favorites System:** Save products across searches with intelligent duplicate detection and cross-platform product comparison.
*   **Location-Specific Search:** Allows users to select their country to include results from local e-commerce sites, providing more relevant deals.
*   **Interactive Product Comparison:** Compare saved favorites with best price highlighting and detailed product analysis.
*   **Persistent User Data:** Automatic user identification with localStorage-based session management for seamless experience.
*   **Fully Containerized:** Uses Docker and Docker Compose to run the entire stack (React frontend, Node.js backend) with a single command.
*   **Modular Backend Architecture:** The backend is built with a scalable and maintainable structure, separating routes, controllers, and services.
*   **Modern UI/UX:** Glassmorphism design with smooth animations, responsive layouts, and intuitive navigation.
*   **Live Reloading:** The development environment is configured for hot-reloading on both the frontend and backend, providing a smooth developer experience.

## 🏗️ How It Works (Architecture)

The application follows a modern microservice-inspired architecture, orchestrated by Docker Compose.

```
+-----------+       +-------------------------+       +--------------------+
|           |       |                         |       |   [eBay API]       |
|   User    | ----> |  Frontend (React)       | ----> |                    |
| (Browser) |       | (localhost:3000)        |       |                    |
+-----------+       +-------------------------+       +-------+------------+
                          |                                     |
                          | (POST /api/search)                  | (Global Search)
                          | (GET/POST /api/favorites)           |
                          |                                     v
+---------------------------------------------------------------------------------+
|   Backend (Node.js / Express) (localhost:5001)                                  |
|                                                                                 |
|   [Search Controller] -> [Promise.all] -> [eBay Service]  --------------------->+
|       ^                                      |                                  |
|       |                                      +-> [Daraz Scraper Service] -----> [Daraz.com.bd]
|       | (Combined Results)                              (Puppeteer)             |
|       +--------------------------- [Gemini Service] <---------------------------+
|                                         | (AI Summary)                          |
|   [Favorites Controller] -> [Favorites Service] -> [JSON Storage]               |
|       ^                         | (Add/Remove/Compare)    |                    |
|       | (Favorites CRUD)        v                         v                     |
|   <-------------------------------- [Response] <----------+                     |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### User Flow:
1.  **Search Phase:** The **React Frontend** captures the user's search term and country selection.
2.  **Backend Processing:** Data is sent to the **Node.js/Express Backend** via POST `/api/search`.
3.  **Parallel Data Fetching:** The **Controller** initiates parallel searches to `ebayService` and conditionally `darazService`.
4.  **Local Scraping:** The `darazService` launches **Puppeteer** headless browser for local e-commerce scraping.
5.  **AI Analysis:** Combined results are processed by `geminiService` using **Gemini AI** for intelligent summaries.
6.  **Favorites Management:** Users can save products via POST `/api/favorites` with intelligent duplicate detection.
7.  **Data Persistence:** Favorites are stored in JSON files with user identification for cross-session availability.
8.  **Comparison Features:** GET `/api/favorites` returns organized data for price comparison and product analysis.

## 🛠️ Technology Stack

| Category          | Technology                                                                          |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Frontend**      | React.js (Hooks), Axios, CSS3 (Glassmorphism Design)                              |
| **Backend**       | Node.js, Express.js (ES Modules)                                                   |
| **Data Storage**  | JSON File System, localStorage (Client-side Sessions)                              |
| **Web Scraping**  | Puppeteer (Headless Chrome)                                                        |
| **AI Services**   | Google Gemini API                                                                  |
| **Containerization** | Docker, Docker Compose                                                              |
| **Dev Tools**     | Nodemon, ESLint, Prettier (recommended)                                            |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/search` | Search products across eBay and local sites |
| `GET`  | `/api/favorites/:userId` | Get user's favorite products |
| `POST` | `/api/favorites` | Add product to favorites |
| `DELETE` | `/api/favorites/:userId/:productId` | Remove product from favorites |

##  Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Docker & Docker Compose:** The primary requirement for running this project. [Install Docker Desktop](https://www.docker.com/products/docker-desktop/).
*   **Git:** For cloning the repository.
*   **Node.js (v18+) & npm:** Required for local development or if not using Docker. [Install Node.js](https://nodejs.org/).
*   **A code editor:** Visual Studio Code is recommended.

## 🚀 Getting Started: Installation & Setup

Follow these steps to get the application running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/deal-hunter-app.git
cd deal-hunter-app
```

### 2. Obtain API Keys

You need two API keys to run the backend:

*   **eBay Developer Account:** Sign up for the [eBay Developer Program](https://developer.ebay.com/) and create a **Sandbox** application to get your App ID.
*   **Google Gemini API Key:** Go to [Google AI Studio](https://aistudio.google.com/app) to create your API key.

### 3. Create the Environment File

The backend relies on a `.env` file for its configuration and secrets.

1.  Navigate to the `backend` directory: `cd backend`
2.  Create a copy of the example environment file: `cp .env.example .env` (or create a new `.env` file manually).
3.  Open the `.env` file and add your API keys:

    ```.env
    # backend/.env

    # eBay Sandbox Application ID
    EBAY_SANDBOX_APP_ID="Your-Sandbox-App-Id-Here"

    # Google Gemini API Key
    GEMINI_API_KEY="Your-Gemini-API-Key-Here"

    # Port for the backend server
    PORT=5001
    ```

## 🏃 Running the Application

This project is fully containerized. The only command you need is `docker compose`.

1.  Make sure Docker Desktop is running.
2.  Navigate to the **root directory** of the project (`deal-hunter-app`).
3.  Run the following command to build the images and start the containers:

    ```bash
    docker compose up --build
    ```
    *   The `--build` flag is necessary the first time you run the app or after making changes to the `Dockerfile`s or installing new dependencies.
    *   For subsequent runs, you can simply use `docker compose up`.

4.  Wait for the logs to show that both the backend and frontend have started successfully.
5.  Open your web browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

### Using the Application

1.  **Search Products:** Enter a search term and select your country to find deals across multiple platforms.
2.  **Save Favorites:** Click the heart icon on any product to add it to your favorites list.
3.  **Compare Products:** Access your favorites page to compare saved products and find the best deals.
4.  **Cross-Session Access:** Your favorites are automatically saved and available across browser sessions.

### Stopping the Application

To stop the containers, press `Ctrl + C` in the terminal where Docker Compose is running, and then run:

```bash
docker compose down
```

## 🩺 Troubleshooting

Here are solutions to common issues encountered during the development of this project.

| Problem                                                    | Solution                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`docker compose: command not found` in WSL**             | This means the bridge between WSL and Docker Desktop is inactive. Go to **Docker Desktop -> Settings -> Resources -> WSL Integration** and ensure the toggle for your Ubuntu distro is **ON**. Relaunch your WSL terminal.                                                                                  |
| **Puppeteer fails to launch browser inside Docker**        | The minimal `node:alpine` image is missing system libraries required by Chromium. The solution is **already included** in `backend/Dockerfile` via the `RUN apk add ...` command, which installs these dependencies. If you encounter this locally in WSL, you need to `sudo apt-get install ...` them. |
| **Daraz scraper silently fails (returns no results)**      | Web scrapers are fragile and break when a website's HTML structure changes. To debug:                                                                                                                                                                                                                    |
|                                                            | 1. In `darazService.js`, set Puppeteer to `headless: false`.                                                                                                                                                                                                                                         |
|                                                            | 2. Use the `debug_daraz.js` script to run the scraper in isolation (`node debug_daraz.js`).                                                                                                                                                                                                              |
|                                                            | 3. A browser window will open. Watch it to identify the point of failure (e.g., CAPTCHAs, pop-ups, or changed HTML).                                                                                                                                                                                    |
|                                                            | 4. Inspect the website's new HTML and **update the selectors** in `darazService.js`.                                                                                                                                                                                                                   |
| **`EPERM: operation not permitted` or other WSL path issues** | This typically happens when using a Windows-installed version of Node.js from within a WSL terminal. The solution is to install and use a Node.js version **natively inside WSL**, preferably using `nvm` (Node Version Manager).                                                                           |

## 📁 Project Structure

```
deal-hunter-app/
├── backend/
│   ├── controllers/         # Handles request/response logic
│   │   ├── searchController.js
│   │   └── favoritesController.js
│   ├── routes/              # Defines API endpoints
│   │   ├── searchRoutes.js
│   │   └── favoritesRoutes.js
│   ├── services/            # Handles business logic and external API calls
│   │   ├── ebayService.js
│   │   ├── darazService.js  # The Puppeteer scraper
│   │   ├── geminiService.js
│   │   └── favoritesService.js  # Favorites management and storage
│   ├── data/                # JSON storage for favorites and suggestions
│   │   ├── favorites.json   # User favorites storage
│   │   └── suggestions.json # Search suggestions storage
│   ├── debug/               # Debug and testing utilities
│   │   └── debug_daraz.js   # Standalone script for testing the scraper
│   ├── node_modules/
│   ├── .env                 # (Important!) Holds API keys and secrets
│   ├── .env.example         # Template for environment variables
│   ├── Dockerfile           # Blueprint for the backend container
│   ├── package.json
│   └── server.js            # Main server entry point
│
├── frontend/
│   ├── public/
│   ├── src/                 # React source code
│   │   ├── components/      # React components
│   │   │   ├── Results.js   # Product display with favorites
│   │   │   └── Favorites.js # Favorites management page
│   │   ├── services/        # Frontend service layer
│   │   │   ├── userService.js    # User identification
│   │   │   └── favoritesService.js # Favorites API calls
│   │   ├── App.js           # Main application component
│   │   ├── Header.js        # Navigation header
│   │   └── App.css          # Styling with glassmorphism
│   ├── node_modules/
│   ├── Dockerfile           # Blueprint for the frontend container
│   └── package.json
│
├── .gitignore
├── docker-compose.yml       # Orchestrates the multi-container application
├── PROJECT_CONTEXT.md       # Comprehensive project documentation
└── README.md                # This file
```

## 🔮 Future Improvements

*   **User Authentication:** Implement proper user accounts with secure authentication and cloud-based favorites storage.
*   **Database Integration:** Migrate from JSON file storage to MongoDB or PostgreSQL for improved performance and scalability.
*   **Advanced Filters:** Add price range filters, brand filtering, and sorting options for enhanced product discovery.
*   **Expand Scrapers:** Add more scraper services for other local e-commerce sites (e.g., Amazon, Walmart) with configurable marketplace selection.
*   **Price Tracking:** Implement price history tracking and alerts for favorite products.
*   **Recommendation Engine:** Use machine learning to suggest products based on user search and favorites history.
*   **Mobile App:** Create React Native mobile application for on-the-go deal hunting.
*   **Production Build:** Create a production-ready Docker setup with Nginx for optimized static file serving.
*   **Real-time Updates:** Implement WebSocket connections for live price updates and new deal notifications.
*   **Advanced Analytics:** Add user behavior tracking and product performance analytics for better insights.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.