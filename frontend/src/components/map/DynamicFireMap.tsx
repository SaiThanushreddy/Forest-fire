'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';

const FireMap = dynamic(() => import('./FireMap'), {
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-900/50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export { FireMap };
export default FireMap;
