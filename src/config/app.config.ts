export const appConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Trading Platform',
    version: '1.0.0',
    features: {
        enableDarkMode: false,
        enableNotifications: true,
        enableRealTimeUpdates: true,
    },
}