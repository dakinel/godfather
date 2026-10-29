import { GmailMessageSummary } from '../types';

/**
 * Safely decodes base64url strings returned by the Gmail API
 */
export function decodeBase64Url(input: string): string {
  if (!input) return '';
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    try {
      return decodeURIComponent(escape(atob(input.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch {
      return '';
    }
  }
}

/**
 * Recursively extracts plain text body from Gmail message parts
 */
export function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';

  // Direct body data
  if (payload.body && payload.body.data && payload.mimeType === 'text/plain') {
    return decodeBase64Url(payload.body.data);
  }

  // Check parts
  if (payload.parts && Array.isArray(payload.parts)) {
    // Look for text/plain part first
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Check nested parts (multipart/alternative or multipart/related)
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested) return nested;
      }
    }
    // Fallback to text/html stripped of tags
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body && part.body.data) {
        const html = decodeBase64Url(part.body.data);
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }

  // Fallback if body data is present on non-text/plain
  if (payload.body && payload.body.data) {
    const text = decodeBase64Url(payload.body.data);
    return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return '';
}

/**
 * Parses "John Doe <john@domain.com>" into name and email
 */
export function parseFromHeader(fromStr: string): { name: string; email: string } {
  if (!fromStr) return { name: '', email: '' };
  const match = fromStr.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    const name = match[1].replace(/^["']|["']$/g, '').trim();
    return { name: name || match[2], email: match[2].trim() };
  }
  return { name: fromStr.trim(), email: fromStr.trim() };
}

/**
 * Fetches the user's latest inbox emails via Gmail REST API
 */
export async function fetchInboxMessages(accessToken: string, maxResults = 10): Promise<GmailMessageSummary[]> {
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error('AUTH_EXPIRED: Gmail authorization expired. Please reconnect.');
    }
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch messages (HTTP ${listRes.status})`);
  }

  const listData = await listRes.json();
  const messagesList = listData.messages || [];

  if (messagesList.length === 0) {
    return [];
  }

  // Fetch full details for the retrieved messages in parallel
  const detailPromises = messagesList.map(async (item: { id: string }) => {
    try {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`;
      const detailRes = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!detailRes.ok) return null;
      const data = await detailRes.json();

      const headers = data.payload?.headers || [];
      const getHeader = (name: string) => {
        const found = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return found ? found.value : '';
      };

      const subject = getHeader('Subject') || '(No Subject)';
      const from = getHeader('From') || 'Unknown Sender';
      const date = getHeader('Date') || '';
      const messageIdHeader = getHeader('Message-ID') || '';
      const referencesHeader = getHeader('References') || '';
      const { name: fromName, email: fromEmail } = parseFromHeader(from);

      const bodyText = extractBodyFromPayload(data.payload) || data.snippet || '';

      const summary: GmailMessageSummary = {
        id: data.id,
        threadId: data.threadId,
        subject,
        from,
        fromName,
        fromEmail,
        date,
        snippet: data.snippet || '',
        bodyText: bodyText.trim(),
        messageIdHeader,
        referencesHeader
      };

      return summary;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(detailPromises);
  return results.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Sends a reply to an existing Gmail thread via Gmail API
 */
export async function sendGmailReply(params: {
  accessToken: string;
  toEmail: string;
  subject: string;
  replyBody: string;
  threadId: string;
  messageIdHeader?: string;
  referencesHeader?: string;
}): Promise<{ id: string; threadId: string }> {
  const { accessToken, toEmail, subject, replyBody, threadId, messageIdHeader, referencesHeader } = params;

  // Construct RFC 2822 email format
  const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;
  const lines: string[] = [
    `To: ${toEmail}`,
    `Subject: ${replySubject}`,
  ];

  if (messageIdHeader) {
    lines.push(`In-Reply-To: ${messageIdHeader}`);
    const refs = referencesHeader ? `${referencesHeader} ${messageIdHeader}` : messageIdHeader;
    lines.push(`References: ${refs}`);
  }

  lines.push('Content-Type: text/plain; charset=UTF-8');
  lines.push('');
  lines.push(replyBody);

  const rawRfc = lines.join('\r\n');

  // URL-Safe Base64 encode
  const utf8Bytes = new TextEncoder().encode(rawRfc);
  let binary = '';
  utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const sendUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  const response = await fetch(sendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64,
      threadId: threadId
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email reply (HTTP ${response.status})`);
  }

  return response.json();
}
