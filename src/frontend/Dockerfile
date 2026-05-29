FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Roda o servidor do Vite com o parâmetro --host para aceitar conexões de fora do container
CMD ["npm", "run", "dev", "--", "--host"]