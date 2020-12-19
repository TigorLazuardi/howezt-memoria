FROM node:alpine

WORKDIR /bot
COPY package.json .
COPY package-lock.json .
RUN ["npm", "install", "--production"]
COPY . .
RUN ["npm", "run", "build"]
CMD ["node", "dist/index.js"]