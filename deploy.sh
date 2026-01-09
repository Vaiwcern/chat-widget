#!/bin/bash

# AI HRM Chat Widget - Deploy Script
# Run this script to deploy to GitHub Pages

set -e

echo "🚀 AI HRM Chat Widget - Deploy to GitHub Pages"
echo "================================================"

# Configuration
REPO_NAME="chat-widget"
GITHUB_USER="Vaiwcern"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - AI HRM Chat Widget"
else
    echo "📦 Staging changes..."
    git add .
    echo "💬 Commit message:"
    read -r -p "Commit message (default: 'Update - AI HRM Chat Widget'): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Update - AI HRM Chat Widget"}
    git commit -m "$COMMIT_MSG"
fi

# Check if remote exists
if ! git remote get-url origin &>/dev/null; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin "$REPO_URL"
fi

# Rename branch to main
echo "🌿 Ensuring branch is named 'main'..."
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment initiated!"
echo "================================================"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
echo "2. Under 'Source', select: main branch, /(root)"
echo "3. Click 'Save'"
echo ""
echo "⏱️  Wait 1-2 minutes for GitHub Pages to deploy..."
echo ""
echo "🔗 Your embed URL will be:"
echo "   https://${GITHUB_USER}.github.io/${REPO_NAME}/build/embed.js"
echo ""
echo "📦 To embed in other websites:"
echo '   <script src="https://'${GITHUB_USER}'.github.io/'${REPO_NAME}'/build/embed.js"></script>'
echo '   <div id="ai-hrm-widget"></div>'
echo ""

