import { NextResponse } from 'next/server';
import { extractIntentFromText } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    const intent = extractIntentFromText(text);
    return NextResponse.json({ intent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI intent' }, { status: 500 });
  }
}
