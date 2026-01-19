// @ts-nocheck

'use client';

import React, { useState } from 'react';
import { Alert, AlertSettings as AlertSettingsType } from '../../types';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { Select } from '../ui/Input/Select';
import { Switch } from '../ui/Input/Switch';
import { Plus, Trash2, Bell } from 'lucide-react';

interface AlertSettingsProps {
    settings: AlertSettingsType;
    onSave: (settings: AlertSettingsType) => void;
    className?: string;
}

export const AlertSettings: React.FC<AlertSettingsProps> = ({
    settings,
    onSave,
    className
}) => {
    const [newAlert, setNewAlert] = useState<Partial<Alert>>({
        type: 'price',
        condition: 'above',
        value: 0,
        enabled: true,
        notificationTypes: ['push']
    });

    const [activeTab, setActiveTab] = useState<'price' | 'indicator' | 'volume' | 'pattern'>('price');

    const handleAddAlert = () => {
        if (!newAlert.symbol || !newAlert.value) return;

        const alertId = `alert-${Date.now()}`;
        const alertToAdd: Alert = {
            id: alertId,
            symbol: newAlert.symbol!,
            type: newAlert.type!,
            condition: newAlert.condition!,
            value: newAlert.value!,
            enabled: newAlert.enabled!,
            notificationTypes: newAlert.notificationTypes!,
            createdAt: new Date().toISOString()
        };

        const updatedSettings = { ...settings };
        switch (alertToAdd.type) {
            case 'price':
                updatedSettings.priceAlerts.push(alertToAdd);
                break;
            case 'indicator':
                updatedSettings.indicatorAlerts.push(alertToAdd);
                break;
            case 'volume':
                updatedSettings.volumeAlerts.push(alertToAdd);
                break;
            case 'pattern':
                updatedSettings.patternAlerts.push(alertToAdd);
                break;
        }

        onSave(updatedSettings);
        setNewAlert({
            type: 'price',
            condition: 'above',
            value: 0,
            enabled: true,
            notificationTypes: ['push']
        });
    };

    const handleRemoveAlert = (alertId: string, type: Alert['type']) => {
        const updatedSettings = { ...settings };

        switch (type) {
            case 'price':
                updatedSettings.priceAlerts = updatedSettings.priceAlerts.filter(a => a.id !== alertId);
                break;
            case 'indicator':
                updatedSettings.indicatorAlerts = updatedSettings.indicatorAlerts.filter(a => a.id !== alertId);
                break;
            case 'volume':
                updatedSettings.volumeAlerts = updatedSettings.volumeAlerts.filter(a => a.id !== alertId);
                break;
            case 'pattern':
                updatedSettings.patternAlerts = updatedSettings.patternAlerts.filter(a => a.id !== alertId);
                break;
        }

        onSave(updatedSettings);
    };

    const handleToggleAlert = (alertId: string, type: Alert['type'], enabled: boolean) => {
        const updatedSettings = { ...settings };
        let alertArray: Alert[];

        switch (type) {
            case 'price':
                alertArray = updatedSettings.priceAlerts;
                break;
            case 'indicator':
                alertArray = updatedSettings.indicatorAlerts;
                break;
            case 'volume':
                alertArray = updatedSettings.volumeAlerts;
                break;
            case 'pattern':
                alertArray = updatedSettings.patternAlerts;
                break;
        }

        const alertIndex = alertArray.findIndex(a => a.id === alertId);
        if (alertIndex !== -1) {
            alertArray[alertIndex].enabled = enabled;
            onSave(updatedSettings);
        }
    };

    const getActiveAlerts = () => {
        switch (activeTab) {
            case 'price': return settings.priceAlerts;
            case 'indicator': return settings.indicatorAlerts;
            case 'volume': return settings.volumeAlerts;
            case 'pattern': return settings.patternAlerts;
            default: return settings.priceAlerts;
        }
    };

    return (
        <div className={className}>
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 text-foreground">Alert Settings</h2>
                <p className="text-muted-foreground">Configure your trading alerts and notifications</p>
            </div>

            <div className="space-y-6">
                {/* New Alert Form */}
                <div className="bg-card p-4 rounded-lg border border-border">
                    <h3 className="font-medium mb-4 text-foreground">Create New Alert</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Input
                            label="Symbol"
                            value={newAlert.symbol || ''}
                            onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                            placeholder="BTCUSDT"
                        />

                        <Select
                            label="Alert Type"
                            value={newAlert.type || 'price'}
                            onChange={(value) => setNewAlert({ ...newAlert, type: value as Alert['type'] })}
                            options={[
                                { value: 'price', label: 'Price Alert' },
                                { value: 'indicator', label: 'Indicator Alert' },
                                { value: 'volume', label: 'Volume Alert' },
                                { value: 'pattern', label: 'Pattern Alert' }
                            ]}
                        />

                        <Select
                            label="Condition"
                            value={newAlert.condition || 'above'}
                            onChange={(value) => setNewAlert({ ...newAlert, condition: value as Alert['condition'] })}
                            options={[
                                { value: 'above', label: 'Above' },
                                { value: 'below', label: 'Below' },
                                { value: 'crosses_above', label: 'Crosses Above' },
                                { value: 'crosses_below', label: 'Crosses Below' }
                            ]}
                        />

                        <Input
                            label="Value"
                            type="number"
                            value={newAlert.value?.toString() || ''}
                            onChange={(e) => setNewAlert({ ...newAlert, value: parseFloat(e.target.value) })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Switch
                                checked={newAlert.enabled || true}
                                onChange={(checked) => setNewAlert({ ...newAlert, enabled: checked })}
                                label="Enable Alert"
                            />
                        </div>

                        <Button onClick={handleAddAlert} leftIcon={<Plus className="w-4 h-4" />}>
                            Add Alert
                        </Button>
                    </div>
                </div>

                {/* Alert Tabs */}
                <div>
                    <div className="border-b border-border">
                        <nav className="flex space-x-8">
                            {(['price', 'indicator', 'volume', 'pattern'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {tab} Alerts ({getActiveAlerts().length})
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Alerts List */}
                    <div className="mt-4">
                        {getActiveAlerts().length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                <p>No {activeTab} alerts configured</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {getActiveAlerts().map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Switch
                                                checked={alert.enabled}
                                                onChange={(checked) => handleToggleAlert(alert.id, alert.type, checked)}
                                            />

                                            <div>
                                                <div className="font-medium text-foreground">{alert.symbol}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {alert.type} {alert.condition} {alert.value}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(alert.createdAt).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                leftIcon={<Trash2 className="w-4 h-4" />}
                                                onClick={() => handleRemoveAlert(alert.id, alert.type)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="border-t border-border pt-6">
                    <h3 className="font-medium mb-4 text-foreground">Notification Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Switch label="Push Notifications" defaultChecked />
                            <p className="text-sm text-muted-foreground">Receive notifications in browser</p>
                        </div>

                        <div className="space-y-2">
                            <Switch label="Email Notifications" defaultChecked />
                            <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                        </div>

                        <div className="space-y-2">
                            <Switch label="Sound Alerts" defaultChecked />
                            <p className="text-sm text-muted-foreground">Play sound for alerts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertSettings;