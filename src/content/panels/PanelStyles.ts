// 样式管理模块
import { generatePanelCSSVariables } from './PanelStyleVariables';

export class PanelStyles {
    static injectStyles(shadowRoot: ShadowRoot) {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=PT+Mono:ital,wght@0,400;1,400&display=swap');
            
            /* Panel 样式变量 */
            #pageedit-floating-panel {
                ${generatePanelCSSVariables()}
                
                --icon-color: #000;
                --icon-color-disabled: #9ca3af;
                --button-size: 32px;
                --button-radius: var(--panel-button-border-radius);
                --button-bg-hover: rgba(0, 0, 0, 0.05);
                --icon-size: 20px;

                position: fixed;
                right: var(--panel-right);
                bottom: var(--panel-bottom);
                width: var(--panel-width) !important;
                max-width: var(--panel-width) !important;
                min-width: var(--panel-width) !important;
                background: rgba(255, 255, 255, var(--panel-background-opacity));
                border-radius: var(--panel-border-radius);
                box-shadow: var(--panel-shadow);
                backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
                -webkit-backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
                border: 1px solid rgba(255, 255, 255, var(--panel-border-opacity));
                overflow: visible;
                pointer-events: auto;
                display: none;
                z-index: 2147483646;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                user-select: none;
                box-sizing: border-box;
            }

            /* 面板内容 */
            .panel-content {
                padding: 0 var(--panel-padding) var(--panel-padding) var(--panel-padding);
                position: relative;
                z-index: 1;
                box-sizing: border-box;
                border-radius: 0 0 var(--panel-border-radius) var(--panel-border-radius);
            }

            .input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            /* 文本区域 */
            .panel-textarea {
                width: 100%;
                min-height: 54px !important;
                max-height: 200px !important;
                padding: var(--panel-textarea-padding);
                border: 1px solid rgba(0, 0, 0, 0.15);
                border-radius: var(--panel-textarea-border-radius);
                background: rgba(255, 255, 255, var(--panel-textarea-background-opacity));
                backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
                -webkit-backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
                color: rgb(17, 24, 39);
                font-size: var(--panel-font-size);
                line-height: 1.5;
                resize: none;
                overflow: hidden;
                transition: all 0.2s;
                box-sizing: border-box;
                font-family: inherit;
            }

            .panel-textarea::placeholder {
                color: #A0A0A0;
                font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-weight: 400;
                font-style: italic;
                letter-spacing: 0.2px;
            }

