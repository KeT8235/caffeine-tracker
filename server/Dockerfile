FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

# 작업 디렉토리
WORKDIR /app

CMD ["npm", "start"]
