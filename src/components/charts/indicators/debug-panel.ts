//@ts-nocheck


export class DebugPanel {
    private static instance: DebugPanel;
    private panel: HTMLDivElement;
    private messages: string[] = [];
    private maxMessages = 100;
    private isEnabled: boolean = true;
    private toggleBtn: HTMLButtonElement;

    private constructor() {
        this.createPanel();
        this.attachToggleButton();
    }

    static getInstance(): DebugPanel {
        if (!DebugPanel.instance) {
            DebugPanel.instance = new DebugPanel();
        }
        return DebugPanel.instance;
    }

    static enable(): void {
        const instance = DebugPanel.getInstance();
        instance.isEnabled = true;
        instance.panel.style.display = 'block';
        instance.toggleBtn.style.display = 'block';
    }

    static disable(): void {
        const instance = DebugPanel.getInstance();
        instance.isEnabled = false;
        instance.panel.style.display = 'none';
        instance.toggleBtn.style.display = 'none';
    }

    private createPanel(): void {
        // إنشاء اللوحة الرئيسية
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 500px;
            height: 350px;
            background: rgba(20, 20, 30, 0.95);
            color: #00ff00;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 11px;
            padding: 10px;
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 9999;
            border: 2px solid #444;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            display: none;
            line-height: 1.4;
        `;

        // إنشاء رأس اللوحة
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            margin-bottom: 8px;
            border-bottom: 1px solid #444;
        `;

        const title = document.createElement('div');
        title.textContent = '📊 VolumeClimax Indicator Debug';
        title.style.fontWeight = 'bold';
        title.style.color = '#4fc3f7';

        const controls = document.createElement('div');
        controls.style.cssText = 'display: flex; gap: 5px;';

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Clear';
        clearBtn.style.cssText = `
            background: #d32f2f;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        `;
        clearBtn.onclick = () => this.clear();

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: #555;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
        `;
        closeBtn.onclick = () => this.hide();

        controls.appendChild(clearBtn);
        controls.appendChild(closeBtn);
        header.appendChild(title);
        header.appendChild(controls);

        this.panel.appendChild(header);

        // إنشاء منطقة الرسائل
        const messageArea = document.createElement('div');
        messageArea.id = 'debug-messages';
        messageArea.style.cssText = `
            height: calc(100% - 40px);
            overflow-y: auto;
            font-family: inherit;
        `;

        this.panel.appendChild(messageArea);
        document.body.appendChild(this.panel);
    }

    private attachToggleButton(): void {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'debug-toggle-btn';
        this.toggleBtn.textContent = '🐛 Debug';
        this.toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;

        this.toggleBtn.onmouseover = () => {
            this.toggleBtn.style.transform = 'translateY(-2px)';
            this.toggleBtn.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)';
        };

        this.toggleBtn.onmouseout = () => {
            this.toggleBtn.style.transform = 'translateY(0)';
            this.toggleBtn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        };

        this.toggleBtn.onclick = () => this.toggle();
        document.body.appendChild(this.toggleBtn);
    }

    log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info', data?: any): void {
        if (!this.isEnabled) return;

        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });

        let color = '#00ff00'; // الأخضر للمعلومات
        let icon = '📝';

        switch (type) {
            case 'warn':
                color = '#ff9800';
                icon = '⚠️';
                break;
            case 'error':
                color = '#ff5252';
                icon = '❌';
                break;
            case 'success':
                color = '#4caf50';
                icon = '✅';
                break;
            case 'info':
                color = '#4fc3f7';
                icon = 'ℹ️';
                break;
        }

        const logMessage = `[${timestamp}] ${icon} ${message}`;

        if (data) {
            try {
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                this.messages.push(`${logMessage}\n${dataStr}`);
            } catch {
                this.messages.push(`${logMessage}\n[Non-serializable data]`);
            }
        } else {
            this.messages.push(logMessage);
        }

        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        this.updatePanel();
    }

    private updatePanel(): void {
        const messageArea = this.panel.querySelector('#debug-messages') as HTMLDivElement;
        if (!messageArea) return;

        messageArea.innerHTML = this.messages
            .map(msg => {
                const lines = msg.split('\n');
                const firstLine = lines[0];
                const restLines = lines.slice(1).join('\n');

                if (restLines) {
                    return `
                        <div style="margin-bottom: 4px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="color: ${this.getColorFromMessage(firstLine)}; font-weight: bold;">
                                ${this.escapeHtml(firstLine)}
                            </div>
                            <div style="color: #aaa; font-size: 10px; margin-top: 2px; white-space: pre-wrap; word-break: break-all;">
                                ${this.escapeHtml(restLines)}
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div style="margin-bottom: 4px; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: ${this.getColorFromMessage(firstLine)};">
                            ${this.escapeHtml(firstLine)}
                        </div>
                    `;
                }
            })
            .join('');

        messageArea.scrollTop = messageArea.scrollHeight;
    }

    private getColorFromMessage(message: string): string {
        if (message.includes('❌')) return '#ff5252';
        if (message.includes('⚠️')) return '#ff9800';
        if (message.includes('✅')) return '#4caf50';
        if (message.includes('ℹ️')) return '#4fc3f7';
        if (message.includes('🔴')) return '#f44336';
        if (message.includes('🟡')) return '#ffeb3b';
        if (message.includes('🟢')) return '#8bc34a';
        if (message.includes('🔵')) return '#2196f3';
        return '#00ff00';
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggle(): void {
        if (this.panel.style.display === 'none' || !this.panel.style.display) {
            this.show();
        } else {
            this.hide();
        }
    }

    show(): void {
        this.panel.style.display = 'block';
        this.toggleBtn.textContent = '🐛 Hide Debug';
        this.toggleBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }

    hide(): void {
        this.panel.style.display = 'none';
        this.toggleBtn.textContent = '🐛 Show Debug';
        this.toggleBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    clear(): void {
        this.messages = [];
        this.updatePanel();
        this.log('🧹 Debug panel cleared', 'info');
    }

    getMessages(): string[] {
        return [...this.messages];
    }

    exportLogs(): void {
        const logs = this.messages.join('\n');
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `volume-climax-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.log('📥 Debug logs exported', 'success');
    }
}