// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// interface AuthState {
//     user: {
//         id: string;
//         email: string;
//         name: string;
//         role: 'user' | 'admin';
//         subscription: 'free' | 'premium' | 'pro';
//         createdAt: string;
//     } | null;
//     token: string | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;

//     login: (email: string, password: string) => Promise<void>;
//     register: (data: any) => Promise<void>;
//     logout: () => void;
//     checkAuth: () => Promise<void>;
//     updateUser: (updates: Partial<AuthState['user']>) => void;
// }

// export const useAuthStore = create<AuthState>()(
//     persist(
//         (set, get) => ({
//             user: null,
//             token: null,
//             isAuthenticated: false,
//             isLoading: false,

//             login: async (email, password) => {
//                 set({ isLoading: true });
//                 try {
//                     // API call to login
//                     const response = await fetch('/api/v1/users/login', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({ email, password })
//                     });

//                     const data = await response.json();

//                     if (response.ok) {
//                         set({
//                             user: data.user,
//                             token: data.token,
//                             isAuthenticated: true,
//                             isLoading: false
//                         });
//                     } else {
//                         throw new Error(data.message || 'Login failed');
//                     }
//                 } catch (error) {
//                     set({ isLoading: false });
//                     throw error;
//                 }
//             },

//             register: async (data) => {
//                 set({ isLoading: true });
//                 try {
//                     // API call to register
//                     const response = await fetch('/api/v1/users/register', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify(data)
//                     });

//                     const result = await response.json();

//                     if (response.ok) {
//                         set({
//                             user: result.user,
//                             token: result.token,
//                             isAuthenticated: true,
//                             isLoading: false
//                         });
//                     } else {
//                         throw new Error(result.message || 'Registration failed');
//                     }
//                 } catch (error) {
//                     set({ isLoading: false });
//                     throw error;
//                 }
//             },

//             logout: () => {
//                 set({
//                     user: null,
//                     token: null,
//                     isAuthenticated: false
//                 });
//                 localStorage.removeItem('auth-storage');
//             },

//             checkAuth: async () => {
//                 const token = get().token;
//                 if (!token) return;

//                 set({ isLoading: true });
//                 try {
//                     const response = await fetch('/api/v1/users/me', {
//                         headers: { Authorization: `Bearer ${token}` }
//                     });

//                     if (response.ok) {
//                         const user = await response.json();
//                         set({ user, isLoading: false });
//                     } else {
//                         get().logout();
//                     }
//                 } catch (error) {
//                     get().logout();
//                 } finally {
//                     set({ isLoading: false });
//                 }
//             },

//             updateUser: (updates) => {
//                 set((state) => ({
//                     user: state.user ? { ...state.user, ...updates } : null
//                 }));
//             }
//         }),
//         {
//             name: 'auth-storage',
//             partialize: (state) => ({
//                 user: state.user,
//                 token: state.token,
//                 isAuthenticated: state.isAuthenticated
//             })
//         }
//     )
// );