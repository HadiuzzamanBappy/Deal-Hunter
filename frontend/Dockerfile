# deal-hunter-app/frontend/Dockerfile

# 1. Use the same Node.js base image for consistency.
FROM node:20-alpine

# 2. Set the working directory.
WORKDIR /app

# 3. Copy package files and install dependencies, just like the backend.
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the source code.
COPY . .

# 5. The React development server runs on port 3000, so we expose it.
EXPOSE 3000

# 6. The command to start the React development server.
CMD [ "npm", "start" ]