            #pageedit-floating-panel.dark-mode .panel-textarea::placeholder {
                color: #9CA3AF;
            }

            /* 深色模式 */
            #pageedit-floating-panel.dark-mode {
                --icon-color: #fff;
                --icon-color-disabled: #6b7280;
                --button-bg-hover: rgba(255, 255, 255, 0.1);

                background: rgba(30, 30, 30, var(--panel-background-opacity));
                border-color: rgba(75, 85, 99, var(--panel-border-opacity));
                backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
                -webkit-backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
            }
            
            #pageedit-floating-panel.dark-mode .panel-textarea {
                background: rgba(52, 53, 55, var(--panel-textarea-background-opacity));
                border-color: rgba(60, 60, 60, 0.9);
                color: rgb(240, 240, 240);
                backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
                -webkit-backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
            }

            /* 面板头部 - 移除独立背景，与主体融为一体 */
            .panel-header {
                display: flex;
                flex-direction: column;
                padding: var(--panel-header-padding);
                position: relative;
                z-index: 2;
                gap: 8px;
                /* 移除独立背景和边框，与主体保持一致的磨砂质感 */
            }

            /* 第一行容器 */
            .header-row-1 {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 4px;
            }

            /* 第二行容器 */
            .header-row-2 {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 4px;
                width: 100%;
            }

            .panel-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                    rgba(59, 130, 246, 0) 0%,
                    rgba(59, 130, 246, 0.1) 50%,
                    rgba(59, 130, 246, 0) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                border-radius: 12px 12px 0 0;
            }

            #pageedit-floating-panel.dark-mode .panel-header::before {
                background: linear-gradient(45deg, 
                    rgba(96, 165, 250, 0) 0%,
                    rgba(96, 165, 250, 0.1) 50%,
                    rgba(96, 165, 250, 0) 100%);
            }

            .panel-header.dragging {
                /* cursor: grabbing; */
            }

            .panel-header.dragging::before {
                opacity: 1;
                background: linear-gradient(45deg, 
                    rgba(59, 130, 246, 0.1) 0%,
                    rgba(59, 130, 246, 0.2) 50%,
                    rgba(59, 130, 246, 0.1) 100%);
            }

            #pageedit-floating-panel.dark-mode .panel-header.dragging::before {
                background: linear-gradient(45deg, 
                    rgba(96, 165, 250, 0.1) 0%,
                    rgba(96, 165, 250, 0.2) 50%,
                    rgba(96, 165, 250, 0.1) 100%);
            }

            .panel-header span {
                color: rgb(55, 65, 81);
                font-weight: 500;
                font-size: 15px;
                position: relative;
                z-index: 1;
            }

            #pageedit-floating-panel.dark-mode .panel-header span {
                color: rgb(229, 231, 235);
            }

            /* 按钮行 */
            .button-row {
                display: none;
            }

            /* 按钮样式 */
            .panel-button {
                flex: 1;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }

            .apply-button {
                position: absolute;
                right: 8px;
                bottom: 8px;
                width: 34px;
                height: 34px;
                border: none;
                border-radius: 50%;
                background: #f3f4f6;
                color: #9ca3af;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                padding: 0;
                z-index: 10;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .apply-button:hover {
                background: #e5e7eb;
            }

            /* 应用状态下的圆环效果 */
            .apply-button.active {
                background: #8952f1; /* A nice purple from an example */
                color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .apply-button.active:hover {
                background: #9a6bf3;
            }

            .apply-button svg {
                width: 20px;
                height: 20px;
                color: var(--icon-color); /* Arrow color */
            }

            .apply-button.active svg {
                color: white; /* White arrow when active */
            }

            /* 处理状态下的取消按钮样式 */
            .apply-button.processing {
                background: #8952f1;
                color: white;
            }

            .apply-button.processing svg {
                color: white;
            }

            /* 反馈信息 */
            .pageedit-feedback {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                color: rgb(55, 65, 81);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
                z-index: 1;
                font-family: inherit;
            }

            #pageedit-floating-panel.dark-mode .pageedit-feedback {
                background: rgba(31, 41, 55, 0.9);
                color: rgb(229, 231, 235);
            }

            .pageedit-feedback.show {
                opacity: 1;
                pointer-events: auto;
            }

            /* 头部按钮 (统一所有按钮样式) */
            .header-button {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                color: rgb(156, 163, 175);
                padding: 0;
                margin-left: 4px;
                position: relative;
                z-index: 3;
            }

            .header-button:hover {
                background: rgba(0, 0, 0, 0.05);
                color: rgb(75, 85, 99);
            }

            /* 禁用状态的按钮不响应hover效果 */
            .header-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .header-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgb(209, 213, 219);
            }

            #pageedit-floating-panel.dark-mode .header-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            .header-button svg {
                width: 20px;
                height: 20px;
                color: var(--icon-color);
            }

            /* Eddy 标题编辑样式 */
            .eddy-title {
                color: rgb(55, 65, 81);
                font-weight: 500;
                font-size: 15px;
                position: relative;
                z-index: 1;
                cursor: pointer;
                min-width: 60px;
                max-width: 90px;
                outline: none;
                border-radius: 4px;
                padding: 2px 4px;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                user-select: text;
            }

            .eddy-title:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }

            .eddy-title:focus {
                background-color: rgba(59, 130, 246, 0.1);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                cursor: text;
            }

            .eddy-title.editing {
                background-color: rgba(59, 130, 246, 0.1);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                cursor: text;
                border: 1px solid rgba(59, 130, 246, 0.3);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            #pageedit-floating-panel.dark-mode .eddy-title {
                color: rgb(229, 231, 235);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:focus {
                background-color: rgba(96, 165, 250, 0.15);
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
            }

            #pageedit-floating-panel.dark-mode .eddy-title.editing {
                background-color: rgba(96, 165, 250, 0.15);
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
                border-color: rgba(96, 165, 250, 0.4);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            /* 新建 Eddy 按钮特殊样式 */
            .new-eddy-button {
                color: rgb(156, 163, 175) !important;
            }

            .new-eddy-button:hover {
                background: rgba(34, 197, 94, 0.1) !important;
                color: rgb(34, 197, 94) !important;
            }

            .new-eddy-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button {
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button:hover {
                background: rgba(74, 222, 128, 0.1) !important;
                color: rgb(74, 222, 128) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            /* 删除按钮特殊样式 */
            .delete-button {
                color: rgb(156, 163, 175) !important;
            }

            .delete-button:hover {
                background: rgba(239, 68, 68, 0.1) !important;
                color: rgb(239, 68, 68) !important;
            }

            .delete-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button {
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button:hover {
                background: rgba(248, 113, 113, 0.1) !important;
                color: rgb(248, 113, 113) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button:disabled:hover {
                background: transparent !important;
                color: rgb(156, 163, 175) !important;
            }

            /* 自定义 Tooltip 样式 */
            .custom-tooltip {
                position: absolute;
                background: rgba(255, 255, 255, var(--panel-tooltip-background-opacity));
                backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                color: rgb(17, 24, 39);
                padding: 6px 10px;
                border-radius: var(--panel-button-border-radius);
                font-size: var(--panel-tooltip-font-size);
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transform: translateY(4px);
                transition: all 0.1s ease;
                z-index: 2147483646;
                font-family: inherit;
                border: 1px solid rgba(0, 0, 0, 0.15);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .custom-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* 深色模式下的 Tooltip */
            #pageedit-floating-panel.dark-mode .custom-tooltip {
                background: rgba(31, 41, 55, var(--panel-tooltip-background-opacity));
                color: rgb(229, 231, 235);
                border-color: rgba(75, 85, 99, 0.4);
                backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
            }

            /* 系统主题适配 */
            @media (prefers-color-scheme: dark) {
                .custom-tooltip {
                    background: rgba(31, 41, 55, var(--panel-tooltip-background-opacity));
                    color: rgb(229, 231, 235);
                    border-color: rgba(75, 85, 99, 0.4);
                    backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                    -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                }
            }

            #pageedit-floating-panel.dark-mode .apply-button {
                background: #374151;
                color: #9ca3af;
            }

            #pageedit-floating-panel.dark-mode .apply-button:hover {
                background: #4b5563;
            }

            #pageedit-floating-panel.dark-mode .apply-button svg {
                color: #fff;
            }
            
            #pageedit-floating-panel.dark-mode .apply-button.active {
                background: #a855f7; /* Dark mode purple */
            }
            
            #pageedit-floating-panel.dark-mode .apply-button.active svg {
                color: white;
            }

            .undo-button,
            .redo-button,
            .reset-button {
                background: #f3f4f6;
                color: #374151;
            }

            .undo-button:hover,
            .redo-button:hover,
            .reset-button:hover {
                background: #e5e7eb;
            }

            /* 反馈消息 */
            .feedback-message {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.75);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                white-space: nowrap;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                margin-bottom: 8px;
            }

            .feedback-message.success {
                background: rgba(34, 197, 94, 0.8);
            }

            .feedback-message.error {
                background: rgba(239, 68, 68, 0.8);
            }

            .feedback-message.show {
                opacity: 1;
            }
            
            /* 新 Eddy 按钮样式 */
            .new-eddy-button {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
            }
            
            .new-eddy-button:hover svg {
                color: #8952f1;
            }
            
            #pageedit-floating-panel.dark-mode .new-eddy-button:hover svg {
                color: #a855f7;
            }
            
            /* 下拉菜单样式 */
            .dropdown {
                position: relative;
                display: inline-block;
            }
            
            .dropdown-button {
                color: rgb(156, 163, 175) !important;
                transition: transform 0.2s ease;
                position: relative;
            }
            
            .dropdown-button:hover {
                background: rgba(0, 0, 0, 0.05) !important;
                color: rgb(75, 85, 99) !important;
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: rgba(255, 255, 255, var(--panel-dropdown-background-opacity));
                backdrop-filter: blur(var(--panel-dropdown-blur)) saturate(var(--panel-dropdown-saturation)) contrast(var(--panel-dropdown-contrast));
                -webkit-backdrop-filter: blur(var(--panel-dropdown-blur)) saturate(var(--panel-dropdown-saturation)) contrast(var(--panel-dropdown-contrast));
                border: 1px solid rgba(0, 0, 0, 0.15);
                border-radius: 8px;
                box-shadow: var(--panel-dropdown-shadow);
                z-index: 2147483648;
                max-height: 200px;
                overflow-y: auto;
                margin-top: 4px;
                min-width: 200px;
            }
            
            .dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                color: rgb(55, 65, 81);
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
            }
            
            .dropdown-item:last-child {
                border-bottom: none;
            }

            .dropdown-item:hover {
                background-color: rgba(59, 130, 246, 0.1);
            }

            .dropdown-item.active {
                background-color: rgba(34, 197, 94, 0.15) !important;
                color: rgb(22, 163, 74) !important;
                font-weight: 600;
                padding-top: 6px;
                padding-bottom: 6px;
            }

            #pageedit-floating-panel.dark-mode .dropdown-item {
                color: rgb(229, 231, 235);
                border-bottom-color: rgba(75, 85, 99, 0.3);
            }

            #pageedit-floating-panel.dark-mode .dropdown-item:hover {
                background-color: rgba(96, 165, 250, 0.1);
            }
            
            #pageedit-floating-panel.dark-mode .dropdown-item.active {
                background-color: rgba(74, 222, 128, 0.15) !important;
                color: rgb(74, 222, 128) !important;
            }

            .dropdown-item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px;
            }
            
            .apply-button.processing {
                background: #8952f1;
                color: white;
            }

            /* 统一的图标按钮样式 */
            .icon-button {
                width: var(--button-size);
                height: var(--button-size);
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: var(--button-radius);
                transition: all 0.2s ease;
                color: var(--icon-color);
                padding: 0;
                position: relative;
                z-index: 3;
            }

            .icon-button:hover {
                background: var(--button-bg-hover);
            }

            .icon-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .icon-button:disabled:hover {
                background: transparent !important;
            }

            .icon-button svg {
                width: var(--icon-size);
                height: var(--icon-size);
                color: var(--icon-color);
            }

            /* 特殊按钮的 Hover 状态 */
            .icon-button--create:hover {
                background: rgba(34, 197, 94, 0.1) !important;
                color: rgb(34, 197, 94) !important;
            }
            #pageedit-floating-panel.dark-mode .icon-button--create:hover {
                background: rgba(74, 222, 128, 0.1) !important;
                color: rgb(74, 222, 128) !important;
            }

            .icon-button--delete:hover,
            .icon-button--close:hover {
                background: rgba(239, 68, 68, 0.1) !important;
                color: rgb(239, 68, 68) !important;
            }
            #pageedit-floating-panel.dark-mode .icon-button--delete:hover,
            #pageedit-floating-panel.dark-mode .icon-button--close:hover {
                background: rgba(248, 113, 113, 0.1) !important;
                color: rgb(248, 113, 113) !important;
            }
        `;
        shadowRoot.appendChild(style);
        console.log('[PanelStyles] Styles injected');
        
        // 检测PT Mono字体是否加载成功
        PanelStyles.checkAndApplyPTMonoFont(shadowRoot);
    }

    // 检测并应用PT Mono字体
    static checkAndApplyPTMonoFont(shadowRoot: ShadowRoot) {
        const testElement = document.createElement('span');
        testElement.style.fontFamily = 'PT Mono, monospace';
        testElement.style.fontSize = '20px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.whiteSpace = 'nowrap';
        testElement.textContent = 'abcdefghijklmnopqrstuvwxyz';
        document.body.appendChild(testElement);
        const ptMonoWidth = testElement.offsetWidth;
        testElement.style.fontFamily = 'monospace';
        const systemMonoWidth = testElement.offsetWidth;
        document.body.removeChild(testElement);
        if (Math.abs(ptMonoWidth - systemMonoWidth) > 1) {
            console.log('[PanelStyles] PT Mono font loaded successfully');
            const ptMonoStyle = document.createElement('style');
            ptMonoStyle.textContent = `
                .panel-textarea::placeholder {
                    font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
                }
            `;
            shadowRoot.appendChild(ptMonoStyle);
        } else {
            console.warn('[PanelStyles] PT Mono font failed to load, using system monospace fonts as fallback');
        }
    }
} 