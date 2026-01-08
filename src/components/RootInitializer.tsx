// // RootInitializer.tsx
// "use client";

// import { useSettingsStore } from '../stores/settings.store';
// import { useMarketStore } from '../stores/market.store';
// import { useSignalStore } from '../stores/signals.store';
// import { useAuthStore } from '../stores/auth.store';

// import { useEffect } from 'react';
// import { useWebSocket } from '@/services/websocket/useWebSocket';

// export const RootInitializer: React.FC = () => { // ✅ إزالة props

//     const { checkAuth } = useAuthStore();
//     // const { connect } = useWebSocket();

//     useEffect(() => {


//         // Check authentication
//         checkAuth();

//         // // Connect WebSocket
//         // connect();

//         // Cleanup on unmount
//         return () => {
//             // Disconnect WebSocket if needed
//         };
//     }, [ checkAuth]);

//     return null; // ✅ إرجاع null لأنه مكون للتهيئة فقط
// };

// export default RootInitializer;


// RootInitializer.tsx (الملف المعدل)
"use client";

import { useSettingsStore } from '../stores/settings.store';
import { useMarketStore } from '../stores/market.store';
import { useSignalStore } from '../stores/signals.store';
// import { useAuthStore } from '../stores/auth.store';

import { useEffect } from 'react';
import { useWebSocket } from '@/services/websocket/useWebSocket';

export const RootInitializer: React.FC = () => {
    // ❌ تم إزالة استدعاء useAuthStore تماماً:
    // const { checkAuth } = useAuthStore();

    // ...

    useEffect(() => {

        // ❌ تم إيقاف استدعاء checkAuth() لإلغاء التحقق من المصادقة عند تحميل التطبيق:
        // checkAuth(); 

        // // Connect WebSocket
        // connect();

        // Cleanup on unmount
        return () => {
            // Disconnect WebSocket if needed
        };
    }, [ /* ❌ تم إزالة checkAuth من الـ dependencies */]);

    return null;
};

export default RootInitializer;