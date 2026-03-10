FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY shared ./shared
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

RUN npm ci --omit=dev

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
