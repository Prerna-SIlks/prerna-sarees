import { create } from "zustand";

interface PreviewState {
  isPreviewMode: boolean;
  previewDeviceWidth: "375px" | "768px" | "100%";
  previewPath: string;
  refreshKey: number; // Increment to force iframe reload
  lastSavedAt: string | null;
  togglePreviewMode: () => void;
  setPreviewMode: (val: boolean) => void;
  setDeviceWidth: (width: "375px" | "768px" | "100%") => void;
  setPreviewPath: (path: string) => void;
  triggerRefresh: () => void;
  setLastSavedAt: (timestamp: string) => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreviewMode: false,
  previewDeviceWidth: "100%",
  previewPath: "/",
  refreshKey: 0,
  lastSavedAt: null,
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  setPreviewMode: (val) => set({ isPreviewMode: val }),
  setDeviceWidth: (width) => set({ previewDeviceWidth: width }),
  setPreviewPath: (path) => set({ previewPath: path }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),
}));
