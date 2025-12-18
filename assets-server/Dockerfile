FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install --loglevel=error
RUN npm prune

COPY . .
RUN npm run build

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "run", "start:prod"]