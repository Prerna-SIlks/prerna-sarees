"use client";

import { useEffect } from "react";

export function GlobalErrorCatcher() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore Supabase GoTrue lock errors when duplicating tabs
      if (
        event.reason &&
        event.reason.name === "AbortError" &&
        event.reason.message.includes("Lock broken by another request with the 'steal' option")
      ) {
        event.preventDefault(); // Prevents the error from crashing the app
        console.warn("Ignored expected Supabase lock error during tab duplication.");
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
