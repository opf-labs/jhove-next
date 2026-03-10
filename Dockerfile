# Build stage
FROM node:24-slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Add a script to replace env vars in env-config.js
COPY ./public/env-config.js /usr/share/nginx/html/env-config.js
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/env-config.js > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]
