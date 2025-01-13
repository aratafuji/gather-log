import { NextRequest, NextResponse } from 'next/server';
import { readJSONFile, writeJSONFile } from '@/utils/fileOperations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
  }

  const data = await readJSONFile(`${type}.json`);
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { type, data } = await request.json();

  if (!type || !data) {
    return NextResponse.json({ error: 'Type and data are required' }, { status: 400 });
  }

  await writeJSONFile(`${type}.json`, data);
  return NextResponse.json({ success: true });
}

