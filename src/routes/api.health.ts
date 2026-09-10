import { createFileRoute } from "@tanstack/react-router";
import { neon } from "@neondatabase/serverless";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const candidates = {
          DATABASE_URL: Boolean(process.env.DATABASE_URL),
          POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
          NEON_DATABASE_URL: Boolean(process.env.NEON_DATABASE_URL),
          DATABASE_URL_UNPOOLED: Boolean(process.env.DATABASE_URL_UNPOOLED),
        };

        const connectionString =
          process.env.DATABASE_URL ??
          process.env.POSTGRES_URL ??
          process.env.NEON_DATABASE_URL ??
          process.env.DATABASE_URL_UNPOOLED;

        if (!connectionString) {
          return Response.json(
            { ok: false, databaseConfigured: false, candidates },
            { status: 503 },
          );
        }

        try {
          const sql = neon(connectionString);
          const rows = await sql`SELECT current_database() AS db, current_user AS usr`;
          return Response.json({
            ok: true,
            databaseConfigured: true,
            databaseReachable: true,
            candidates,
            database: String(rows[0]?.db ?? "unknown"),
          });
        } catch (error) {
          return Response.json(
            {
              ok: false,
              databaseConfigured: true,
              databaseReachable: false,
              candidates,
              error: error instanceof Error ? error.message : "Database connection failed",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});
