import { NextRequest, NextResponse } from 'next/server';

const conversations = new Map<string, Array<{ role: string; content: string }>>();

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId = 'default', systemPrompt } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    // Get or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [
        {
          role: 'assistant',
          content: systemPrompt || 'You are a helpful, friendly AI assistant. Provide clear, concise, and informative responses. Use markdown formatting when appropriate.',
        },
      ]);
    }

    const history = conversations.get(sessionId)!;

    // Add user message
    history.push({ role: 'user', content: message });

    // Trim history to keep last 20 messages
    if (history.length > 21) {
      const systemMsg = history[0];
      const trimmed = history.slice(-20);
      conversations.set(sessionId, [systemMsg, ...trimmed]);
    }

    const completion = await zai.chat.completions.create({
      messages: conversations.get(sessionId)!,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content;

    if (response) {
      conversations.get(sessionId)!.push({ role: 'assistant', content: response });
    }

    return NextResponse.json({
      success: true,
      response: response || 'Sorry, I could not generate a response.',
      messageCount: conversations.get(sessionId)!.length - 1,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'default';
  conversations.delete(sessionId);
  return NextResponse.json({ success: true });
}
