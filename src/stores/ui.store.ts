import { create } from 'zustand';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

interface UIState {
    // Sidebar state
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Modal states
    modals: Record<string, boolean>;

    // Toast notifications
    toasts: Toast[];

    // Loading states
    loading: Record<string, boolean>;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapsed: () => void;

    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;

    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;

    setLoading: (key: string, isLoading: boolean) => void;
    clearLoading: (key: string) => void;
}

const getInitialSidebarCollapsed = () => {
    if (typeof window === 'undefined') return true; // أول تحميل
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? stored === 'true' : true; // افتراضي مطوي
};

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: getInitialSidebarCollapsed(),
    modals: {},
    toasts: [],
    loading: {},

    toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    toggleSidebarCollapsed: () =>
        set((state) => {
            const newValue = !state.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', String(newValue));
            return { sidebarCollapsed: newValue };
        }),
        
    openModal: (modalId) =>
        set((state) => ({
            modals: { ...state.modals, [modalId]: true }
        })),

    closeModal: (modalId) =>
        set((state) => ({
            modals: { ...state.modals, [modalId]: false }
        })),

    closeAllModals: () => set({ modals: {} }),

    addToast: (toast) =>
        set((state) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newToast = { ...toast, id };

            // Auto-remove toast after duration
            if (toast.duration !== 0) {
                setTimeout(() => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id)
                    }));
                }, toast.duration || 5000);
            }

            return {
                toasts: [...state.toasts, newToast]
            };
        }),

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
        })),

    clearToasts: () => set({ toasts: [] }),

    setLoading: (key, isLoading) =>
        set((state) => ({
            loading: { ...state.loading, [key]: isLoading }
        })),

    clearLoading: (key) =>
        set((state) => {
            const newLoading = { ...state.loading };
            delete newLoading[key];
            return { loading: newLoading };
        })
}));





