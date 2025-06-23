// Tooltip 功能模块
export class PanelTooltip {
    private static currentTooltip: HTMLDivElement | null = null;
    private static shadowRoot: ShadowRoot | null = null;

    static initialize(shadowRoot: ShadowRoot) {
        PanelTooltip.shadowRoot = shadowRoot;
    }

    // 创建 Tooltip
    static createTooltip(text: string): HTMLDivElement {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        return tooltip;
    }

    // 显示 Tooltip
    static showTooltip(element: HTMLElement, text: string): void {
        // 移除现有的 tooltip
        PanelTooltip.hideTooltip();
        
        if (!PanelTooltip.shadowRoot) {
            console.warn('[PanelTooltip] ShadowRoot not initialized');
            return;
        }

        const tooltip = PanelTooltip.createTooltip(text);
        
        // 根据当前主题状态设置样式
        const panel = PanelTooltip.shadowRoot.querySelector('#pageedit-floating-panel');
        const isDarkMode = panel?.classList.contains('dark-mode') || false;
        
        if (isDarkMode) {
            tooltip.style.background = 'rgba(31, 41, 55, 0.95)';
            tooltip.style.color = 'rgb(229, 231, 235)';
            tooltip.style.borderColor = 'rgba(75, 85, 99, 0.3)';
        } else {
            tooltip.style.background = 'rgba(255, 255, 255, 0.95)';
            tooltip.style.color = 'rgb(17, 24, 39)';
            tooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }
        
        PanelTooltip.shadowRoot.appendChild(tooltip);
        
        // 使用更简单的位置计算方式
        const rect = element.getBoundingClientRect();
        
        // 先设置为右下角位置
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.right}px`;
        tooltip.style.top = `${rect.bottom}px`;
        tooltip.style.transform = 'translateX(4px) translateY(4px)';
        
        // 立即显示 tooltip 以获取其尺寸
        tooltip.classList.add('show');
        
        // 获取tooltip的尺寸
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 检查是否超出右边界
        if (tooltipRect.right > viewportWidth) {
            // 如果超出右边界，改为显示在左侧
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.transform = 'translateX(-4px) translateY(4px)';
        }
        
        // 检查是否超出下边界
        if (tooltipRect.bottom > viewportHeight) {
            // 如果超出下边界，改为显示在上方
            tooltip.style.top = `${rect.top}px`;
            tooltip.style.transform = tooltip.style.transform.replace('translateY(4px)', 'translateY(-4px)');
        }
        
        // 存储当前 tooltip 引用
        PanelTooltip.currentTooltip = tooltip;
    }

    // 隐藏 Tooltip
    static hideTooltip(): void {
        if (PanelTooltip.currentTooltip) {
            PanelTooltip.currentTooltip.remove();
            PanelTooltip.currentTooltip = null;
        }
    }

    // 添加 Tooltip 事件监听器
    static addTooltipEvents(element: HTMLElement, text: string): void {
        element.addEventListener('mouseenter', () => PanelTooltip.showTooltip(element, text));
        element.addEventListener('mouseleave', () => PanelTooltip.hideTooltip());
    }

    // 更新 Tooltip 主题样式（当主题切换时调用）
    static updateTheme(isDarkMode: boolean): void {
        if (PanelTooltip.currentTooltip) {
            if (isDarkMode) {
                PanelTooltip.currentTooltip.style.background = 'rgba(31, 41, 55, 0.95)';
                PanelTooltip.currentTooltip.style.color = 'rgb(229, 231, 235)';
                PanelTooltip.currentTooltip.style.borderColor = 'rgba(75, 85, 99, 0.3)';
            } else {
                PanelTooltip.currentTooltip.style.background = 'rgba(255, 255, 255, 0.95)';
                PanelTooltip.currentTooltip.style.color = 'rgb(17, 24, 39)';
                PanelTooltip.currentTooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }
        }
    }
} 