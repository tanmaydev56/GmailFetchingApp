'use client';
import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    const testDrive = async () => {
      const res = await fetch('/api/test-drive');
      const data = await res.json();
      console.log('Drive files:', data.files);
    };
    testDrive();
  }, []);

  return <div>Checking Drive folder... (see browser console)</div>;
}