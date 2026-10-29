import { ToneType, LengthType } from '../types';

export function buildEmailSystemPrompt(customOverride?: string): string {
  if (customOverride && customOverride.trim().length > 0) {
    return customOverride.trim();
  }

  return `You are QuickReply, a witty, brilliant, and thoughtful executive communication assistant.
Your goal is to write natural, contextually flawless, human-sounding email replies that make people smile with how effortless and articulate they are.

Strict Instructions:
1. LANGUAGE FIDELITY: Detect the primary language of the incoming email (English, Spanish, French, German, Japanese, etc.) and write the entire response in that EXACT SAME LANGUAGE.
2. NO ROBOTIC CLICHÉS: Never use tired clichés like "I hope this email finds you well", "Per my previous email", "Thank you for reaching out to me today", or AI disclosures. Sound like an energetic, capable, human colleague.
3. TONE FIDELITY:
   - "professional": Polished, courteous, executive-ready, crisp.
   - "friendly": Warm, cheerful, collegial, bright.
   - "concise": Razor-sharp, punchy, high-signal, zero fluff.
   - "enthusiastic": High-energy, genuinely hyped, appreciative, joyful!
   - "polite_decline": Firm, graceful, polite pass without guilt or awkwardness.
   - "casual": Relaxed, friendly peer-to-peer vibe, smooth and easygoing.
4. LENGTH FIDELITY:
   - "short": 2 to 3 crisp lines. Direct to action.
   - "medium": 1 to 2 balanced, pleasant paragraphs.
   - "detailed": Comprehensive breakdown covering all points.
5. KEY POINTS: Seamlessly incorporate every single user-provided key point.
6. OUTPUT PURITY: Output ONLY the email text ready to send. No preamble, no quotes.`;
}

export interface GenerateReplyParams {
  apiKey?: string;
  incomingEmail: string;
  tone: ToneType;
  length: LengthType;
  keyPoints?: string;
  senderName?: string;
  signature?: string;
  model?: string;
  customPrompt?: string;
}

/**
 * Intelligent client-side fallback draft generator when API key is not yet supplied.
 * Guarantees zero-friction instant use without forcing user to configure keys first!
 */
export function generateSmartFallbackDraft(params: GenerateReplyParams): string {
  const { incomingEmail, tone, keyPoints, senderName, signature } = params;
  const name = senderName || 'Alex';
  const sig = signature ? `\n\n${signature}` : `\n\nBest,\n${name}`;

  // Extract recipient name from incoming email
  let recipient = 'there';
  const fromMatch = incomingEmail.match(/(?:Hi|Hello|Hey|Dear)\s+([A-Za-z]+)/i);
  const senderMatch = incomingEmail.match(/(?:Warmly|Best|Cheers|Regards|Thanks),\s*\n*([A-Za-z]+)/i);
  if (senderMatch) recipient = senderMatch[1];
  else if (fromMatch) recipient = fromMatch[1];

  let greeting = `Hi ${recipient},`;
  if (tone === 'casual' || tone === 'enthusiastic') greeting = `Hey ${recipient}!`;
  if (tone === 'concise') greeting = `Hi ${recipient} —`;

  let body = '';
  if (tone === 'enthusiastic') {
    body = `Thanks so much for reaching out! Really excited about this.\n\n${
      keyPoints ? keyPoints.replace(/^[•\s-]+/gm, '• ') : 'Looking forward to syncing up and moving forward.'
    }\n\nCan’t wait to connect soon!`;
  } else if (tone === 'polite_decline') {
    body = `Thank you for thinking of me and sharing the details.\n\nUnfortunately, with our current sprint commitments and bandwidth constraints, I won't be able to take this on right now.\n\n${
      keyPoints ? `${keyPoints}\n\n` : ''
    }I appreciate your understanding and wish you all the best with this project!`;
  } else if (tone === 'concise') {
    body = `Thanks for the update.\n\n${
      keyPoints ? keyPoints : 'Acknowledging receipt and confirming next steps as outlined.'
    }\n\nLet me know if you need anything else from my end.`;
  } else if (tone === 'casual') {
    body = `Hope your week is rolling along smoothly!\n\n${
      keyPoints ? keyPoints : 'Sounds good to me — let’s lock it in.'
    }\n\nCatch you soon!`;
  } else if (tone === 'friendly') {
    body = `Great to hear from you! Thanks for checking in.\n\n${
      keyPoints ? keyPoints : 'Everything looks good on our end. Let me know if you want to jump on a quick call to wrap up details.'
    }\n\nHave a fantastic rest of your week!`;
  } else {
    // Professional
    body = `Thank you for your email and for following up on this.\n\n${
      keyPoints ? keyPoints : 'I have reviewed the information and agree with the proposed direction.'
    }\n\nPlease let me know if any further clarification or documentation is needed on our side.`;
  }

  return `${greeting}\n\n${body}${sig}`;
}

