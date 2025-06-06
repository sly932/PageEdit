import { FloatingPanel } from './floatingPanel';

export class FloatingBall {
    private ball: HTMLDivElement;
    private panel: FloatingPanel;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;

    constructor() {
        this.ball = this.createBall();
        this.panel = new FloatingPanel();
        this.initialize();
    }

    private createBall(): HTMLDivElement {
        const ball = document.createElement('div');
        ball.id = 'pageedit-floating-ball';
        ball.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        `;
        return ball;
    }

    private initialize(): void {
        // 添加事件监听
        this.ball.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.ball.addEventListener('click', this.handleClick.bind(this));

        // 添加到页面
        document.body.appendChild(this.ball);
    }

    private handleMouseDown(e: MouseEvent): void {
        this.isDragging = true;
        this.startX = e.clientX - this.ball.offsetLeft;
        this.startY = e.clientY - this.ball.offsetTop;

        const handleMouseMove = (e: MouseEvent) => {
            if (!this.isDragging) return;
            const x = e.clientX - this.startX;
            const y = e.clientY - this.startY;
            
            // 限制在窗口范围内
            const maxX = window.innerWidth - this.ball.offsetWidth;
            const maxY = window.innerHeight - this.ball.offsetHeight;
            
            this.ball.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
            this.ball.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
            this.ball.style.right = 'auto';
            this.ball.style.bottom = 'auto';
        };

        const handleMouseUp = () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    private handleClick(e: MouseEvent): void {
        if (this.isDragging) return;
        this.panel.toggle();
    }

    public destroy(): void {
        this.ball.remove();
        this.panel.destroy();
    }
} 