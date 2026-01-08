import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // WebSocket upgrade handling for Next.js
    // This is a placeholder - actual WebSocket implementation requires different approach
    return new Response("WebSocket endpoint - use client-side WebSocket connection", {
        status: 200,
    });
}
