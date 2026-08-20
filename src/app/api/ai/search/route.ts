import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, num = 8 } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const numResults = Math.min(Math.max(parseInt(String(num)) || 8, 1), 20);

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const results = await zai.functions.invoke('web_search', {
      query,
      num: numResults,
    });

    const formatted = (results || []).map((item: Record<string, unknown>, index: number) => ({
      position: index + 1,
      title: item.name || '',
      url: item.url || '',
      description: item.snippet || '',
      domain: item.host_name || '',
      date: item.date || '',
    }));

    return NextResponse.json({
      success: true,
      query,
      totalResults: formatted.length,
      results: formatted,
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search' },
      { status: 500 }
    );
  }
}
