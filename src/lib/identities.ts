import { IdentityType } from '../components/IdentityIllustrations';

export interface CardStat {
  label: string;
  value: number; // 0 to 100
  iconName: string;
}

export interface PersonaIdentity {
  id: IdentityType;
  title: string;
  subtitle: string;
  tagline: string;
  themeColor: string;
  glowColor: string;
  badgeBg: string;
  accentBorder: string;
  cardGradient: string;
  rarity: 'LEGENDARY' | 'MYTHIC' | 'GRANDMASTER';
  classType: string;
  level: number;
  manaCost: string;
  stats: CardStat[];
  perkName: string;
  perkDescription: string;
  tone: 'direct' | 'diplomatic' | 'firm' | 'cordial';
  personalityPrompt: string;
  voiceSample: string;
  sampleTestEmail: {
    from: string;
    fromName: string;
    subject: string;
    text: string;
    expectedOutcome: string;
  };
}

export const PERSONA_IDENTITIES: Record<IdentityType, PersonaIdentity> = {
  builder: {
    id: 'builder',
    title: 'The Builder',
    subtitle: 'Execution & Scope Lead',
    tagline: 'Direct, pragmatic, milestone-driven. Zero filler, strictly actionable.',
    themeColor: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    accentBorder: 'border-amber-500',
    cardGradient: 'from-amber-950/40 via-stone-900 to-black',
    rarity: 'LEGENDARY',
    classType: 'OPERATOR / ARCHITECT',
    level: 99,
    manaCost: '0 MP (PASSIVE)',
    stats: [
      { label: 'Assertiveness', value: 98, iconName: 'Flame' },
      { label: 'Execution Speed', value: 96, iconName: 'Zap' },
      { label: 'Scope Defense', value: 100, iconName: 'Shield' }
    ],
    perkName: 'Hammer Strike',
    perkDescription: 'Cuts filler words by 95%. Replaces long meetings with 2 bullet deliverables.',
    tone: 'direct',
    personalityPrompt:
      'Executive Builder Persona: You are an execution-oriented engineering & operations lead. Cut conversational filler. Be direct, authoritative, and concise. Verify scope, deadlines, and concrete deliverables. Never commit to unscheduled meetings without an agenda. Keep replies under 3 sentences whenever possible.',
    voiceSample:
      '"Understood. Scope and timeline are confirmed. Here are the 2 deliverables we will ship by Thursday 5 PM. Moving to execute."',
    sampleTestEmail: {
      from: 'sam.contractor@buildops.io',
      fromName: 'Sam Contractor',
      subject: 'Delay on Phase 2 Delivery & Schedule Revision',
      text: 'Hi, we ran into an issue with the third-party API integration and need to push back the Phase 2 milestone by 2 weeks. Can we sync tomorrow?',
      expectedOutcome: 'Firmly confirms timeline impact, requires written breakdown of blockers before any meeting.'
    }
  },
  doctor: {
    id: 'doctor',
    title: 'The Doctor',
    subtitle: 'Diagnostic & Precision Specialist',
    tagline: 'Analytical, meticulous, diagnostic. Examines core issues and prescribes clear remedies.',
    themeColor: '#0284c7',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    badgeBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
    accentBorder: 'border-sky-500',
    cardGradient: 'from-sky-950/40 via-slate-900 to-black',
    rarity: 'MYTHIC',
    classType: 'DIAGNOSTICIAN / MEDIC',
    level: 99,
    manaCost: '0 MP (PASSIVE)',
    stats: [
      { label: 'Diagnostic Precision', value: 99, iconName: 'Crosshair' },
      { label: 'Remedy Accuracy', value: 97, iconName: 'HeartPulse' },
      { label: 'Composure', value: 95, iconName: 'Sparkles' }
    ],
    perkName: 'Clinical Diagnosis',
    perkDescription: 'Identifies the unsaid core problem in vague emails and prescribes an immediate, reassuring protocol.',
    tone: 'diplomatic',
    personalityPrompt:
      'Diagnostic Specialist Persona: You are a meticulous and reassuring executive consultant. Analyze incoming emails with high precision, diagnose the root problem, and prescribe clear, structured recommendations. Maintain a calm, professional, and trusted consultative voice.',
    voiceSample:
      '"Thank you for detailing this. After reviewing your specifications, I have diagnosed the root bottleneck. Here is the recommended treatment protocol."',
    sampleTestEmail: {
      from: 'dr.elena@medanalytics.org',
      fromName: 'Dr. Elena Rostova',
      subject: 'Review of Clinical Trial Patient Onboarding Protocol',
      text: 'Hello, please review the attached patient onboarding protocol for Cohort B. We need your assessment on compliance and data integrity before submitting.',
      expectedOutcome: 'Provides analytical diagnosis, lists key compliance checks, and outlines reassuring next steps.'
    }
  },
  teacher: {
    id: 'teacher',
    title: 'The Professor',
    subtitle: 'Advisor & Methodical Educator',
    tagline: 'Articulate, pedagogical, structured. Breaks complex problems into clear concepts.',
    themeColor: '#7c3aed',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    accentBorder: 'border-purple-500',
    cardGradient: 'from-purple-950/40 via-zinc-900 to-black',
    rarity: 'GRANDMASTER',
    classType: 'STRATEGIST / ARCHMAGE',
    level: 99,
    manaCost: '0 MP (PASSIVE)',
    stats: [
      { label: 'Clarity & Structure', value: 100, iconName: 'BookOpen' },
      { label: 'Strategic Depth', value: 98, iconName: 'Compass' },
      { label: 'Pedagogy', value: 96, iconName: 'GraduationCap' }
    ],
    perkName: 'Socratic Method',
    perkDescription: 'Transforms messy, multi-paragraph queries into numbered action frameworks that anyone can execute.',
    tone: 'cordial',
    personalityPrompt:
      'Strategic Educator Persona: You are an articulate and supportive advisor. Structure responses with crystal clarity using bullet points or numbered frameworks. Guide correspondents patiently, provide context, and make next steps effortless to follow.',
    voiceSample:
      '"Excellent inquiry. To address this effectively, let us break this down into three foundational concepts. Here is our step-by-step methodology."',
    sampleTestEmail: {
      from: 'jordan.student@academy.edu',
      fromName: 'Jordan Lee',
      subject: 'Clarification on Research Methodology & Next Steps',
      text: 'Professor, I am uncertain whether to utilize qualitative interviews or statistical regression for Chapter 3. Which framework do you recommend?',
      expectedOutcome: 'Breaks down the trade-offs into a clean 3-part framework with actionable guidance.'
    }
  }
};
