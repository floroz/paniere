import Fastify from "fastify";

const app = Fastify({ logger: true });

// Health check endpoint
app.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

// Start server
await app.listen({
  port: parseInt(process.env.PORT || "3000"),
  host: "0.0.0.0",
});

console.log(`🚀 Backend server running on port ${process.env.PORT || 3000}`);
