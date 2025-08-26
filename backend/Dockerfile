# deal-hunter-app/backend/Dockerfile

FROM node:20-alpine

# Install system dependencies required by Puppeteer (Chromium) to run on Alpine Linux.
# This is a self-contained command.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

    # Tell Puppeteer to NOT download its own version of Chrome during npm install.
ENV PUPPETEER_SKIP_DOWNLOAD=true

# WORKDIR is a completely separate instruction that sets the directory for subsequent commands.
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD [ "npm", "run", "dev" ]