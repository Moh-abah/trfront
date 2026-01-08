
// 'use client';

// import { useEffect, useCallback } from 'react';
// import { useBacktestStore } from '../../stores/backtest.store';
// import { LiveBacktestStats } from '../../types/backtest.types';
// import { useWebSocket } from '.';

// export const useBacktestStream = (backtestId?: string) => {
//     const { setLiveStats, setCurrentResult } = useBacktestStore();

//     const handleMessage = useCallback((data: any) => {
//         if (data.type === 'backtest_progress') {
//             setLiveStats(data.stats as LiveBacktestStats);
//         } else if (data.type === 'backtest_completed') {
//             setCurrentResult(data.result);
//             setLiveStats(null);
//         } else if (data.type === 'backtest_error') {
//             console.error('Backtest error:', data.error);
//             setLiveStats(null);
//         }
//     }, [setLiveStats, setCurrentResult]);

//     const { connect, disconnect, isConnected } = useWebSocket({
//         onMessage: handleMessage,
//         onConnect: () => {
//             if (backtestId) {
//                 subscribeToBacktest(backtestId);
//             }
//         }
//     });

//     const subscribeToBacktest = useCallback((id: string) => {
//         if (isConnected) {
//             const message = {
//                 type: 'subscribe_backtest',
//                 backtest_id: id
//             };
//             // إرسال رسالة الاشتراك عبر WebSocket
//             console.log('Subscribing to backtest:', id);
//         }
//     }, [isConnected]);

//     const unsubscribeFromBacktest = useCallback((id: string) => {
//         if (isConnected) {
//             const message = {
//                 type: 'unsubscribe_backtest',
//                 backtest_id: id
//             };
//             // إرسال رسالة إلغاء الاشتراك
//             console.log('Unsubscribing from backtest:', id);
//         }
//     }, [isConnected]);

//     useEffect(() => {
//         if (backtestId) {
//             connect();
//             return () => {
//                 unsubscribeFromBacktest(backtestId);
//                 disconnect();
//             };
//         }
//     }, [backtestId, connect, disconnect, unsubscribeFromBacktest]);

//     return {
//         isConnected,
//         subscribeToBacktest,
//         unsubscribeFromBacktest
//     };
// };