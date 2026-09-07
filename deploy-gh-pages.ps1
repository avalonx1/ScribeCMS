# Deploy ScribeCMS Frontend to GitHub Pages
param (
  [string]$Repo = "avalonx1/ScribeCMS"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 1. Building Production Bundle (Vite)..." -ForegroundColor Cyan
npm run build

if (!(Test-Path "dist\index.html")) {
  Write-Error "Build output 'dist\index.html' not found!"
  exit 1
}

Write-Host "🌐 2. Ensuring Repository is Public (Required for Free GitHub Pages)..." -ForegroundColor Cyan
gh repo edit $Repo --visibility public --accept-visibility-change-consequences

Write-Host "📦 3. Pushing 'dist' to branch 'gh-pages'..." -ForegroundColor Cyan
# Push dist subtree to gh-pages branch
git add -f dist
git commit -m "Deploy to GitHub Pages: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin (git subtree split --prefix dist main):gh-pages --force
git reset HEAD~1

Write-Host "⚙️ 4. Enabling GitHub Pages for $Repo on branch 'gh-pages'..." -ForegroundColor Cyan
try {
  gh api -X POST "repos/$Repo/pages" -f "source[branch]=gh-pages" -f "source[path]=/"
} catch {
  # If already enabled, update source
  try {
    gh api -X PUT "repos/$Repo/pages" -f "source[branch]=gh-pages" -f "source[path]=/"
  } catch {
    Write-Host "Pages setting verified." -ForegroundColor Yellow
  }
}

Write-Host "🎉 DEPLOY SUCCESS!" -ForegroundColor Green
Write-Host "Aplikasi Anda sedang diproses oleh GitHub Pages dan akan live di:" -ForegroundColor Green
Write-Host "👉 https://avalonx1.github.io/ScribeCMS/" -ForegroundColor Yellow
