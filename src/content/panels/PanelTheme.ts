// 主题管理模块
export class PanelTheme {
    private static panel: HTMLDivElement | null = null;

    static initialize(panel: HTMLDivElement) {
        PanelTheme.panel = panel;
        
        // 检测深色模式并应用
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            panel.classList.add('dark-mode');
        }

        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                panel.classList.add('dark-mode');
            } else {
                panel.classList.remove('dark-mode');
            }
        });
    }

    static toggleTheme(): void {
        if (!PanelTheme.panel) {
            console.warn('[PanelTheme] Panel not initialized');
            return;
        }

        console.log('[PanelTheme] Toggling theme');
        const isDarkMode = PanelTheme.panel.classList.contains('dark-mode');
        
        if (isDarkMode) {
            PanelTheme.panel.classList.remove('dark-mode');
        } else {
            PanelTheme.panel.classList.add('dark-mode');
        }
        
        // 触发主题变化事件，供其他模块使用
        const event = new CustomEvent('themeChanged', {
            detail: { isDarkMode: !isDarkMode }
        });
        document.dispatchEvent(event);
    }

    static isDarkMode(): boolean {
        return PanelTheme.panel?.classList.contains('dark-mode') || false;
    }

    static setDarkMode(isDark: boolean): void {
        if (!PanelTheme.panel) {
            console.warn('[PanelTheme] Panel not initialized');
            return;
        }

        if (isDark) {
            PanelTheme.panel.classList.add('dark-mode');
        } else {
            PanelTheme.panel.classList.remove('dark-mode');
        }
    }
} 