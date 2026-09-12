import { LedgerRecordDetail } from "@/components/ledger-record-detail";

export default async function LedgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LedgerRecordDetail id={id} />;
}
