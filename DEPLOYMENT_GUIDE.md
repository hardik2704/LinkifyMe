# LinkifyMe Deployment Guide

This guide will help you deploy LinkifyMe to your Digital Ocean server.

## Prerequisites
- A Digital Ocean Droplet (Ubuntu 20.04 or 22.04 recommended).
- A domain name pointing to your Droplet's IP address (A Record).
- `root` access to the server.
- **FileZilla** (or similar) to transfer files.

## Step 1: Upload Files
1. Open FileZilla and connect to your server.
2. Navigate to your desired installation directory on the server (e.g., `/root/LinkifyMe` or `/var/www/LinkifyMe`).
3. Upload the entire project folder from your local machine to the server.
   - **Tip:** You can exclude `node_modules`, `.next`, `venv`, and `.git` folders to speed up transfer. They will be recreated on the server.
   - **Make sure the `deployment` folder is uploaded.**

## Step 2: Server Setup
1. SSH into your server (or use the Digital Ocean Console).
2. Navigate to the project folder:
   ```bash
   cd /path/to/LinkifyMe
   ```
3. Make the scripts executable (if they aren't already):
   ```bash
   chmod +x deployment/*.sh
   ```
4. Run the server setup script (installs System Dependencies):
   ```bash
   ./deployment/setup_server.sh
   ```

## Step 3: Application Installation
1. Run the app installation script (installs Backend/Frontend dependencies and builds):
   ```bash
   ./deployment/install_app.sh
   ```
   *Note: This script sets `NEXT_PUBLIC_API_URL` to an empty string so the frontend uses relative paths.*

2. **Configure Environment Variables**:
   - Go to `backend/` and edit `.env` with your real keys.
     ```bash
     nano backend/.env
     ```

## Step 4: Start the Application with PM2
1. Start the services:
   ```bash
   pm2 start deployment/ecosystem.config.js
   ```
2. Save the process list so it restarts on reboot:
   ```bash
   pm2 save
   pm2 startup
   ```
   (Follow the command output from `pm2 startup` if asked).

## Step 5: Configure Nginx & SSL
1. Edit the Nginx configuration file in `deployment/nginx.conf`:
   ```bash
   nano deployment/nginx.conf
   ```
   - Change `server_name example.com www.example.com;` to your actual domain.

2. Copy the config to Nginx sites directory:
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/linkifyme
   ```

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/linkifyme /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Optional: Remove default site if not needed
   ```

4. Test Nginx config:
   ```bash
   sudo nginx -t
   ```

5. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

6. **Enable SSL (HTTPS)** with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   - Follow the prompts to generate the certificate and redirect HTTP to HTTPS.

## Step 6: Verification
- Open your browser and go to `https://yourdomain.com`.
- The application should load, and requests to `/api` should work.

## Troubleshooting
- **Logs**: check PM2 logs if something fails:
  ```bash
  pm2 logs
  ```
- **Nginx errors**:
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
