'use client';
import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    const runTests = async () => {
      try {
        // Test Drive API
        const resDrive = await fetch('/api/test-drive');
        if (!resDrive.ok) throw new Error(`Drive API error: ${resDrive.status}`);
        const dataDrive = await resDrive.json();
        console.log('Drive files:', dataDrive.files);

        // Save Gmail attachments
        const resAttach = await fetch('/api/save-attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailId: 123,
            messageId: '17a9abc123456789',
          }),
        });
        if (!resAttach.ok) throw new Error(`Attachment API error: ${resAttach.status}`);
        const dataAttach = await resAttach.json();
        console.log('Attachment upload result:', dataAttach);
      } catch (err) {
        console.error('Error in test page:', err);
      }
    };

    runTests();
  }, []);

  return <div>Checking Drive folder and uploading attachments... (see console)</div>;
}
