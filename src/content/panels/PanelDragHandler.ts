// 拖拽处理模块
export class PanelDragHandler {
    private static panel: HTMLDivElement | null = null;
    private static hasBeenDragged: boolean = false;
    
    // 拖拽状态
    private static isDragging: boolean = false;
    private static startX: number = 0;
    private static startY: number = 0;
    private static initialX: number = 0;
    private static initialY: number = 0;
    private static panelWidth: number = 0;
    private static panelHeight: number = 0;
    private static lastMoveTime: number = 0;

    static initialize(panel: HTMLDivElement) {
        PanelDragHandler.panel = panel;
        PanelDragHandler.setupDragHandlers();
    }

    static getHasBeenDragged(): boolean {
        return PanelDragHandler.hasBeenDragged;
    }

    static setHasBeenDragged(dragged: boolean) {
        PanelDragHandler.hasBeenDragged = dragged;
    }

    private static setupDragHandlers(): void {
        if (!PanelDragHandler.panel) return;

        const panel = PanelDragHandler.panel;

        // 将拖拽事件绑定到整个 panel
        const onMouseDown = (e: MouseEvent) => {
            // 检查是否点击的是按钮，如果是则不启动拖动
            const target = e.target as HTMLElement;
            if (target.closest('button')) {
                return;
            }
            
            // 检查是否点击的是输入框，如果是则不启动拖动
            if (target.closest('textarea') || target.closest('input') || target.contentEditable === 'true') {
                return;
            }
            
            // 允许整个面板拖拽，不再判断 header 区域
            PanelDragHandler.isDragging = true;
            panel.classList.add('dragging');
            PanelDragHandler.startX = e.clientX;
            PanelDragHandler.startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            PanelDragHandler.initialX = rect.left;
            PanelDragHandler.initialY = rect.top;
            PanelDragHandler.panelWidth = rect.width;
            PanelDragHandler.panelHeight = rect.height;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = `${PanelDragHandler.initialX}px`;
            panel.style.top = `${PanelDragHandler.initialY}px`;
            panel.style.transform = 'translate3d(0, 0, 0)';
            document.addEventListener('mousemove', onMouseMove, { passive: false });
            document.addEventListener('mouseup', onMouseUp, { passive: false });
            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!PanelDragHandler.isDragging) return;
            const now = Date.now();
            if (now - PanelDragHandler.lastMoveTime < 16) return;
            PanelDragHandler.lastMoveTime = now;
            const dx = e.clientX - PanelDragHandler.startX;
            const dy = e.clientY - PanelDragHandler.startY;
            let newX = PanelDragHandler.initialX + dx;
            let newY = PanelDragHandler.initialY + dy;
            const visualViewport = window.visualViewport;
            const viewportWidth = visualViewport ? visualViewport.width : window.innerWidth;
            const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
            const minX = 0;
            const maxX = viewportWidth - PanelDragHandler.panelWidth;
            const minY = 0;
            const maxY = viewportHeight - PanelDragHandler.panelHeight;
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            const offsetX = newX - PanelDragHandler.initialX;
            const offsetY = newY - PanelDragHandler.initialY;
            panel.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            e.preventDefault();
        };

        const onMouseUp = () => {
            if (!PanelDragHandler.isDragging) return;
            PanelDragHandler.isDragging = false;
            panel.classList.remove('dragging');
            const transform = panel.style.transform;
            const match = transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const offsetX = parseFloat(match[1]);
                const offsetY = parseFloat(match[2]);
                const finalX = PanelDragHandler.initialX + offsetX;
                const finalY = PanelDragHandler.initialY + offsetY;
                requestAnimationFrame(() => {
                    panel.style.left = `${finalX}px`;
                    panel.style.top = `${finalY}px`;
                    panel.style.transform = 'translate3d(0, 0, 0)';
                    PanelDragHandler.hasBeenDragged = true;
                });
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        // 绑定到整个 panel
        panel.addEventListener('mousedown', onMouseDown);
    }

    // 计算安全的初始位置，考虑开发者工具栏
    static calculateSafePosition(): { right: string; bottom: string } {
        // 获取可视区域的实际高度
        const visualViewport = window.visualViewport;
        const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
        
        // 计算底部安全距离，确保不被开发者工具栏遮挡
        const safeBottom = Math.max(96, window.innerHeight - viewportHeight + 96);
        
        return {
            right: '96px',
            bottom: `${safeBottom}px`
        };
    }

    // 调整已拖动面板的位置以保持相对于可视区域的位置
    static adjustPositionForViewportChange(): void {
        if (!PanelDragHandler.panel) return;

        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        const panel = PanelDragHandler.panel;

        // 获取当前面板位置
        const rect = panel.getBoundingClientRect();
        const currentLeft = rect.left;
        const currentTop = rect.top;

        // 计算面板相对于可视区域的位置比例
        const viewportWidth = visualViewport.width;
        const viewportHeight = visualViewport.height;
        
        // 如果面板使用left/top定位，调整位置
        if (panel.style.left !== 'auto' && panel.style.top !== 'auto') {
            // 计算新的位置，保持相对于可视区域的位置
            const newLeft = Math.min(currentLeft, viewportWidth - rect.width);
            const newTop = Math.min(currentTop, viewportHeight - rect.height);
            
            // 确保不超出可视区域边界
            const finalLeft = Math.max(0, newLeft);
            const finalTop = Math.max(0, newTop);
            
            panel.style.left = `${finalLeft}px`;
            panel.style.top = `${finalTop}px`;
        }
    }

    // 重置面板位置到默认状态
    static resetPosition(): void {
        if (!PanelDragHandler.panel) return;

        PanelDragHandler.hasBeenDragged = false;
        const safePosition = PanelDragHandler.calculateSafePosition();
        PanelDragHandler.panel.style.right = safePosition.right;
        PanelDragHandler.panel.style.bottom = safePosition.bottom;
        PanelDragHandler.panel.style.left = 'auto';
        PanelDragHandler.panel.style.top = 'auto';
        PanelDragHandler.panel.style.transform = 'translate3d(0, 0, 0)';
    }
} 