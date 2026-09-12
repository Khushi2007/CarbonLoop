import { NextResponse } from "next/server";

import { listWasteLots } from "../../../lib/wasteLots/wasteLots";

export async function GET() {
  try {
    return NextResponse.json({ wasteLots: await listWasteLots() });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
