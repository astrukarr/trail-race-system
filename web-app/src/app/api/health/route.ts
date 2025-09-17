export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "web-app",
    version: "1.0.0",
  });
}
