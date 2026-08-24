# Land Quantum

A production-ready full-stack application built with Next.js, React, TypeScript, PostgreSQL, and Prisma ORM.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy the example environment file and fill in your actual credentials. **Never commit the `.env` file to version control.**
   ```bash
   cp .env.example .env
   ```
   Provide your actual `DATABASE_URL` for a PostgreSQL database.

3. **Generate Prisma Client**:
   This creates the Prisma client tailored to your schema.
   ```bash
   npx prisma generate
   ```

4. **Run Migrations (Development)**:
   This applies the schema to your development database.
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Vercel Deployment

This application is configured for a serverless environment (Vercel):
- **Prisma Singleton**: Ensures database connections are efficiently reused without exhausting the connection pool.
- **External Storage**: (TODO) File uploads must be sent to an external provider (like S3 or Vercel Blob) since Vercel's filesystem is read-only in production.
- **Environment Variables**: Make sure to add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` to your Vercel project settings.

To deploy:
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Configure the environment variables.
4. Deploy. Vercel's build step will automatically run `prisma generate` (usually hooked into the build script or postinstall). Ensure your `build` script in `package.json` includes `prisma generate && next build` if Vercel doesn't auto-detect it.
