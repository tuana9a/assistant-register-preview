FROM node:12-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD [ "sh", "-c", "cat favicon.txt && echo developed by tuana9a, gemdino,... && node ." ]