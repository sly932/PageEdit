export interface ConfirmDialogOptions {
    icon?: 'warning' | 'puzzle' | string; // 预设或自定义SVG
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

export function showConfirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
        // 主题检测
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 颜色方案
        const colors = isDark
            ? {
                bg: '#232533',
                text: '#fff',
                sub: '#bfc3d4',
                border: '#35374a',
                shadow: '0 8px 32px rgba(0,0,0,0.32)',
                cancelBg: '#2d2f45',
                cancelText: '#bfc3d4',
                cancelBorder: '#44465a',
                confirmBg: '#ef4444',
                confirmText: '#fff',
            }
            : {
                bg: '#fff',
                text: '#222',
                sub: '#6b7280',
                border: '#e5e7eb',
                shadow: '0 8px 32px rgba(0,0,0,0.12)',
                cancelBg: '#f5f5f5',
                cancelText: '#333',
                cancelBorder: '#ddd',
                confirmBg: '#ef4444',
                confirmText: '#fff',
            };

        // 图标
        let iconSvg = '';
        if (options.icon === 'puzzle') {
            iconSvg = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${colors.sub}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v2h-2v2h2v2a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2H5a2 2 0 0 1-2-2v-2h2v-2H3V9a2 2 0 0 1 2-2h2z"/></svg>`;
        } else if (options.icon === 'warning' || !options.icon) {
            iconSvg = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${colors.sub}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M21 18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
        } else {
            iconSvg = options.icon;
        }

        // 创建遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.35); z-index: 99999; display: flex; align-items: center; justify-content: center;
        `;

        // 创建弹窗
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: ${colors.bg}; border-radius: 18px; padding: 38px 40px 32px 40px; min-width: 340px; max-width: 92vw;
            box-shadow: ${colors.shadow}; color: ${colors.text}; font-size: 17px; text-align: center; border: 1.5px solid ${colors.border};
        `;
        dialog.innerHTML = `
            <div style="margin-bottom: 18px;">${iconSvg}</div>
            <div style="font-weight: 600; font-size: 20px; margin-bottom: 8px; color: ${colors.text};">${options.title}</div>
            ${options.description ? `<div style="color: ${colors.sub}; font-size: 15px; margin-bottom: 28px;">${options.description}</div>` : ''}
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 18px;">
                <button id="confirm-cancel" style="padding: 8px 24px; border-radius: 10px; border: 2px solid ${colors.cancelBorder}; background: ${colors.cancelBg}; color: ${colors.cancelText}; font-size: 16px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                    ${options.cancelText || 'Cancel'}
                    <span style="background: ${isDark ? '#35374a' : '#eee'}; color: ${colors.sub}; border-radius: 6px; padding: 2px 8px; font-size: 13px; margin-left: 2px; font-weight: 600;">ESC</span>
                </button>
                <button id="confirm-ok" style="padding: 8px 24px; border-radius: 10px; border: none; background: ${colors.confirmBg}; color: ${colors.confirmText}; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(239,68,68,0.10);">
                    ${options.confirmText || 'Delete'}
                    <span style="background: ${isDark ? '#35374a' : '#fde4e4'}; color: #ef4444; border-radius: 6px; padding: 2px 8px; font-size: 13px; margin-left: 2px; font-weight: 600;">ENTER</span>
                </button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 关闭逻辑
        const close = (result: boolean) => {
            document.body.removeChild(overlay);
            window.removeEventListener('keydown', onKey);
            resolve(result);
        };
        (dialog.querySelector('#confirm-cancel') as HTMLButtonElement).onclick = () => close(false);
        (dialog.querySelector('#confirm-ok') as HTMLButtonElement).onclick = () => close(true);

        // 键盘支持
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') close(false);
            if (e.key === 'Enter') close(true);
        }
        window.addEventListener('keydown', onKey);
    });
} 