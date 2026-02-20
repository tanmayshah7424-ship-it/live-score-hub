# ---------- Base Stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (adjust if your server uses a different port)
EXPOSE 5000

# Health check (checks the API health endpoint).
# Waits for response end and exits 0 on 200, 1 otherwise.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { if (r.statusCode !== 200) { process.exit(1); } r.on('data', ()=>{}); r.on('end', ()=>process.exit(0)); }).on('error', ()=>process.exit(1))"

# Start the server
CMD ["npm", "start"]
