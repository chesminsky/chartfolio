FROM node:18-alpine

WORKDIR /app

ENV NODE_OPTIONS=--max-old-space-size=16384
ENV GENERATE_SOURCEMAP=false

COPY package.json .
RUN npm install --loglevel=error
RUN npm prune

COPY . .
RUN npm run build:prod

ENV PORT 4000

EXPOSE $PORT

CMD ["npm", "run", "server"]