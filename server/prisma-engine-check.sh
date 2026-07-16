#!/bin/bash
# Script to ensure correct Prisma engine is available on Render

echo "🔍 Checking Prisma engines..."

# Check OpenSSL version
echo "📦 OpenSSL version:"
openssl version || echo "OpenSSL not found"

# Check for required .so files
echo ""
echo "🔍 Checking for libssl libraries:"
ldconfig -p | grep libssl || echo "No libssl found in ldconfig"

# List generated Prisma engines
echo ""
echo "📁 Generated Prisma engines:"
ls -lh node_modules/.prisma/client/*.node 2>/dev/null || echo "No Prisma engines found"

# Check system info
echo ""
echo "💻 System info:"
uname -a
cat /etc/os-release 2>/dev/null || echo "OS info not available"

echo ""
echo "✅ Engine check complete"
