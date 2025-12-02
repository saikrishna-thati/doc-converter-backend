FROM node:18-slim

# 1. Install Python 3, pip, and dependencies for Puppeteer (Chrome)
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  wget \
  gnupg \
  ca-certificates \
  procps \
  libxss1 \
  libgbm-dev \
  libasound2 \
  && rm -rf /var/lib/apt/lists/*

# 2. Install Google Chrome Stable (for Puppeteer)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Install Node.js dependencies
COPY package*.json ./
RUN npm install

# 5. Install Python dependencies
COPY requirements.txt ./
# Use --break-system-packages to allow installing globally on newer Debian versions
RUN pip3 install -r requirements.txt --break-system-packages

# 6. Copy source code
COPY . .

# 7. Create uploads directory
RUN mkdir -p uploads

# 8. Expose port (Render sets PORT env var, but we default to 3001)
ENV PORT=3001
EXPOSE 3001

# 9. Start server
CMD ["node", "server.js"]
