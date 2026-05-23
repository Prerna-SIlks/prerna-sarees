"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ClearAuthOnStartup() {
  useEffect(() => {
    // Only run once per browser session
    if (!sessionStorage.getItem("hasVisited")) {
      sessionStorage.setItem("hasVisited", "true");
      
      const clearAuth = async () => {
        try {
          const supabase = createClient();
          // Check if there's an active session
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Sign out to ensure completely logged out state on fresh visit
            await supabase.auth.signOut();
            console.log("Cleared persistent auth session for new browser session.");
            
            // Optionally reload to reflect logged out state immediately if we were on an auth-dependent page
            // But usually just signing out is enough as components will react to auth change
          }
        } catch (err) {
          console.error("Error clearing auth:", err);
        }
      };
      
      clearAuth();
    }
  }, []);

  return null;
}
