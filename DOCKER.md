# JHOVE Next.js Docker Deployment

## Quick Start

### Development Mode (with hot reload)
```bash
docker-compose up
```

Access the app at: http://localhost:3000
Access the JHOVE API at: http://localhost:8080

### Production Mode
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Services

### 1. jhove-frontend
- **Port**: 3000
- **Description**: Next.js React application for JHOVE file validation
- **Technology**: Node.js 24, Next.js 15, React 19

### 2. jhove-api
- **Port**: 8080
- **Description**: JHOVE REST API backend
- **Image**: openpreserve/jhove-rest:latest

## Environment Variables

You can customize the API URL by modifying `public/env-config.js` or setting environment variables:

```javascript
window.env = {
  API_BASE_URL: "http://localhost:8080"
};
```

## Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

**Rebuild containers:**
```bash
docker-compose up --build
```

**Remove volumes and clean up:**
```bash
docker-compose down -v
```

## Production Deployment

For production, use the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

**Port already in use:**
Edit the ports in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

**API not connecting:**
Make sure both containers are on the same network and the API_BASE_URL is correct.

**Check container status:**
```bash
docker-compose ps
```

**Access container shell:**
```bash
docker-compose exec jhove-frontend sh
docker-compose exec jhove-api sh
```
