'use client';

import type {ZeroOptions} from '@rocicorp/zero';
import {ZeroProvider} from '@rocicorp/zero/react';
import {useMemo, type ReactNode} from 'react';
import {schema} from '../../shared/schema';
import {mutators} from '../../shared/mutators';

function getUserID(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem('zero-user-id');
  if (!id) {
    id = 'user-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('zero-user-id', id);
  }
  return id;
}

export function ZeroProviderWrapper({children}: {children: ReactNode}) {
  const options = useMemo(() => {
    return {
      schema,
      cacheURL: `${window.location.origin}/zero`,
      userID: getUserID(),
      mutators,
      mutateURL: 'http://frontend:3000/api/mutate',
      queryURL: 'http://frontend:3000/api/query',
      logLevel: 'info',
    } as const satisfies ZeroOptions;
  }, []);

  return <ZeroProvider {...options}>{children}</ZeroProvider>;
}
