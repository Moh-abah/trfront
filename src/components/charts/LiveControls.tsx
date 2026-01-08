// components/charts/LiveControls.tsx
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, AlertCircle, Zap, Settings } from 'lucide-react';

interface LiveControlsProps {
    isLive: boolean;
    onToggleLive: () => void;
    onRefresh: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
}

export const LiveControls: React.FC<LiveControlsProps> = ({
    isLive,
    onToggleLive,
    onRefresh,
    speed,
    onSpeedChange
}) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
            {/* زر التشغيل/الإيقاف */}
            <button
                onClick={onToggleLive}
                className={`p-2 rounded-lg flex items-center gap-2 ${isLive
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white transition-colors`}
            >
                {isLive ? (
                    <>
                        <Pause className="w-4 h-4" />
                        <span className="text-sm">إيقاف</span>
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4" />
                        <span className="text-sm">تشغيل</span>
                    </>
                )}
            </button>

            {/* زر التحديث */}
            <button
                onClick={onRefresh}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                title="تحديث البيانات"
            >
                <RotateCcw className="w-4 h-4" />
            </button>

            {/* سرعة التحديث */}
            <div className="relative">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 flex items-center gap-2"
                >
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{speed}x</span>
                </button>

                {showSettings && (
                    <div className="absolute bottom-full mb-2 left-0 bg-gray-900 border border-gray-700 rounded-lg p-2 w-48 z-50">
                        <div className="text-sm text-gray-300 mb-2">سرعة التحديث</div>
                        <div className="flex gap-1">
                            {[0.5, 1, 2, 5, 10].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        onSpeedChange(s);
                                        setShowSettings(false);
                                    }}
                                    className={`px-3 py-1 rounded text-sm ${speed === s
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* حالة الاتصال */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-300">حي</span>
            </div>
        </div>
    );
};