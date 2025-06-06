import { NLPProcessor } from '../utils/nlp/nlpProcessor';
import { StyleService } from '../services/styleService';

export class FloatingPanel {
    private panel: HTMLDivElement;
    private input: HTMLTextAreaElement;
    private applyButton: HTMLButtonElement;
    private undoButton: HTMLButtonElement;
    private feedback: HTMLDivElement;
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
            <div class="panel-header">
                <span>PageEdit</span>
                <button class="close-button">×</button>
            </div>
            <div class="input-card">
                <textarea placeholder="输入你的修改指令..."></textarea>
                <div class="button-group">
                    <button class="apply-button">应用</button>
                    <button class="undo-button">撤销</button>
                </div>
            </div>
            <div class="feedback"></div>
        `;
        return panel;
    }

    private initialize(): void {
        // 获取元素引用
        this.input = this.panel.querySelector('textarea')!;
        this.applyButton = this.panel.querySelector('.apply-button')!;
        this.undoButton = this.panel.querySelector('.undo-button')!;
        this.feedback = this.panel.querySelector('.feedback')!;

        // 添加事件监听
        this.panel.querySelector('.close-button')!.addEventListener('click', () => this.hide());
        this.applyButton.addEventListener('click', () => this.handleApply());
        this.undoButton.addEventListener('click', () => this.handleUndo());

        // 添加到页面
        document.body.appendChild(this.panel);
    }

    private async handleApply(): Promise<void> {
        const userInput = this.input.value.trim();
        if (!userInput) {
            this.showFeedback('请输入修改指令', 'error');
            return;
        }

        try {
            const parsedInstructions = this.nlpProcessor.parse(userInput);
            const results = await this.styleService.applyModifications(parsedInstructions);
            
            if (results.success) {
                this.showFeedback('修改已应用', 'success');
                this.input.value = '';
            } else {
                this.showFeedback(results.message || '应用修改失败', 'error');
            }
        } catch (error) {
            this.showFeedback('处理指令时出错', 'error');
            console.error('Error applying modifications:', error);
        }
    }

    private handleUndo(): void {
        try {
            const result = this.styleService.undoLastModification();
            if (result.success) {
                this.showFeedback('已撤销上次修改', 'success');
            } else {
                this.showFeedback(result.message || '撤销失败', 'error');
            }
        } catch (error) {
            this.showFeedback('撤销操作时出错', 'error');
            console.error('Error undoing modification:', error);
        }
    }

    private showFeedback(message: string, type: 'success' | 'error'): void {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
        setTimeout(() => {
            this.feedback.textContent = '';
            this.feedback.className = 'feedback';
        }, 3000);
    }

    public toggle(): void {
        if (this.panel.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    public show(): void {
        this.panel.style.display = 'block';
        this.input.focus();
    }

    public hide(): void {
        this.panel.style.display = 'none';
    }

    public destroy(): void {
        this.panel.remove();
    }
} 