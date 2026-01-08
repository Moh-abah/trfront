'use client';
// src/components/websocket/ConnectionStatus.tsx
'use client';


import React from 'react';
import { useWebSocketStore } from '@/stores/websocket.store';

const ConnectionStatus: React.FC = () => {
    const { connectionStatus, isConnected, reconnect } = useWebSocketStore();

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'reconnecting': return 'bg-orange-500';
            case 'disconnected': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'reconnecting': return 'Reconnecting...';
            case 'disconnected': return 'Disconnected';
            default: return 'Unknown';
        }
    };

    return (
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`} />
                <span className="text-sm font-medium">{getStatusText()}</span>
            </div>

            {!isConnected && (
                <button
                    onClick={reconnect}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Reconnect
                </button>
            )}
        </div>
    );
};

export default ConnectionStatus;
