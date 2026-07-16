# Text2Learn Docker Deployment Script
# This script starts the entire application using Docker Compose

Write-Host "🐳 Text2Learn Docker Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "  $dockerVersion" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "Docker is not installed or not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -NoNewline
try {
    docker-compose --version | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "Docker Compose is not available!" -ForegroundColor Red
    Write-Host "It should come with Docker Desktop. Please reinstall." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host ""
    Write-Host "❌ docker-compose.yml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check for .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Root .env not found. Creating from server/.env..." -ForegroundColor Yellow
    if (Test-Path "server\.env") {
        Copy-Item "server\.env" ".env"
        Write-Host "✅ Created .env file" -ForegroundColor Green
    } else {
        Write-Host "❌ server/.env not found. Cannot proceed." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Starting Docker Containers..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host ""
Write-Host "Building and starting containers..." -ForegroundColor Yellow
Write-Host "(This may take 5-10 minutes on first run)" -ForegroundColor Gray
Write-Host ""

# Start containers
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to start containers!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error above. Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop is not running" -ForegroundColor White
    Write-Host "  2. Ports 3000, 5000, or 5432 are already in use" -ForegroundColor White
    Write-Host "  3. Not enough memory allocated to Docker" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Containers started!" -ForegroundColor Green
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check container status
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Container Status:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🌐 Access Your Application:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📱 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🔧 Backend:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "  📊 Health:    http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "  🗄️  Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Test health endpoint
Write-Host "Testing backend health..." -NoNewline
Start-Sleep -Seconds 2
try {
    Invoke-WebRequest -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Backend still starting..." -ForegroundColor Yellow
    Write-Host "  Wait a minute and try accessing http://localhost:3000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "💡 Useful Commands:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  View logs:           docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop containers:     docker-compose stop" -ForegroundColor White
Write-Host "  Restart containers:  docker-compose restart" -ForegroundColor White
Write-Host "  Remove containers:   docker-compose down" -ForegroundColor White
Write-Host "  Rebuild & restart:   docker-compose up --build -d" -ForegroundColor White
Write-Host ""

# Try to open browser
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
