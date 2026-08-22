#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_ENV=production NODE_OPTIONS='--max-old-space-size=384' npx next start -p 3000 </dev/null 2>&1
  sleep 3
done
