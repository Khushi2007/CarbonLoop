import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { calculateRoute } from "../../../lib/routing/routing";

const requestSchema = z.object({
  wasteLotId: z.string().uuid(),
  facilityId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const { wasteLotId, facilityId } = result.data;
    const routingResult = await calculateRoute(wasteLotId, facilityId);

    if ("code" in routingResult) {
      // Map domain errors to HTTP status codes
      switch (routingResult.code) {
        case "NOT_FOUND":
          return NextResponse.json(
            { error: routingResult.message },
            { status: 404 }
          );
        case "INVALID_COORDINATES":
        case "NO_ROUTE":
          return NextResponse.json(
            { error: routingResult.message },
            { status: 422 }
          );
        case "NETWORK_ERROR":
        case "INVALID_RESPONSE":
          return NextResponse.json(
            { error: routingResult.message },
            { status: 502 }
          );
        default:
          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(routingResult, { status: 200 });
  } catch (error) {
    console.error("Error in /api/routes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
