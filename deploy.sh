#!/bin/bash

# College Diary Backend - EC2 Deployment Script
# Run this script on your EC2 instance

set -e

echo "🚀 Starting deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Python and dependencies
echo "🐍 Installing Python and dependencies..."
sudo apt-get install -y python3 python3-pip python3-venv nginx postgresql-client

# Create application directory
APP_DIR="/home/ubuntu/diary-backend"
echo "📁 Setting up application directory: $APP_DIR"

# Create virtual environment
echo "🔧 Creating virtual environment..."
python3 -m venv $APP_DIR/venv
source $APP_DIR/venv/bin/activate

# Install Python packages
echo "📚 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Create log directories
echo "📝 Creating log directories..."
sudo mkdir -p /var/log/gunicorn
sudo chown -R ubuntu:www-data /var/log/gunicorn

# Setup environment file
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "❗ IMPORTANT: Edit .env file with your production credentials!"
    echo "   Run: nano .env"
fi

# Setup systemd service
echo "⚙️  Setting up systemd service..."
sudo cp diary-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable diary-backend
sudo systemctl start diary-backend

# Setup nginx
echo "🌐 Configuring nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/diary-backend
sudo ln -sf /etc/nginx/sites-available/diary-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Update nginx.conf with your domain/IP"
echo "3. Restart services:"
echo "   sudo systemctl restart diary-backend"
echo "   sudo systemctl restart nginx"
echo ""
echo "🔍 Check status:"
echo "   sudo systemctl status diary-backend"
echo "   sudo systemctl status nginx"
echo ""
echo "📊 View logs:"
echo "   sudo journalctl -u diary-backend -f"
echo "   tail -f /var/log/gunicorn/error.log"
