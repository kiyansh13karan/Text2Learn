# Text2Learn Deployment Readiness Checker
# Run this before deploying to verify everything is configured correctly

Write-Host "🔍 Text2Learn Deployment Readiness Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "📦 Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$Matches[1]
        if ($major -ge 18) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  $nodeVersion (Need v18+)" -ForegroundColor Yellow
            $allGood = $false
        }
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "📦 Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check Git
Write-Host "📦 Checking Git..." -NoNewline
try {
    $gitVersion = git --version
    Write-Host " ✅ $gitVersion" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Not installed (needed for cloud deployment)" -ForegroundColor Yellow
}

# Check Docker (optional)
Write-Host "🐳 Checking Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Host " ✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Not installed (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Checking Project Files..." -ForegroundColor Cyan

# Check server directory
if (Test-Path "server") {
    Write-Host "✅ server/ directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ server/ directory missing" -ForegroundColor Red
    $allGood = $false
}

# Check client directory
if (Test-Path "client") {
    Write-Host "✅ client/ directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ client/ directory missing" -ForegroundColor Red
    $allGood = $false
}

# Check server .env
if (Test-Path "server\.env") {
    Write-Host "✅ server/.env exists" -ForegroundColor Green
    
    # Verify essential variables
    $envContent = Get-Content "server\.env" -Raw
    
    if ($envContent -match "DATABASE_URL=") {
        Write-Host "  ✅ DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ DATABASE_URL missing" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($envContent -match "GEMINI_API_KEY=") {
        Write-Host "  ✅ GEMINI_API_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GEMINI_API_KEY missing" -ForegroundColor Yellow
    }
    
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "  ✅ JWT_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ JWT_SECRET missing" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ server/.env missing" -ForegroundColor Red
    $allGood = $false
}

# Check client .env
if (Test-Path "client\.env") {
    Write-Host "✅ client/.env exists" -ForegroundColor Green
} else {
    Write-Host "❌ client/.env missing" -ForegroundColor Red
    $allGood = $false
}

# Check deployment files
Write-Host ""
Write-Host "📄 Checking Deployment Files..." -ForegroundColor Cyan

if (Test-Path "docker-compose.yml") {
    Write-Host "✅ docker-compose.yml exists (Docker deployment ready)" -ForegroundColor Green
} else {
    Write-Host "⚠️  docker-compose.yml missing" -ForegroundColor Yellow
}

if (Test-Path "render.yaml") {
    Write-Host "✅ render.yaml exists (Render deployment ready)" -ForegroundColor Green
} else {
    Write-Host "⚠️  render.yaml missing" -ForegroundColor Yellow
}

if (Test-Path "client\vercel.json") {
    Write-Host "✅ client/vercel.json exists (Vercel deployment ready)" -ForegroundColor Green
} else {
    Write-Host "⚠️  client/vercel.json missing" -ForegroundColor Yellow
}

# Check if dependencies are installed
Write-Host ""
Write-Host "📦 Checking Dependencies..." -ForegroundColor Cyan

if (Test-Path "server\node_modules") {
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server dependencies not installed - run: cd server && npm install" -ForegroundColor Yellow
}

if (Test-Path "client\node_modules") {
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Client dependencies not installed - run: cd client && npm install" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Your project is ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Read DEPLOY_NOW.md for deployment options" -ForegroundColor White
    Write-Host "2. Choose your deployment method:" -ForegroundColor White
    Write-Host "   - Cloud (Render + Vercel) - Recommended" -ForegroundColor White
    Write-Host "   - Docker (Local/Self-hosted)" -ForegroundColor White
    Write-Host "   - Manual Local Development" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  SOME ISSUES FOUND" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues marked with ❌ before deploying." -ForegroundColor Yellow
    Write-Host "See DEPLOY_NOW.md for detailed instructions." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
