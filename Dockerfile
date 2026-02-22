FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN node scripts/copy-swagger-ui.mjs


RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD sh -c "npx prisma migrate deploy && npm run start"
