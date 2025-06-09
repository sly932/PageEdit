import { NLPProcessor } from '../utils/nlp/nlpProcessor';
import { StyleService } from './services/styleService';

export class FloatingPanel {
    private panel: HTMLDivElement;
    private input!: HTMLTextAreaElement;
    private applyButton!: HTMLButtonElement;
    private undoButton!: HTMLButtonElement;
    private feedback!: HTMLDivElement;
    private nlpProcessor: NLPProcessor;
    private styleService: StyleService;

    constructor() {
        this.panel = this.createPanel();
        this.nlpProcessor = new NLPProcessor();
        this.styleService = new StyleService();
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

        // 添加到页面
        document.body.appendChild(this.panel);
    }

    private async handleApply(): Promise<void> {
        const userInput = this.input.value.trim();
        if (!userInput) {
            this.showFeedback('请输入修改指令', 'error');
            return;
        }

        // 显示加载状态
        this.applyButton.disabled = true;
        this.applyButton.textContent = '处理中...';

        try {
            const parseResult = await NLPProcessor.processInput(userInput, document.documentElement.outerHTML, {
                preferLLM: true,
                minConfidence: 0.6
            });
            if (!parseResult.success) {
                throw new Error(parseResult.error || 'Failed to parse user input');
            }

            // 应用所有修改
            for (const modification of parseResult.modifications) {
                const success = StyleService.applyModification({
                    property: modification.property,
                    value: modification.value,
                    method: modification.method,
                    target: modification.target
                });
                if (!success) {
                    throw new Error(`Failed to apply modification: ${modification.property}`);
                }
            }
            this.showFeedback('修改已应用', 'success');
            this.input.value = '';
        } catch (error) {
            this.showFeedback('处理指令时出错', 'error');
            console.error('Error applying modifications:', error);
        } finally {
            // 恢复按钮状态
            this.applyButton.disabled = false;
            this.applyButton.textContent = '应用';
        }
    }

    private handleUndo(): void {
        try {
            // 获取最后一个样式元素
            const styleElements = (window as any).__pageEditStyleElements || [];
            if (styleElements.length > 0) {
                // 移除最后一个样式元素
                const lastStyleElement = styleElements.pop();
                lastStyleElement.remove();
                this.showFeedback('已撤销上次修改', 'success');
            } else {
                this.showFeedback('没有可撤销的修改', 'error');
            }
        } catch (error) {
            this.showFeedback('撤销操作时出错', 'error');
            console.error('Error undoing modification:', error);
        }
    }

    private showFeedback(message: string, type: 'success' | 'error'): void {
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
