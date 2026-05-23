export type InvestmentTier = {
  id: string;
  num: string;
  title: string;
  price: string;
  subtitle: string;
  benefits: string[];
  btnText: string;
  isDark: boolean;
  badge?: string;
};

export type InvestmentConfig = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  blockquote: string;
  ctaHeading: string;
  ctaButton: string;
  contactEmail: string;
  tiers: InvestmentTier[];
};

export const DEFAULT_INVESTMENT: InvestmentConfig = {
  eyebrow: 'Investment',
  headingLine1: "Don't watch the future,",
  headingLine2: 'Shape it!',
  blockquote:
    '"Three investment tiers. One shared vision. Join us and take an active stake in creating the stories of tomorrow."',
  ctaHeading: 'Your legacy begins behind the camera.',
  ctaButton: 'Ready to build tomorrow, today?',
  contactEmail: 'staviyasoftware.in@gmail.com',
  tiers: [
    {
      id: '1',
      num: '01',
      title: 'ASSOCIATE PRODUCER',
      price: '₹10 Lakh+',
      subtitle: 'Your first step into cinema ownership.',
      benefits: [
        'Screen credit as Associate Producer',
        'Net profit revenue share',
        'Ashtaar Films investor community access',
        'Production updates and previews',
      ],
      btnText: 'BUILD TOMORROW, TODAY!',
      isDark: false,
    },
    {
      id: '2',
      num: '02',
      title: 'CO-PRODUCER',
      price: '₹50 Lakh+',
      subtitle: "The filmmaker's chair. Your name. Your legacy.",
      benefits: [
        'Screen credit as Co-Producer',
        'Multi-window revenue share (theatrical + OTT + satellite)',
        'On-set access during principal photography',
        'Brand integration opportunities',
        'Priority access on future projects',
      ],
      btnText: 'BUILD TOMORROW, TODAY!',
      isDark: true,
      badge: 'MOST POPULAR',
    },
    {
      id: '3',
      num: '03',
      title: 'EXECUTIVE PRODUCER',
      price: '₹1.5 Crore+',
      subtitle: 'Own the story. Define the future.',
      benefits: [
        'Screen credit as Executive Producer',
        'Primary revenue share across all windows',
        'IP co-ownership rights',
        'First right of refusal on sequels',
        'Dedicated relationship manager',
        'On-set access + brand integration',
        'Exclusive premiere invitations',
      ],
      btnText: 'BUILD TOMORROW, TODAY!',
      isDark: false,
    },
  ],
};