/**
 * Calls Gemini API if apiKey is present, otherwise gracefully generates smart draft
 */
export async function generateEmailReply(params: GenerateReplyParams): Promise<{ replyText: string; isAiPowered: boolean }> {
  const {
    apiKey,
    incomingEmail,
    tone,
    length,
    keyPoints,
    senderName,
    signature,
    model = 'gemini-2.5-flash',
    customPrompt
  } = params;

  if (!incomingEmail || incomingEmail.trim().length === 0) {
    throw new Error('Please select or paste an email before generating.');
  }

  // If no API key is provided, use the instant zero-friction smart template generator
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      replyText: generateSmartFallbackDraft(params),
      isAiPowered: false
    };
  }

  const systemInstructionText = buildEmailSystemPrompt(customPrompt);

  const promptParts: string[] = [
    `=== INCOMING EMAIL TO REPLY TO ===\n${incomingEmail.trim()}\n`,
    `=== REPLY SPECIFICATIONS ===`,
    `- Tone: ${tone}`,
    `- Desired Length: ${length}`,
  ];

  if (keyPoints && keyPoints.trim().length > 0) {
    promptParts.push(`- Key Points that MUST be covered:\n${keyPoints.trim()}`);
  }

  if (senderName && senderName.trim().length > 0) {
    promptParts.push(`- My Name: ${senderName.trim()}`);
  }

  if (signature && signature.trim().length > 0) {
    promptParts.push(`- My Signature:\n${signature.trim()}`);
  }

  promptParts.push(`\nPlease write the complete, natural email reply:`);

  const userPromptContent = promptParts.join('\n');
  const targetModel = model.trim() || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey.trim()}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userPromptContent }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    generationConfig: {
      temperature: tone === 'concise' ? 0.3 : 0.8,
      maxOutputTokens: length === 'short' ? 400 : length === 'medium' ? 800 : 1600,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = await response.text();
    }

    if (response.status === 400 && errorDetail.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API Key. Please verify the key in Settings.');
    } else if (response.status === 429) {
      throw new Error('Gemini API rate limit reached. Please wait a few seconds and try again.');
    } else {
      throw new Error(`Gemini API Error (${response.status}): ${errorDetail || 'Unknown error'}`);
    }
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!replyText || replyText.trim().length === 0) {
    throw new Error('Received an empty response from Gemini. Please retry.');
  }

  return {
    replyText: replyText.trim(),
    isAiPowered: true
  };
}

export async function testApiKeyConnection(apiKey: string, model: string = 'gemini-2.5-flash'): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 5) {
    return { success: false, message: 'Please enter a valid API key string.' };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model.trim()}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with the word "OK"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      return { success: true, message: 'Woohoo! 🎉 Gemini API key is valid and ready to rock.' };
    }

    const err = await response.json().catch(() => ({}));
    return {
      success: false,
      message: err.error?.message || `HTTP ${response.status}: Verification failed.`
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Network error contacting Google Gemini API.'
    };
  }
}
