#!/bin/bash
# Build script: combines individual product JSONs into a single products.json
# Run: bash build.sh

echo "Building products.json..."
cd "$(dirname "$0")"

# Combine all product JSONs into an array
echo "[" > data/products.json
first=true
for f in data/products/*.json; do
  [ -f "$f" ] || continue
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> data/products.json
  fi
  cat "$f" >> data/products.json
done
echo "]" >> data/products.json

echo "Done! $(ls data/products/*.json 2>/dev/null | wc -l | tr -d ' ') products combined into data/products.json"
