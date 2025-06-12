'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'; // ⬅️ ensures Vercel doesn't statically pre-render

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
      router.push('/products/Panel');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}
