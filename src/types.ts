/**
 * QuickReply Application Types
 */

export type ToneType =
  | 'professional'
  | 'friendly'
  | 'concise'
  | 'enthusiastic'
  | 'polite_decline'
  | 'casual';

export type LengthType = 'short' | 'medium' | 'detailed';

export interface GeneratedReply {
  id: string;
  timestamp: number;
  originalEmailSnippet: string;
  fullOriginalEmail: string;
  tone: ToneType;
  length: LengthType;
  keyPoints: string;
  senderName: string;
  signature: string;
  replyText: string;
  charCount: number;
  wordCount: number;
  recipientEmail?: string;
  subject?: string;
  threadId?: string;
}

export interface UserSettings {
  googleClientId: string;
  geminiApiKey: string;
  defaultName: string;
  defaultSignature: string;
  defaultTone: ToneType;
  defaultLength: LengthType;
  selectedModel: string;
  customSystemPrompt: string;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  confettiEnabled: boolean;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromName: string;
  fromEmail: string;
  date: string;
  snippet: string;
  bodyText: string;
  messageIdHeader: string;
  referencesHeader: string;
  avatarEmoji?: string;
  badgeTag?: string;
  replied?: boolean;
}

export interface SampleEmail {
  id: string;
  label: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
  date: string;
  avatarEmoji: string;
  badgeTag: string;
  recommendedTone: ToneType;
  recommendedLength: LengthType;
  suggestedPoints: string;
  replied?: boolean;
}
