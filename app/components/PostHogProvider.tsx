'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent duplicate initialization in Strict Mode or component remounts
      if ((window as any).posthog && (window as any).posthog.__loaded) {
        return;
      }

      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (!posthogKey) {
        console.warn('PostHog key is missing. Analytics will not be initialized.');
        return;
      }
      try {
        posthog.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        });
      } catch (error) {
        console.error('Failed to initialize PostHog:', error);
      }
    }
  }, []);

  return <>{children}</>;
}

