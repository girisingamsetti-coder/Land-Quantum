# APCRDA Portal Worklog

---
Task ID: 1
Agent: Main Agent
Task: Fix APCRDA Portal - blank page showing only Z logo in preview panel

Work Log:
- **Root cause 1**: `index-kanban.tsx` had a circular import (re-exported from itself), causing turbopack compilation to hang indefinitely
- **Root cause 2**: Prisma query logging (`log: ['query']`) generating massive I/O, destabilizing turbopack in the memory-constrained sandbox
- **Root cause 3**: No Node.js heap size limit, causing the kata-agent hypervisor to kill the process when Chrome (agent-browser) + Next.js exceeded sandbox memory limits

- Fixed circular import by writing a proper 180-line WorkflowKanban component
- Made ApplicationDetail lazy in app-shell.tsx
- Disabled Prisma query logging in db.ts
- Removed `output: "standalone"` from next.config.ts
- Fixed dev script in package.json (removed `| tee dev.log` pipe)
- Built production version with `npx next build` (8.7s, 21 routes)
- Set `NODE_OPTIONS='--max-old-space-size=384'` for stable production serving
- Created watchdog serve.sh for auto-restart

Stage Summary:
- Portal fully verified: Login → Dashboard (15 apps, 25 parcels, ₹1.06Cr revenue) → Applications table
- Production build is the only stable mode (turbopack crashes in this sandbox due to kata-agent cache dropping)
- Key startup: `NODE_ENV=production NODE_OPTIONS='--max-old-space-size=384' npx next start -p 3000`
- Demo credentials: admin@amaravati-demo.gov.in / Admin@12345
