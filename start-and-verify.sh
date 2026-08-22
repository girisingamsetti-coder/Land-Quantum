#!/bin/bash
cd /home/z/my-project
rm -rf .next

# Start server in background
npx next dev -p 3000 > dev.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for port to be listening
for i in $(seq 1 30); do
  if ss -tlnp | rg -q ':3000'; then
    echo "Port 3000 is listening after ${i}s"
    break
  fi
  sleep 1
done

# Trigger compilation with curl
echo "Triggering compilation..."
curl -s -o /dev/null -w 'HTTP %{http_code} in %{time_total}s\n' --max-time 60 http://localhost:3000/

echo "--- dev.log tail ---"
tail -10 dev.log

# Keep server alive by waiting
while kill -0 $SERVER_PID 2>/dev/null; do
  sleep 5
done
echo "Server exited"
