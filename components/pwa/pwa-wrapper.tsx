'use client'

import dynamic from "next/dynamic";

const InstallPrompt = dynamic(() => import("@/lib/pwa/install-prompt").then(mod => ({ default: mod.InstallPrompt })), {
  ssr: false
});

const PWALifecycle = dynamic(() => import("@/components/pwa/pwa-lifecycle").then(mod => ({ default: mod.PWALifecycle })), {
  ssr: false
});

export function PWAWrapper() {
  return (
    <>
      <PWALifecycle />
      <InstallPrompt />
    </>
  );
}