# 🚀 AWS EC2 Deployment Guide

## Prerequisites

1. AWS EC2 instance (Ubuntu 22.04 LTS recommended)
2. PostgreSQL database (RDS or self-hosted)
3. Security group allowing ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
4. SSH key pair for EC2 access

---

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose Ubuntu Server 22.04 LTS
3. Instance type: t2.micro (free tier) or t2.small
4. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
5. Launch and download key pair

---

## Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

---

## Step 3: Upload Code to EC2

From your local machine:

```bash
# Create a zip of your project (exclude venv, __pycache__)
zip -r diary-backend.zip . -x "venv/*" "*__pycache__*" "*.pyc" ".git/*"

# Upload to EC2
scp -i your-key.pem diary-backend.zip ubuntu@your-ec2-ip:/home/ubuntu/

# SSH into EC2 and extract
ssh -i your-key.pem ubuntu@your-ec2-ip
cd /home/ubuntu
unzip diary-backend.zip -d diary-backend
cd diary-backend
```

---

## Step 4: Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Step 5: Configure Environment Variables

Edit the `.env` file with production values:

```bash
nano .env
```

Update these values:
```env
SECRET_KEY=generate-a-strong-random-key-here
JWT_SECRET_KEY=generate-another-strong-key-here

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your-rds-endpoint.amazonaws.com  # or localhost if PostgreSQL on same EC2
DB_PORT=5432
DB_NAME=college_diary
```

Generate secure keys:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Step 6: Update Nginx Configuration

Edit nginx config with your domain or EC2 public IP:

```bash
sudo nano /etc/nginx/sites-available/diary-backend
```

Change `server_name` to your domain or EC2 IP:
```nginx
server_name your-domain.com;  # or 54.123.45.67
```

Restart nginx:
```bash
sudo systemctl restart nginx
```

---

## Step 7: Restart Application

```bash
sudo systemctl restart diary-backend
sudo systemctl status diary-backend
```

---

## Step 8: Test the API

```bash
# Health check
curl http://your-ec2-ip/health

# API test
curl http://your-ec2-ip/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"teacher","department":"CS"}'
```

---

## 🔧 Useful Commands

### Check service status
```bash
sudo systemctl status diary-backend
sudo systemctl status nginx
```

### View logs
```bash
# Application logs
sudo journalctl -u diary-backend -f

# Gunicorn logs
tail -f /var/log/gunicorn/error.log
tail -f /var/log/gunicorn/access.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart services
```bash
sudo systemctl restart diary-backend
sudo systemctl restart nginx
```

### Update code
```bash
cd /home/ubuntu/diary-backend
git pull  # if using git
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart diary-backend
```

---

## 🔒 Optional: Setup HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## 📊 Database Setup (if using RDS)

1. Create PostgreSQL RDS instance in AWS
2. Note the endpoint, username, password
3. Update `.env` with RDS credentials
4. Ensure EC2 security group can access RDS security group (port 5432)

---

## 🛡️ Security Checklist

- [ ] Changed default SECRET_KEY and JWT_SECRET_KEY
- [ ] Database uses strong password
- [ ] SSH key is secure (chmod 400)
- [ ] Firewall (UFW) is enabled
- [ ] Only necessary ports are open
- [ ] Regular system updates: `sudo apt-get update && sudo apt-get upgrade`
- [ ] Consider using AWS Secrets Manager for sensitive data

---

## 🐛 Troubleshooting

### Service won't start
```bash
sudo journalctl -u diary-backend -n 50
```

### Database connection issues
```bash
# Test PostgreSQL connection
psql -h your-db-host -U your-db-user -d college_diary
```

### Nginx errors
```bash
sudo nginx -t  # Test configuration
sudo tail -f /var/log/nginx/error.log
```

### Port already in use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

---

## 📈 Monitoring & Maintenance

Consider setting up:
- CloudWatch for EC2 monitoring
- Log aggregation (CloudWatch Logs)
- Automated backups for database
- Auto-scaling if traffic increases
- Load balancer for multiple instances
