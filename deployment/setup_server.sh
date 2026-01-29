#!/bin/bash
set -e

# LinkifyMe Server Setup Script for Ubuntu/Debian

echo "🚀 Starting Server Setup..."

# 1. Update System
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
echo "Installing core dependencies..."
# git, curl, build-essential
sudo apt install -y git curl build-essential libssl-dev libffi-dev

# 3. Install Python 3.11 (if not present) & venv
echo "Installing Python and venv..."
sudo apt install -y python3 python3-pip python3-venv python3-dev

# 4. Install Node.js 20.x
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. Install PM2 (Process Manager)
echo "Installing PM2..."
sudo npm install -g pm2

# 6. Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# 7. Install Certbot (for SSL)
echo "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 8. Allow Nginx in Firewall (UFW) if active
if sudo ufw status | grep -q "Status: active"; then
    sudo ufw allow 'Nginx Full'
fi

echo "✅ Server Setup Complete!"
echo "Next steps:"
echo "1. Configure your domain in deployment/nginx.conf"
echo "2. Run deployment/install_app.sh to build the application"
echo "3. Run 'pm2 start deployment/ecosystem.config.js' to start the server"
