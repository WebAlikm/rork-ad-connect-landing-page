const CONTENT = {
  logo: 'AD Connect',
  tagline: 'Meet real friends in Abu Dhabi. No awkwardness. No spam.',
  description: 'Connect with like-minded people in your city through shared interests and local events. Building genuine friendships has never been easier.',
  
  waitlist: {
    title: 'Join the Waitlist',
    placeholder: 'Enter your email address',
    buttonText: 'Join Waitlist',
    submitting: 'Joining...',
    disclaimer: 'We\'ll never spam you. Unsubscribe at any time.',
  },
  
  featuresTitle: 'Why AD Connect?',
  features: [
    {
      title: 'Find people with shared interests',
      description: 'Match with people who love the same hobbies, activities, and passions as you do.',
      icon: '🎯',
    },
    {
      title: 'Join local events',
      description: 'Discover and attend meetups, activities, and social events happening around Abu Dhabi.',
      icon: '📅',
    },
    {
      title: 'Safe, verified connections',
      description: 'All members are verified to ensure authentic, meaningful connections in a safe environment.',
      icon: '🛡️',
    },
  ],
  
  footer: {
    copyright: '© 2025 AD Connect. All rights reserved.',
    madeWith: 'Made with ❤️ in Abu Dhabi',
  },
} as const;

export { CONTENT };
export default CONTENT;