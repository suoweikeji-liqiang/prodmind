import { createClient } from '@/lib/supabase/server';
import { exportSessionToMarkdown } from '@/lib/engine/export';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const md = await exportSessionToMarkdown(supabase, id);
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="prodmind-${id.slice(0, 8)}.md"`,
    },
  });
}
