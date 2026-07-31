FROM node:20-slim

WORKDIR /app/

COPY package*.json .
COPY prisma ./prisma

RUN npm install

COPY . .

CMD ["sh", "-c", "npx prisma migrate dev && npm run start:dev"]
