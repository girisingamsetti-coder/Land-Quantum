#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>&1 | tee -a dev.log
echo "[$(date)] === SERVER DIED, RESTARTING ===" >> dev.log
  sleep 2
done