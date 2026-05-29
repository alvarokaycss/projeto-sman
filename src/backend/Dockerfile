FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm install

# Copia o restante do código fonte do backend
COPY . .

EXPOSE 3000

# Executa o comando de desenvolvimento configurado anteriormente
CMD ["npm", "run", "dev"]