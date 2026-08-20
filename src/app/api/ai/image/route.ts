import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_SIZES = [
  '1024x1024',
  '768x1344',
  '864x1152',
  '1344x768',
  '1152x864',
  '1440x720',
  '720x1440',
];

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!SUPPORTED_SIZES.includes(size)) {
      return NextResponse.json({ error: `Unsupported size. Use one of: ${SUPPORTED_SIZES.join(', ')}` }, { status: 400 });
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: size,
    });

    const imageBase64 = response.data[0].base64;

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${imageBase64}`,
      prompt,
      size,
    });
  } catch (error) {
    console.error('Image API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
