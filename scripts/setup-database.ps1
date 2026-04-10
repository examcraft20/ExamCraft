# ExamCraft Docker Database Setup Script
# Run this script to verify prerequisites and set up the database

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ExamCraft Database Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "📦 Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker not found"
    }
} catch {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "`n💡 Install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "`nAfter installation, restart and run this script again.`n" -ForegroundColor White
    exit 1
}

# Step 2: Check if Docker is running
Write-Host "`n🔍 Step 2: Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "`n💡 Please start Docker Desktop and try again.`n" -ForegroundColor Yellow
    exit 1
}

# Step 3: Check if database is already running
Write-Host "`n🔎 Step 3: Checking database status..." -ForegroundColor Yellow
$containers = docker compose ps --format json 2>&1
if ($containers -and $containers.Length -gt 0) {
    Write-Host "⚠️  Database containers are already running!" -ForegroundColor Yellow
    Write-Host "`nCurrent containers:" -ForegroundColor White
    docker compose ps
    Write-Host "`n💡 Options:" -ForegroundColor Yellow
    Write-Host "   1. Continue using running database" -ForegroundColor White
    Write-Host "   2. Restart: pnpm db:restart" -ForegroundColor White
    Write-Host "   3. Stop: pnpm db:stop`n" -ForegroundColor White
} else {
    Write-Host "✅ No containers running (ready to start)" -ForegroundColor Green
}

# Step 4: Ask user what to do
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  What would you like to do?" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "1. Start database only" -ForegroundColor White
Write-Host "2. Start database and application (recommended)" -ForegroundColor White
Write-Host "3. Just check status" -ForegroundColor White
Write-Host "4. Cancel`n" -ForegroundColor White

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Starting database..." -ForegroundColor Yellow
        pnpm db:start
        Write-Host "`n✅ Database started!" -ForegroundColor Green
        Write-Host "`n📊 Access URLs:" -ForegroundColor Yellow
        Write-Host "   - Supabase Studio: http://localhost:54323" -ForegroundColor White
        Write-Host "   - API Gateway: http://localhost:54321" -ForegroundColor White
        Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Apply migrations: pnpm db:migrate" -ForegroundColor White
        Write-Host "   2. Seed data: pnpm seed" -ForegroundColor White
        Write-Host "   3. Start app: pnpm dev`n" -ForegroundColor White
    }
    "2" {
        Write-Host "`n⚡ Starting database and application..." -ForegroundColor Yellow
        pnpm dev:with-db
    }
    "3" {
        Write-Host "`n📊 Database Status:" -ForegroundColor Yellow
        docker compose ps
        Write-Host ""
    }
    "4" {
        Write-Host "`n👋 Cancelled.`n" -ForegroundColor Yellow
    }
    default {
        Write-Host "`n❌ Invalid choice.`n" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
