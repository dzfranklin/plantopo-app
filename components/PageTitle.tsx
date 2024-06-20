'use client';

import { useEffect } from 'react';

export function PageTitle({ title }: { title?: string }) {
  useEffect(() => {
    const prev = document.title;
    if (title) {
      document.title = `${title.trim()} · PlanTopo`;
    } else {
      document.title = 'PlanTopo';
    }
    return () => {
      document.title = prev;
    };
  }, [title]);

  if (title) {
    return <h1 className="mb-8 text-2xl font-semibold">{title}</h1>;
  }
}
