// src/config/accessConfig.ts
export const featureAccess = {
  dashboard: ['admin', 'tpa_admin', 'tpa_user', 'broker', 'employer'],
  quotes: ['admin', 'tpa_admin', 'tpa_user'],
  soldcases: ['admin', 'tpa_admin', 'tpa_user', 'broker'],
  enrollments: ['admin', 'tpa_admin', 'tpa_user', 'broker', 'employer'],
  kyndchoice: ['admin', 'tpa_admin', 'tpa_user'],
  knowledgecenter: ['admin', 'tpa_admin', 'tpa_user', 'broker', 'employer'],
  documents: ['admin', 'tpa_admin', 'tpa_user', 'broker', 'employer'], // All roles need access here for plan docs
  adminpanel: ['admin', 'tpa_admin', 'tpa_user'], // Only admin and TPA users can access AdminPanel
};
