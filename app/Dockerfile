# ========================================================
# Dockerfile - Web Application Quan Ly Sinh Vien
# Hardening: Run as non-root user (node:node)
# ========================================================
FROM node:18-alpine

# Thiet lap moi truong production
ENV NODE_ENV=production

# Thu muc lam viec
WORKDIR /usr/src/app

# Sao chep package file de tan dung Docker layer cache
COPY package*.json ./

# Cai dat dependencies che do production
RUN npm install --omit=dev

# Sao chep toan bo ma nguon ung dung
COPY . .

# Phan quyen thu muc cho user node (UID 1000)
RUN chown -R node:node /usr/src/app

# Chuyen sang non-root user (Bao mat Hardening)
USER node

# Expose port ung dung
EXPOSE 3000

# Healthcheck cho container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Lenh khoi chay
CMD ["node", "server.js"]
