#!/bin/bash
cd /home/z/my-project

while true; do
  rm -rf .next
  echo "[$(date)] Starting dev server..." >> dev.log
  
  # Use FIFO to keep process alive across shell sessions
  mkfifo /tmp/server-pipe 2>/dev/null
  
  npx next dev -p 3000 < /dev/null > /tmp/server-pipe 2>&1 &
  SERVER_PID=$!
  
  # Keep pipe open by redirecting to log
  cat /tmp/server-pipe >> dev.log &
  CAT_PID=$!
  
  # Wait for server to die
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 10
  done
  
  # Cleanup
  kill $CAT_PID 2>/dev/null
  rm -f /tmp/server-pipe
  
  echo "[$(date)] Server died, restarting in 3s..." >> dev.log
  sleep 3
done