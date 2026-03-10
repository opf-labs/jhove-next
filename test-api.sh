#!/bin/bash
# Test script to verify JHOVE API connectivity

API_BASE="https://jhove-rs.openpreservation.org"

echo "Testing JHOVE API at: $API_BASE"
echo ""

echo "1. Getting API info..."
curl -s "$API_BASE/api/info" | jq . || curl -s "$API_BASE/api/info"
echo ""

echo "2. Listing available modules..."
curl -s "$API_BASE/api/jhove/modules" | jq '[.[].moduleId.name]' || curl -s "$API_BASE/api/jhove/modules"
echo ""

echo "3. Getting JHOVE version..."
curl -s "$API_BASE/api/jhove" | jq . || curl -s "$API_BASE/api/jhove"
echo ""

echo "Done! API is accessible."
