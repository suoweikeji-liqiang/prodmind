import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: providers } = await supabase
    .from('provider_configs').select('*').eq('user_id', user.id);
  const { data: routings } = await supabase
    .from('agent_routings').select('*').eq('user_id', user.id);

  return NextResponse.json({ providers: providers ?? [], routings: routings ?? [] });
}
