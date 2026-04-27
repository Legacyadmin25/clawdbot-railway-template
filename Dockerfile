FROM node:22-slim
WORKDIR /app
COPY bridge.js .
RUN npm install express
CMD ["node", "bridge.js"]
