@echo off
echo Creating deployment package...

REM Remove old zip if exists
if exist diary-backend-deploy.zip del diary-backend-deploy.zip

REM Use PowerShell to create zip
powershell -Command "Get-ChildItem -Path . -Recurse -File | Where-Object { $_.FullName -notmatch 'venv|__pycache__|\.git|\.env$|diary-backend\.zip|package\.|diary-backend-deploy\.zip' } | Compress-Archive -DestinationPath diary-backend-deploy.zip -Force"

echo.
echo Created: diary-backend-deploy.zip
echo.
echo Upload to EC2 with:
echo scp -i your-key.pem diary-backend-deploy.zip ubuntu@your-ec2-ip:/home/ubuntu/
