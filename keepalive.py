import os, subprocess, signal, sys, time

os.chdir('/home/z/my-project')

for sig in (signal.SIGTERM, signal.SIGHUP, signal.SIGINT):
    signal.signal(sig, lambda s, f: None)

while True:
    if os.path.exists('/home/z/my-project/.next'):
        pass
    proc = subprocess.Popen(
        ['npx', 'next', 'dev', '-p', '3000'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        preexec_fn=lambda: os.setsid(),
    )
    proc.wait()
    time.sleep(2)
