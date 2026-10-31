export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  contactEmail: string;
  updated?: string;
};

export type LegalSlug = 'terms' | 'privacy' | 'cookies';

const CONTACT = 'slotifyethiopia@outlook.com';

// Content mirrored from the web app (frontend TermsOfServicePage / Privacy /
// Cookie pages) so mobile shows the same policies.
export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  terms: {
    eyebrow: 'Terms of Service',
    title: "The rules for using Slotify's marketplace",
    intro:
      'These terms explain how Slotify works, what users and vendors are responsible for, and the limits that apply when you use the platform to discover and book services.',
    contactEmail: CONTACT,
    sections: [
      {
        heading: '1. Acceptance',
        paragraphs: [
          'By accessing or using Slotify, you agree to these terms and to any policies referenced here. If you use the platform on behalf of a business or vendor account, you confirm that you are authorized to bind that entity.',
        ],
      },
      {
        heading: '2. Eligibility and accounts',
        paragraphs: [
          'You must provide accurate registration information, keep your credentials secure, and notify us if you believe your account has been compromised. You may not use the service if you are prohibited from doing so by law.',
        ],
      },
      {
        heading: '3. Marketplace role',
        paragraphs: [
          'Slotify is a booking marketplace. We connect customers with independent vendors, but the actual service is provided by the vendor, not by Slotify. We do not guarantee that every listing, schedule, or service outcome will be error-free or available at all times.',
        ],
      },
      {
        heading: '4. Bookings and cancellations',
        paragraphs: [
          'When you book a service, you agree to the date, time, location, and any special instructions shown at checkout. Customers and vendors are responsible for timely cancellation, rescheduling, and communication. Refunds, no-shows, and late cancellations may be handled according to the policy shown for the specific service or vendor.',
        ],
      },
      {
        heading: '5. Payments and fees',
        paragraphs: [
          'If payments, commissions, deposits, or platform fees are enabled, you authorize Slotify and its payment partners to process the amounts shown during checkout. Any applicable taxes or third-party charges remain your responsibility unless stated otherwise.',
        ],
      },
      {
        heading: '6. Vendor responsibilities',
        paragraphs: [
          'Vendors must keep their profiles, pricing, availability, and service descriptions accurate; deliver services with reasonable care; maintain any required licenses or permissions; and comply with applicable laws.',
        ],
      },
      {
        heading: '7. Reviews and content',
        paragraphs: [
          'You may submit reviews, photos, and other content if you have the rights to do so. Content must be truthful, respectful, and lawful. We may remove content that is abusive, misleading, or otherwise inconsistent with these terms.',
        ],
      },
      {
        heading: '8. Prohibited conduct',
        bullets: [
          'Do not impersonate others or misrepresent your identity.',
          'Do not interfere with platform security or access controls.',
          'Do not post unlawful, abusive, fraudulent, or harmful content.',
          'Do not use Slotify to spam, scrape, or automate unauthorized activity.',
          'Do not attempt to bypass fees, safety checks, or account restrictions.',
        ],
      },
      {
        heading: '9. Suspension and termination',
        paragraphs: [
          'We may suspend or terminate accounts that violate these terms, create risk for users or the platform, or are inactive for an extended period. You may stop using Slotify at any time, but some obligations and rights survive termination.',
          'We may also remove listings, content, or bookings when needed to protect the marketplace.',
        ],
      },
      {
        heading: '10. Disputes and governing law',
        paragraphs: [
          'Before filing formal action, the parties should try to resolve disputes informally by contacting Slotify support. To the extent allowed by law, these terms are governed by the laws of Ethiopia, and the courts located in Addis Ababa, Ethiopia will have jurisdiction unless a different rule is required by law.',
        ],
      },
      {
        heading: '11. Contact and updates',
        paragraphs: [
          'We may update these terms from time to time. If the changes are material, we will post an updated version on the site.',
          `Questions can be sent to ${CONTACT} or Addis Ababa, Ethiopia.`,
        ],
      },
    ],
  },

  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'How Slotify collects, uses, and protects your information',
    intro:
      'This policy explains what we collect when you use Slotify, why we collect it, and how you can manage your privacy rights. It applies to customers, vendors, and visitors who use our services.',
    contactEmail: CONTACT,
    updated: 'June 3, 2026',
    sections: [
      {
        heading: 'At a glance',
        bullets: [
          'Collect — account, booking, communication, and device data.',
          'Use — authentication, scheduling, support, analytics, and security.',
          'Share — only with vendors, service providers, and legal obligations where needed.',
          'Control — review, update, and request deletion where law allows.',
        ],
      },
      {
        heading: '1. Information we collect',
        paragraphs: [
          'When you create an account, book a service, contact support, leave a review, or otherwise interact with Slotify, we may collect your name, email address, phone number, password, account role, booking details, messages, and any content you submit.',
          'If you sign in with Google, we may receive basic profile information from Google that is necessary to create or link your account.',
        ],
      },
      {
        heading: '2. Automatically collected data',
        paragraphs: [
          'When you use our services, we may automatically collect IP address, device identifiers, operating system, pages viewed, timestamps, referral information, and other technical logs used to operate and secure the service.',
          'We also use cookies and similar technologies for authentication, preferences, analytics, and basic functionality. See our Cookie Policy for details.',
        ],
      },
      {
        heading: '3. How we use information',
        bullets: [
          'Create and manage user accounts.',
          'Process bookings, schedule appointments, and send updates.',
          'Support vendor operations and marketplace administration.',
          'Send service messages, confirmations, and important notices.',
          'Detect fraud, prevent abuse, and maintain security.',
          'Analyze usage and improve product performance.',
        ],
      },
      {
        heading: '4. Sharing and disclosure',
        bullets: [
          'With vendors so they can fulfill booking requests.',
          'With service providers that help us run payments, hosting, analytics, or support.',
          'If required by law, legal process, or to protect rights and safety.',
          'In connection with a merger, acquisition, or similar business transfer.',
        ],
      },
      {
        heading: '5. Retention',
        paragraphs: [
          'We keep personal information only as long as needed for the purposes described in this policy, to comply with legal obligations, resolve disputes, and enforce agreements.',
        ],
      },
      {
        heading: '6. Security',
        paragraphs: [
          'We use reasonable administrative, technical, and organizational safeguards to protect your data, but no online system can be guaranteed completely secure.',
        ],
      },
      {
        heading: '7. Minors',
        paragraphs: [
          'Slotify is intended for users who can form a binding agreement and we do not knowingly collect data from children under 18.',
        ],
      },
      {
        heading: '8. Your rights',
        paragraphs: [
          'Depending on where you live, you may have rights to access, correct, delete, or restrict the use of your personal information. You may also be able to withdraw consent where we rely on consent as the legal basis for processing.',
          'You can contact us to exercise these rights, and we will review requests in line with applicable law.',
        ],
      },
      {
        heading: '9. Contact',
        paragraphs: [
          `For privacy questions or requests, contact Slotify at ${CONTACT} or write to Addis Ababa, Ethiopia.`,
        ],
      },
    ],
  },

  cookies: {
    eyebrow: 'Cookie Policy',
    title: 'How Slotify uses cookies and similar technologies',
    intro:
      'We use cookies and related technologies to keep you signed in, remember preferences, measure usage, and improve the marketplace experience.',
    contactEmail: CONTACT,
    updated: 'June 3, 2026',
    sections: [
      {
        heading: 'What cookies are',
        paragraphs: [
          'Cookies are small text files stored on your device. They help services work more efficiently and help owners understand how the service is being used.',
        ],
      },
      {
        heading: 'Why we use them',
        paragraphs: [
          'Slotify uses cookies for authentication, security, account preferences, analytics, and product performance. We may also use similar technologies such as pixels or local storage where needed to support these purposes.',
        ],
      },
      {
        heading: 'Essential',
        paragraphs: [
          'These are required for core functions such as sign-in, session management, security, and basic navigation. The service may not function properly without them.',
        ],
      },
      {
        heading: 'Preferences',
        paragraphs: [
          'These help remember your settings and make the experience more consistent across visits, such as saved state or layout preferences.',
        ],
      },
      {
        heading: 'Analytics and performance',
        paragraphs: [
          'We use analytics tools to understand usage, measure activity, and improve performance.',
        ],
      },
      {
        heading: 'Third-party cookies',
        paragraphs: [
          'Some third-party tools may set cookies when you interact with Slotify, including Google services used for analytics or sign-in. Those providers control their own cookies and have their own privacy policies.',
          'If we introduce additional analytics, advertising, or support tools, we will update this policy to reflect them.',
        ],
      },
      {
        heading: 'Managing cookies',
        paragraphs: [
          'You can manage cookies in your device or browser settings, delete stored cookies, or block them altogether. Some cookies are essential and cannot be disabled without affecting the service.',
        ],
      },
      {
        heading: 'Updates',
        paragraphs: [
          'We may update this Cookie Policy from time to time if our use of cookies changes or if the law requires a revision. The latest version will always be posted here.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about our cookie use can be sent to ${CONTACT} or Addis Ababa, Ethiopia.`],
      },
    ],
  },
};
