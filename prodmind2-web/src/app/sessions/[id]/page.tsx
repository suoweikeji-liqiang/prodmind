import { WarRoom } from '@/components/layout/war-room';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WarRoom sessionId={id} />;
}
