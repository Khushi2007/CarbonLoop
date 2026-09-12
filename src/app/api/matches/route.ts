import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findMatchesForWasteLot } from "../../../lib/matching/matching";

const requestSchema = z.object({
  wasteLotId: z.string().uuid(),
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

    const { wasteLotId } = result.data;
    const matchingResult = await findMatchesForWasteLot(wasteLotId);

    if ("code" in matchingResult) {
      if (matchingResult.code === "NOT_FOUND") {
        return NextResponse.json(
          { error: matchingResult.message },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: matchingResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json(matchingResult, { status: 200 });
  } catch (error) {
    console.error("Error in /api/matches:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
