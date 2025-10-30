# Chess2Earn - Separate EC2 Deployment Guide

This guide explains how to deploy the frontend (Admin UI) and backend (API) on **separate EC2 instances**.

## Project Structure

```
/home/vibecode/workspace/
├── frontend/           # Next.js Admin UI (separate EC2)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/           # Express.js API (separate EC2)
│   ├── src/
│   ├── database/
│   ├── package.json
│   └── Dockerfile
├── nginx/             # Nginx config (optional, for reverse proxy)
└── docker-compose.yml # For local development only
```

---

## Prerequisites

- 2 AWS EC2 instances (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed on both instances
- Security groups configured properly
- Domain names (optional but recommended)

---

## Part 1: Backend EC2 Instance Setup

### Step 1: Launch Backend EC2 Instance

1. **Instance Type**: t2.small or larger (at least 2GB RAM)
2. **OS**: Ubuntu 20.04 LTS
3. **Security Group Rules**:
   - Port 22 (SSH) - Your IP only
   - Port 3001 (API) - Frontend EC2 IP or 0.0.0.0/0
   - Port 80/443 (HTTP/HTTPS) - If using reverse proxy

### Step 2: Install Docker on Backend EC2

```bash
# SSH into backend EC2
ssh -i your-key.pem ubuntu@backend-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose -y

# Log out and back in for group changes
exit
# SSH back in
ssh -i your-key.pem ubuntu@backend-ec2-ip
```

### Step 3: Deploy Backend

```bash
# Clone or copy your backend folder
mkdir -p ~/chess2earn
cd ~/chess2earn

# Copy backend folder to this instance
# Option A: Use git
git clone your-repo-url .
cd backend

# Option B: Use SCP from your local machine
# scp -i your-key.pem -r ./backend ubuntu@backend-ec2-ip:~/chess2earn/

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_TYPE=sqlite
DB_PATH=./data/chess2earn.db
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_this
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Chess2Earn <noreply@chess2earn.com>
EOF

# Edit .env with your actual credentials
nano .env

# Build and run backend
docker build -t chess2earn-backend .
docker run -d \
  --name chess2earn-backend \
  -p 3001:3001 \
  -v backend-data:/app/data \
  --env-file .env \
  --restart unless-stopped \
  chess2earn-backend

# Check if running
docker ps
docker logs chess2earn-backend

# Test backend
curl http://localhost:3001/health
```

### Step 4: Get Backend Public IP

```bash
# Get your backend EC2 public IP
curl ifconfig.me
# Note this IP - you'll need it for frontend configuration
```

---

## Part 2: Frontend EC2 Instance Setup

### Step 1: Launch Frontend EC2 Instance

1. **Instance Type**: t2.micro or t2.small
2. **OS**: Ubuntu 20.04 LTS
3. **Security Group Rules**:
   - Port 22 (SSH) - Your IP only
   - Port 3000 (Next.js) - 0.0.0.0/0 (or ALB IP)
   - Port 80/443 (HTTP/HTTPS) - 0.0.0.0/0

### Step 2: Install Docker on Frontend EC2

```bash
# SSH into frontend EC2
ssh -i your-key.pem ubuntu@frontend-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Log out and back in
exit
ssh -i your-key.pem ubuntu@frontend-ec2-ip
```

### Step 3: Deploy Frontend

```bash
# Create project directory
mkdir -p ~/chess2earn
cd ~/chess2earn

# Copy frontend folder to this instance
# Option A: Use git
git clone your-repo-url .
cd frontend

# Option B: Use SCP from your local machine
# scp -i your-key.pem -r ./frontend ubuntu@frontend-ec2-ip:~/chess2earn/

# Create .env.local file with backend API URL
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://BACKEND_EC2_PUBLIC_IP:3001/api
EOF

# Replace BACKEND_EC2_PUBLIC_IP with actual IP from Part 1, Step 4
# Example: NEXT_PUBLIC_API_URL=http://54.123.45.67:3001/api
nano .env.local

# Build and run frontend
docker build -t chess2earn-frontend .
docker run -d \
  --name chess2earn-frontend \
  -p 3000:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  chess2earn-frontend

# Check if running
docker ps
docker logs chess2earn-frontend
```

### Step 4: Test Deployment

```bash
# Get frontend public IP
curl ifconfig.me

# Access admin UI in browser
# http://FRONTEND_EC2_PUBLIC_IP:3000/admin
```

---

## Part 3: Using DockerHub (Recommended for Production)

### On Your Local Machine (Push Images)

```bash
# From project root
./push-to-dockerhub.sh

# This will build and push both:
# - dajrl/c2eapi:backend-latest
# - dajrl/c2eapi:frontend-latest
```

### On Backend EC2 (Pull Backend Image)

```bash
# Pull and run backend from DockerHub
docker pull dajrl/c2eapi:backend-latest

docker run -d \
  --name chess2earn-backend \
  -p 3001:3001 \
  -v backend-data:/app/data \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DB_TYPE=sqlite \
  -e DB_PATH=./data/chess2earn.db \
  -e JWT_SECRET=your_secret_key_min_32_chars \
  -e EMAIL_USER=your-email@gmail.com \
  -e EMAIL_PASSWORD=your-app-password \
  --restart unless-stopped \
  dajrl/c2eapi:backend-latest
```

### On Frontend EC2 (Pull Frontend Image)

```bash
# Pull and run frontend from DockerHub
docker pull dajrl/c2eapi:frontend-latest

docker run -d \
  --name chess2earn-frontend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://BACKEND_EC2_IP:3001/api \
  --restart unless-stopped \
  dajrl/c2eapi:frontend-latest
```

---

## Part 4: Production Setup with Domain Names

### Setup 1: Using Nginx Reverse Proxy on Frontend EC2

```bash
# On Frontend EC2, install nginx
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/chess2earn

# Add this config:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/chess2earn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Setup 2: Update DNS Records

1. **Frontend Domain** (e.g., admin.yourdomain.com):
   - A Record → Frontend EC2 Public IP

2. **Backend Domain** (e.g., api.yourdomain.com):
   - A Record → Backend EC2 Public IP

3. **Update Frontend Environment**:
   ```bash
   # On Frontend EC2
   docker stop chess2earn-frontend
   docker rm chess2earn-frontend

   docker run -d \
     --name chess2earn-frontend \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
     --restart unless-stopped \
     dajrl/c2eapi:frontend-latest
   ```

---

## Part 5: Security Best Practices

### 1. Backend EC2 Security Group
- Only allow port 3001 from Frontend EC2 IP
- Or use AWS PrivateLink/VPC peering for private communication

### 2. Environment Variables
- Never commit .env files
- Use AWS Secrets Manager or Parameter Store

### 3. HTTPS Setup
```bash
# On both EC2 instances
sudo apt install certbot -y

# For backend API
sudo certbot certonly --standalone -d api.yourdomain.com

# For frontend
sudo certbot certonly --standalone -d admin.yourdomain.com
```

### 4. Enable Firewall
```bash
# On both instances
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# On backend only
sudo ufw allow from FRONTEND_EC2_IP to any port 3001

sudo ufw enable
```

---

## Part 6: Monitoring and Maintenance

### View Logs
```bash
# Backend logs
docker logs -f chess2earn-backend

# Frontend logs
docker logs -f chess2earn-frontend
```

### Update Deployment
```bash
# Pull latest images
docker pull dajrl/c2eapi:backend-latest
docker pull dajrl/c2eapi:frontend-latest

# Restart containers
docker stop chess2earn-backend && docker rm chess2earn-backend
docker stop chess2earn-frontend && docker rm chess2earn-frontend

# Rerun the docker run commands from above
```

### Database Backup (Backend EC2)
```bash
# Backup SQLite database
docker exec chess2earn-backend cp /app/data/chess2earn.db /app/data/backup-$(date +%Y%m%d).db

# Copy backup to local machine
docker cp chess2earn-backend:/app/data/backup-$(date +%Y%m%d).db ./
```

---

## Part 7: Estimated AWS Costs

### Minimal Setup
- Backend EC2 (t2.small): ~$17/month
- Frontend EC2 (t2.micro): ~$8.5/month
- Data Transfer: ~$1-5/month
- **Total**: ~$25-30/month

### Production Setup
- Backend EC2 (t3.medium): ~$30/month
- Frontend EC2 (t3.small): ~$15/month
- Application Load Balancer: ~$16/month
- Route 53: ~$1/month
- **Total**: ~$60-70/month

---

## Quick Reference Commands

### Backend EC2
```bash
# Status
docker ps
docker logs chess2earn-backend

# Restart
docker restart chess2earn-backend

# Shell access
docker exec -it chess2earn-backend sh

# Database seed
docker exec -it chess2earn-backend npm run db:seed
```

### Frontend EC2
```bash
# Status
docker ps
docker logs chess2earn-frontend

# Restart
docker restart chess2earn-frontend

# Shell access
docker exec -it chess2earn-frontend sh
```

---

## Troubleshooting

### Backend not accessible from Frontend
1. Check backend security group allows port 3001 from frontend IP
2. Verify backend is running: `curl http://localhost:3001/health`
3. Check backend logs: `docker logs chess2earn-backend`

### Frontend can't connect to Backend
1. Verify NEXT_PUBLIC_API_URL environment variable
2. Test backend from frontend EC2: `curl http://BACKEND_IP:3001/health`
3. Check network connectivity between EC2 instances

### Database issues
1. Check data volume: `docker volume ls`
2. Backup and restore: See Part 6
3. Re-seed database: `docker exec -it chess2earn-backend npm run db:seed`

---

## Support

For issues or questions:
- Check logs first: `docker logs CONTAINER_NAME`
- Review security group rules
- Verify environment variables
- Test network connectivity

---

**Happy Deploying!** 🚀
