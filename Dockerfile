FROM node:24-slim
WORKDIR /app

# Manifests are copied first because the install layer is then reused until a dependency changes.
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci

COPY . .

EXPOSE 3001 5173
CMD ["npm", "run", "dev"]
