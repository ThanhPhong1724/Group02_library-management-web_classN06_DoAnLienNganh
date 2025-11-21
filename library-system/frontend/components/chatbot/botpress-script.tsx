"use client";

import Script from 'next/script';
import { useState } from 'react';

export default function BotpressScript() {
  const [injectLoaded, setInjectLoaded] = useState(false);

  return (
    <>
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
        strategy="afterInteractive"
        onLoad={() => {
          setInjectLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Botpress inject.js');
        }}
      />
      {injectLoaded && (
        <Script
          src="https://files.bpcontent.cloud/2025/09/09/10/20250909104747-QMTNNPZB.js"
          strategy="afterInteractive"
          onError={() => {
            console.error('Failed to load Botpress config');
          }}
        />
      )}
    </>
  );
}
