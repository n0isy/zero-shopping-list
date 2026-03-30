'use client';

import {useEffect} from 'react';
import {nanoid} from 'nanoid';
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const id = nanoid(12);
    router.replace(`/list/${id}`);
  }, [router]);

  return (
    <div className="loading">
      <div className="spinner" />
      <p style={{color: 'var(--text-secondary)'}}>Creating your list...</p>
    </div>
  );
}
