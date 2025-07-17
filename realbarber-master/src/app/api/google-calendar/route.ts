import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/google';

// Кеш для API-эндпоинта (на уровне процесса)
const apiCache: { [key: string]: { data: any; timestamp: number } } = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location'); // 'modrany', 'hagibor', 'kacerov'
  if (!location) {
    return NextResponse.json({ error: 'location param required' }, { status: 400 });
  }
  const now = Date.now();
  if (apiCache[location] && now - apiCache[location].timestamp < 5000) {
    return NextResponse.json(apiCache[location].data);
  }
  try {
    const date = searchParams.get('date'); // '2024-05-17'
    const events = await getEvents(location as 'modrany' | 'hagibor' | 'kacerov', date);
    apiCache[location] = { data: events, timestamp: now };
    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
} 