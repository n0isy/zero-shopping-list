'use client';

import {useEffect, useState, type ReactNode} from 'react';

// Lazy-load Zero only on the client (it uses IndexedDB/WebSocket)
function ClientOnly({children, fallback}: {children: ReactNode; fallback: ReactNode}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}

const Loading = (
  <div className="loading">
    <div className="spinner" />
    <p style={{color: 'var(--text-secondary)'}}>Loading...</p>
  </div>
);

// We import Zero components lazily to avoid SSR issues with browser-only APIs
import {ZeroProviderWrapper} from '@/components/ZeroProviderWrapper';
import {ShoppingList} from '@/components/ShoppingList';

export function ListPageClient({listId}: {listId: string}) {
  return (
    <ClientOnly fallback={Loading}>
      <ZeroProviderWrapper>
        <ShoppingList listId={listId} />
      </ZeroProviderWrapper>
    </ClientOnly>
  );
}
