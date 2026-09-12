import { WasteLotDetail } from "@/components/waste-lot-detail";

export default async function WasteLotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WasteLotDetail id={id} />;
}
