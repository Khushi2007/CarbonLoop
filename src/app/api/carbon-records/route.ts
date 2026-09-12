import { NextResponse } from "next/server";

import { listCarbonRecords } from "../../../lib/ledger/ledger";

export async function GET() { try { return NextResponse.json({ records: await listCarbonRecords() }); } catch { return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); } }
