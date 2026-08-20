#!/bin/sh
cd /home/z/my-project
rm -rf .next
export NODE_OPTIONS="--max-old-space-size=512"
while true; do
  npx next dev -p 3000 </dev/null 2>&1
  echo "Server died at $(date), restarting..." >> /home/z/my-project/server.log
  sleep 1
done
