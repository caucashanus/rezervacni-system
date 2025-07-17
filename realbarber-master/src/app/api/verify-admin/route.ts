import { NextRequest, NextResponse } from 'next/server';

// В реальном приложении это должно быть в .env
const ADMIN_TOKENS = {
  'modrany': 'iVENIaNtIncESToRnEWPOlItUsEpiC',
  'hagibor': 'iVENIaNtIncESToRnEWPOlItUsEpiC',
  'kacerov': 'iVENIaNtIncESToRnEWPOlItUsEpiC'
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const location = searchParams.get('location');

  if (!token || !location) {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }

  // Проверяем токен для конкретной локации
  const isValid = ADMIN_TOKENS[location as keyof typeof ADMIN_TOKENS] === token;

  return NextResponse.json({ isAdmin: isValid });
} 