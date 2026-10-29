import { SampleEmail, ToneType } from '../types';

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: 'demo-sarah',
    label: 'Meeting Reschedule',
    subject: 'Can we shift our Q4 sync to Friday?',
    body: `Hi Alex,

Hope you're having an awesome week!

Can we reschedule our project sync originally planned for Thursday at 2:00 PM EST? Our analytics team is still wrapping up the quarterly retention numbers, and I really want to make sure we have the live charts ready before we go through the deck together.

Would Friday anytime after 2:30 PM EST or next Monday morning work on your end instead? Let me know what fits your schedule best!

Warmly,
Sarah Jenkins
VP of Product, CloudScale Inc.`,
    fromName: 'Sarah Jenkins',
    fromEmail: 'sarah.jenkins@cloudscale.io',
    date: '10:42 AM',
    avatarEmoji: '👩‍💼',
    badgeTag: 'Urgent Sync',
    recommendedTone: 'professional',
    recommendedLength: 'medium',
    suggestedPoints: 'Agree to Friday at 3:30 PM EST. Mention excited to see the retention metrics.'
  },
  {
    id: 'demo-recruiter',
    label: 'Job Offer / Interview',
    subject: 'Next Steps: Lead Engineer role at Stripe',
    body: `Hey Alex,

The engineering directors here loved your technical conversation last Thursday! Everyone noted how clear your architectural thinking was on real-time systems.

We’d love to bring you in for the final conversational chat with our VP of Engineering early next week. Do you have 45 minutes on Tuesday or Wednesday afternoon?

Super excited about the prospect of having you on the team.

Cheers,
Marco Chen
Senior Talent Partner, Stripe`,
    fromName: 'Marco Chen',
    fromEmail: 'm.chen@recruiting.stripe.com',
    date: 'Yesterday',
    avatarEmoji: '🚀',
    badgeTag: 'Exciting!',
    recommendedTone: 'enthusiastic',
    recommendedLength: 'short',
    suggestedPoints: 'Thank them enthusiastically. Confirm availability for Tuesday at 2 PM. Ask if there is anything specific to prepare.'
  },
  {
    id: 'demo-pizza',
    label: 'Office Pizza Friday',
    subject: '🍕 Pizza Friday Poll & Dietaries!',
    body: `Hey Team!

It’s our monthly Pizza Friday celebration this week! We are ordering from Tony's Artisan Pizzeria.

Please let me know:
1. Are you joining in person?
2. Any toppings you crave or dietary restrictions (vegan, gluten-free, dairy-free)?

Reply by 2 PM today so I can get the order in on time! 🍕✨

Best,
Sammy
Office Happiness Lead`,
    fromName: 'Sammy (Office Ops)',
    fromEmail: 'ops@company.com',
    date: 'Oct 28',
    avatarEmoji: '🍕',
    badgeTag: 'Team Fun',
    recommendedTone: 'casual',
    recommendedLength: 'short',
    suggestedPoints: 'Confirm attending in person. Vote for Margherita and spicy salami. Mention no dietary restrictions.'
  },
  {
    id: 'demo-client-invoice',
    label: 'Billing Inquiry',
    subject: 'Question regarding invoice #INV-8892',
    body: `Hi there,

We received invoice #INV-8892 yesterday for the cloud migration milestone. Could you clarify the line item for extra compute instances during weekend staging?

Once we have that brief breakdown, our finance team will release payment immediately.

Thanks for your help!

Regards,
Elena Rostova
Finance Operations Manager`,
    fromName: 'Elena Rostova',
    fromEmail: 'elena@vanguard-corp.com',
    date: 'Oct 27',
    avatarEmoji: '📊',
    badgeTag: 'Finance',
    recommendedTone: 'concise',
    recommendedLength: 'medium',
    suggestedPoints: 'Clarify that compute instances covered staging load tests. Attach breakdown sheet. Express gratitude for swift payment processing.'
  },
  {
    id: 'demo-vendor-pitch',
    label: 'Sales Pitch',
    subject: 'Quick 10-min intro: AI customer insights?',
    body: `Hello,

I noticed your team is scaling fast. We help companies like yours automate customer survey insights with AI, boosting NPS by 28%.

Do you have 10 minutes next Tuesday for a quick demo? If not, who is the right person on your team to talk to?

Best,
Dave Miller
B2B Sales Lead`,
    fromName: 'Dave Miller',
    fromEmail: 'dave@insightsai.co',
    date: 'Oct 26',
    avatarEmoji: '💼',
    badgeTag: 'Sales Pitch',
    recommendedTone: 'polite_decline',
    recommendedLength: 'short',
    suggestedPoints: 'Politely pass on the demo as the roadmap is fully locked for Q4. Wish them success.'
  }
];

export const TONE_CONFIGS = [
  {
    id: 'professional' as ToneType,
    name: 'Professional',
    emoji: '💼',
    badge: 'Polite & Crisp',
    color: 'from-blue-500 to-indigo-600',
    description: 'Crisp, articulate business etiquette suitable for clients and leadership.'
  },
  {
    id: 'friendly' as ToneType,
    name: 'Friendly',
    emoji: '☕',
    badge: 'Warm & Sunny',
    color: 'from-amber-400 to-orange-500',
    description: 'Warm, collaborative, positive, approachable everyday tone.'
  },
  {
    id: 'concise' as ToneType,
    name: 'Concise',
    emoji: '⚡',
    badge: 'TL;DR Fast',
    color: 'from-emerald-400 to-teal-600',
    description: 'Zero fluff, straight to the point, crystal clear next actions.'
  },
  {
    id: 'enthusiastic' as ToneType,
    name: 'Enthusiastic',
    emoji: '🥳',
    badge: 'High Energy',
    color: 'from-pink-500 to-rose-600',
    description: 'Hyped, delighted, and appreciative. Great for celebrations and good news.'
  },
  {
    id: 'polite_decline' as ToneType,
    name: 'Graceful No',
    emoji: '🙅',
    badge: 'Polite Pass',
    color: 'from-purple-500 to-indigo-600',
    description: 'Firm yet warm refusal without burning bridges or sounding rude.'
  },
  {
    id: 'casual' as ToneType,
    name: 'Chill',
    emoji: '🍕',
    badge: 'Relaxed & Easy',
    color: 'from-lime-500 to-emerald-600',
    description: 'Peer-to-peer, relaxed chat, sounds like a friendly Slack message.'
  }
];

export const LENGTH_CONFIGS = [
  { id: 'short' as const, label: '⚡ Short (2-3 lines)' },
  { id: 'medium' as const, label: '📄 Medium (1-2 paragraphs)' },
  { id: 'detailed' as const, label: '📚 Detailed (Systematic)' }
];

export const QUICK_KEY_POINTS = [
  { label: 'Sounds great, confirm! 👍', text: 'Confirm attendance and accept the proposed date/time with enthusiasm.' },
  { label: 'Friday at 3:30 PM 🗓️', text: 'Propose meeting on Friday at 3:30 PM EST instead.' },
  { label: 'Politely pass for now 🙅', text: 'Thank them for reaching out, but decline politely due to current sprint priority locks.' },
  { label: 'Send the slide deck 📑', text: 'Request them to send over the slide deck and agenda prior to the call.' },
  { label: 'Will check & follow up ⏳', text: 'Confirm email receipt and promise a thorough update by tomorrow afternoon.' }
];
