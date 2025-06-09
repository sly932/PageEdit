import { StyleService } from './services/styleService';

// 定义自定义事件类型
export interface PanelEvent {
    type: 'apply' | 'undo';
    data?: {
        text?: string;
    };
}

// 定义事件回调类型
export type PanelEventCallback = (event: PanelEvent) => void;

export class FloatingPanel {
    private panel: HTMLDivElement;
    private input!: HTMLTextAreaElement;
    private applyButton!: HTMLButtonElement;
    private undoButton!: HTMLButtonElement;
    private feedback!: HTMLDivElement;
    private shadowRoot: ShadowRoot;
    private eventCallback: PanelEventCallback | null = null;

    constructor(shadowRoot: ShadowRoot) {
        this.shadowRoot = shadowRoot;
        this.panel = this.createPanel();
        this.initialize();
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.id = 'pageedit-floating-panel';
        panel.innerHTML = `
            <div class="pageedit-panel-header">
                <span>PageEdit</span>
                <button class="pageedit-close-btn">×</button>
            </div>
            <div class="pageedit-input-card">
                <textarea class="pageedit-input" placeholder="输入你的修改指令..."></textarea>
                <div class="pageedit-button-row">
                    <button class="pageedit-main-btn apply-button">应用</button>
                    <button class="pageedit-main-btn undo-button">撤销</button>
                </div>
            </div>
            <div class="pageedit-feedback feedback"></div>
        `;
        return panel;
    }

    private initialize(): void {
        // 获取元素引用
        this.input = this.panel.querySelector('.pageedit-input')!;
        this.applyButton = this.panel.querySelector('.apply-button')!;
        this.undoButton = this.panel.querySelector('.undo-button')!;
        this.feedback = this.panel.querySelector('.feedback')!;

        // 添加事件监听
        this.panel.querySelector('.pageedit-close-btn')!.addEventListener('click', () => this.hide());
        this.applyButton.addEventListener('click', () => this.handleApply());
        this.undoButton.addEventListener('click', () => this.handleUndo());

        // 添加键盘快捷键支持
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.handleApply();
            }
            if (e.key === 'Escape') {
                this.hide();
            }
        });

        // 添加到Shadow DOM
        this.shadowRoot.appendChild(this.panel);
    }

    // 设置事件回调
    public setEventCallback(callback: PanelEventCallback): void {
        this.eventCallback = callback;
    }

    private handleApply(): void {
        const userInput = this.input.value.trim();
        if (!userInput) {
            this.showFeedback('请输入修改指令', 'error');
            return;
        }

        // 显示加载状态
        this.applyButton.disabled = true;
        this.applyButton.textContent = '处理中...';

        // 触发应用事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'apply',
                data: { text: userInput }
            });
        }
    }

    private handleUndo(): void {
        // 触发撤销事件
        if (this.eventCallback) {
            this.eventCallback({ type: 'undo' });
        }
    }

    // 重置按钮状态
    public resetApplyButton(): void {
        this.applyButton.disabled = false;
        this.applyButton.textContent = '应用';
    }

    // 清空输入框
    public clearInput(): void {
        this.input.value = '';
    }

    public showFeedback(message: string, type: 'success' | 'error'): void {
        this.feedback.textContent = message;
        this.feedback.className = `pageedit-feedback ${type} show`;

        // 自动隐藏反馈消息
        setTimeout(() => {
            this.feedback.className = 'pageedit-feedback';
            setTimeout(() => {
                this.feedback.textContent = '';
            }, 300);
        }, 3000);
    }

    public toggle(): void {
        if (this.panel.style.display === 'none' || !this.panel.style.display) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show(): void {
        this.panel.style.display = 'block';
        // 延迟聚焦，确保面板已显示
        setTimeout(() => {
            this.input.focus();
        }, 100);
    }

    public hide(): void {
        this.panel.style.display = 'none';
    }

    public destroy(): void {
        this.panel.remove();
    }
}
