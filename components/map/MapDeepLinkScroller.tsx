'use client';

import { useEffect } from 'react';
import { hasMapStateParams } from '@/lib/url-state';

export function MapDeepLinkScroller() {
  useEffect(() => {
    if (!hasMapStateParams()) return;

    document.getElementById('main-content')?.scrollIntoView({ block: 'start' });
  }, []);

  return null;
}
