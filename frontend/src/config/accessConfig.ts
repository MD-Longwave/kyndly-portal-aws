// src/config/accessConfig.ts
export const featureAccess = {
  dashboard: ['admin', 'tpa', 'broker', 'employer'],
  quotes: ['admin', 'tpa'],
  soldcases: ['admin', 'tpa', 'broker'],
  enrollments: ['admin', 'tpa', 'broker', 'employer'],
  kyndchoice: ['admin', 'tpa'],
  knowledgecenter: ['admin', 'tpa', 'broker', 'employer'],
  documents: ['admin', 'tpa', 'broker', 'employer'], // All roles need access here for plan docs
};
