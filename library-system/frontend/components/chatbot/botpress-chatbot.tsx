"use client";

import { useEffect } from 'react';

export default function BotpressChatbot() {
  useEffect(() => {
    // Load Botpress Webchat script
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.3/inject.js';
    script1.async = true;
    document.head.appendChild(script1);

    // Load Botpress configuration script
    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2025/09/09/10/20250909104747-QMTNNPZB.js';
    script2.defer = true;
    document.head.appendChild(script2);

    // Cleanup function
    return () => {
      // Remove scripts when component unmounts
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return null; // This component doesn't render anything visible
}
