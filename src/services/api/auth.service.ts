// src/services/api/auth.service.ts
import { axiosClient } from './http/axios.client';
import { apiConfig } from '@/config/api.config';


export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username?: string;
    full_name?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: string;
        email: string;
        username: string;
        full_name?: string;
        role: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    };
}

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    settings?: any;
    subscription?: {
        plan: string;
        expires_at?: string;
        features: string[];
    };
    created_at: string;
    updated_at: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export const authService = {
    // Login user
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        return axiosClient.post(apiConfig.endpoints.users.login, credentials);
    },

    // Register new user
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        return axiosClient.post(apiConfig.endpoints.users.register, userData);
    },

    // Refresh access token
    async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        return axiosClient.post(apiConfig.endpoints.users.refresh, {
            refresh_token: refreshToken
        });
    },

    // Get current user profile
    async getCurrentUser(): Promise<UserProfile> {
        return axiosClient.get(apiConfig.endpoints.users.me);
    },

    // Update user profile
    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        return axiosClient.put(apiConfig.endpoints.users.updateMe, profileData);
    },

    // Change password
    async changePassword(passwordData: ChangePasswordRequest): Promise<{ message: string }> {
        return axiosClient.post(apiConfig.endpoints.users.changePassword, passwordData);
    },

    // Request password reset
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        return axiosClient.post(apiConfig.endpoints.users.requestPasswordReset, { email });
    },

    // Reset password with token
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        return axiosClient.post(apiConfig.endpoints.users.resetPassword, {
            token,
            new_password: newPassword
        });
    },

    // Verify email
    async verifyEmail(token: string): Promise<{ message: string }> {
        return axiosClient.post(
            apiConfig.endpoints.users.verifyEmail,
            {},
            { urlParams: { token } }
        );
    },

    // Logout (client-side)
    logout(): void {
        // Clear tokens from storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_profile');

        // Clear axios cache
        axiosClient.clearCache();

        // Optional: Notify backend
        // axiosClient.post('/api/v1/users/logout');
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;

        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user_profile');

        return !!(token && user);
    },

    // Save tokens to storage
    saveTokens(accessToken: string, refreshToken: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
        }
    },

    // Get stored tokens
    getTokens(): { accessToken: string | null; refreshToken: string | null } {
        if (typeof window === 'undefined') {
            return { accessToken: null, refreshToken: null };
        }

        return {
            accessToken: localStorage.getItem('access_token'),
            refreshToken: localStorage.getItem('refresh_token')
        };
    },

    // Save user profile to storage
    saveUserProfile(profile: UserProfile): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_profile', JSON.stringify(profile));
        }
    },

    // Get user profile from storage
    getUserProfile(): UserProfile | null {
        if (typeof window === 'undefined') return null;

        const profile = localStorage.getItem('user_profile');
        return profile ? JSON.parse(profile) : null;
    },

    // Update user profile in storage
    updateStoredProfile(updates: Partial<UserProfile>): void {
        const currentProfile = this.getUserProfile();
        if (currentProfile) {
            const updatedProfile = { ...currentProfile, ...updates };
            this.saveUserProfile(updatedProfile);
        }
    },

    // Clear all auth data
    clearAuthData(): void {
        this.logout();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user_profile');
        }
    },

    // Get user activity log
    async getUserActivity(limit: number = 50, offset: number = 0): Promise<any[]> {
        return axiosClient.get(apiConfig.endpoints.users.activity, {
            params: { limit, offset }
        });
    },

    // Update user settings
    async updateUserSettings(settings: any): Promise<UserProfile> {
        return axiosClient.put(apiConfig.endpoints.users.settings, settings);
    },

    // Update notification preferences
    async updateNotificationPreferences(preferences: any): Promise<UserProfile> {
        const profile = this.getUserProfile();
        if (!profile) throw new Error('User not authenticated');

        return axiosClient.put(`${apiConfig.endpoints.users.notifications}`, preferences);
    },

    // Get user statistics
    async getUserStats(): Promise<{
        total_backtests: number;
        active_strategies: number;
        total_signals: number;
        total_watchlists: number;
        account_age_days: number;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.users.me}/stats`);
    },

    // Upload profile picture
    async uploadProfilePicture(file: File): Promise<{ avatar_url: string }> {
        return axiosClient.upload(
            `${apiConfig.endpoints.users.profile}/avatar`,
            file
        );
    },

    // Delete account
    async deleteAccount(): Promise<{ message: string }> {
        return axiosClient.delete(apiConfig.endpoints.users.deleteMe);
    },

    // Get API usage statistics
    async getApiUsage(): Promise<{
        requests_today: number;
        requests_this_month: number;
        rate_limit: number;
        remaining_requests: number;
        reset_time: string;
    }> {
        return axiosClient.get(`${apiConfig.endpoints.users.me}/api-usage`);
    },

    // Validate session
    async validateSession(): Promise<{ valid: boolean; user?: UserProfile }> {
        try {
            const user = await this.getCurrentUser();
            return { valid: true, user };
        } catch (error) {
            return { valid: false };
        }
    },

    // Initialize auth state
    async initializeAuth(): Promise<{
        isAuthenticated: boolean;
        user: UserProfile | null;
    }> {
        const tokens = this.getTokens();

        if (!tokens.accessToken || !tokens.refreshToken) {
            return { isAuthenticated: false, user: null };
        }

        try {
            // Try to get fresh user data
            const user = await this.getCurrentUser();
            this.saveUserProfile(user);

            return { isAuthenticated: true, user };
        } catch (error) {
            // Try to refresh token
            try {
                const newTokens = await this.refreshToken(tokens.refreshToken!);
                this.saveTokens(newTokens.access_token, newTokens.refresh_token);

                const user = await this.getCurrentUser();
                this.saveUserProfile(user);

                return { isAuthenticated: true, user };
            } catch (refreshError) {
                this.clearAuthData();
                return { isAuthenticated: false, user: null };
            }
        }
    }
};