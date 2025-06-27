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
                
                /* 这些变量现在由 generatePanelCSSVariables() 生成 */
                /* --icon-color, --icon-color-disabled, --button-bg-hover 等已移至变量系统 */

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
                border: 1px solid var(--color-light-border-muted);
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
                border: 1px solid var(--border-primary);
                border-radius: var(--panel-textarea-border-radius);
                background: rgba(255, 255, 255, var(--panel-textarea-background-opacity));
                backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
                -webkit-backdrop-filter: blur(var(--panel-textarea-blur)) saturate(var(--panel-textarea-saturation)) contrast(var(--panel-textarea-contrast));
                color: var(--text-primary);
                font-size: var(--panel-font-size);
                line-height: 1.5;
                resize: none;
                overflow: hidden;
                transition: all var(--panel-transition-duration);
                box-sizing: border-box;
                font-family: inherit;
            }

            .panel-textarea::placeholder {
                color: var(--color-placeholder-light);
                font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-weight: 400;
                font-style: italic;
                letter-spacing: 0.2px;
            }

            #pageedit-floating-panel.dark-mode .panel-textarea::placeholder {
                color: var(--color-placeholder-dark);
            }

            /* 深色模式 */
            #pageedit-floating-panel.dark-mode {
                --icon-color: var(--color-icon-dark);
                --icon-color-disabled: var(--color-dark-text-disabled);
                --button-bg-hover: var(--color-dark-surface-hover);
                --text-primary: var(--color-dark-text-primary);
                --text-secondary: var(--color-dark-text-secondary);
                --text-muted: var(--color-dark-text-muted);
                --border-primary: var(--color-dark-border-primary);
                --surface-primary: var(--color-dark-surface-primary);
                --surface-secondary: var(--color-dark-surface-secondary);

                background: var(--color-dark-background);
                border-color: var(--color-dark-border-primary);
                backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
                -webkit-backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturation)) contrast(var(--panel-contrast));
            }
            
            #pageedit-floating-panel.dark-mode .panel-textarea {
                background: rgba(52, 53, 55, var(--panel-textarea-background-opacity));
                border-color: var(--color-dark-border-muted);
                color: var(--color-dark-text-primary);
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

            /* Eddy 开关样式 */
            .eddy-toggle-switch {
                width: 36px;
                height: 20px;
                background: var(--surface-secondary);
                border: 1px solid var(--border-primary);
                border-radius: 10px;
                position: relative;
                cursor: pointer;
                transition: all var(--panel-transition-duration) ease;
                display: flex;
                align-items: center;
                padding: 0;
                margin-right: 8px;
            }

            .eddy-toggle-switch:hover {
                background: var(--button-bg-hover);
            }

            .eddy-toggle-switch.enabled {
                background: var(--color-primary-main);
                border-color: var(--color-primary-main);
            }

            .toggle-handle {
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                position: absolute;
                left: 2px;
                transition: transform var(--panel-transition-duration) ease;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .eddy-toggle-switch.enabled .toggle-handle {
                transform: translateX(16px);
            }

            #pageedit-floating-panel.dark-mode .eddy-toggle-switch {
                background: var(--color-dark-surface-secondary);
                border-color: var(--color-dark-border-primary);
            }

            #pageedit-floating-panel.dark-mode .eddy-toggle-switch.enabled {
                background: var(--color-primary-light);
                border-color: var(--color-primary-light);
            }

            #pageedit-floating-panel.dark-mode .toggle-handle {
                background: var(--color-dark-text-primary);
            }

            /* 标题容器样式 */
            .title-container {
                display: flex;
                align-items: center;
                gap: 4px;
                position: relative;
                flex: 1;
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
                color: var(--text-secondary);
                font-weight: 500;
                font-size: var(--panel-header-font-size);
                position: relative;
                z-index: 1;
            }

            #pageedit-floating-panel.dark-mode .panel-header span {
                color: var(--color-dark-text-secondary);
            }

            /* 按钮行 - 删除未使用的样式 */
            /* .button-row 已删除 - 未使用 */

            /* 按钮样式 - 删除未使用的样式 */
            /* .panel-button 已删除 - 未使用 */

            .apply-button {
                position: absolute;
                right: 8px;
                bottom: 8px;
                width: 34px;
                height: 34px;
                border: none;
                border-radius: 50%;
                background: var(--surface-primary);
                color: var(--text-muted);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all var(--panel-transition-duration) ease;
                padding: 0;
                z-index: 10;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .apply-button:hover {
                background: var(--surface-secondary);
            }

            /* 应用状态下的圆环效果 */
            .apply-button.active {
                background: var(--color-primary-main);
                color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .apply-button.active:hover {
                background: var(--color-primary-hover);
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
                background: var(--color-primary-main);
                color: white;
            }

            .apply-button.processing svg {
                color: white;
            }

            /* 反馈信息 - 删除未使用的样式 */
            /* 
             * .pageedit-feedback 系列已删除 - 完全未使用
             * .feedback-message 系列已删除 - 虽然设置了类名，但被内联样式完全覆盖
             * 实际反馈消息通过 showFeedback 方法的内联样式实现
             */

            /* 头部按钮 - 删除未使用的样式 */
            /*
             * .header-button 系列已删除 - 实际按钮使用 icon-button 类
             * 所有头部按钮都通过 icon-button 及其修饰符类来设置样式
             */

            /* 原 header-button 相关样式已删除 - 实际使用 icon-button 类 */

            /* Eddy 标题编辑样式 */
            .eddy-title {
                color: var(--text-secondary);
                font-weight: 500;
                font-size: var(--panel-header-font-size);
                position: relative;
                z-index: 1;
                cursor: pointer;
                min-width: 60px;
                max-width: 90px;
                outline: none;
                border-radius: 4px;
                padding: 2px 4px;
                transition: all var(--panel-transition-duration) ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                user-select: text;
            }

            .eddy-title:hover {
                background-color: var(--button-bg-hover);
            }

            .eddy-title:focus {
                background-color: var(--color-focus-light);
                box-shadow: 0 0 0 2px var(--color-focus-border);
                cursor: text;
            }

            .eddy-title.editing {
                background-color: var(--color-focus-light);
                box-shadow: 0 0 0 2px var(--color-focus-border);
                cursor: text;
                border: 1px solid var(--color-focus-strong);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            #pageedit-floating-panel.dark-mode .eddy-title {
                color: var(--color-dark-text-secondary);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:hover {
                background-color: var(--color-dark-surface-hover);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:focus {
                background-color: var(--color-focus-light);
                box-shadow: 0 0 0 2px var(--color-focus-border);
            }

            #pageedit-floating-panel.dark-mode .eddy-title.editing {
                background-color: var(--color-focus-light);
                box-shadow: 0 0 0 2px var(--color-focus-border);
                border-color: var(--color-focus-strong);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            /* 新建 Eddy 按钮特殊样式 */
            .new-eddy-button {
                color: var(--text-muted) !important;
            }

            .new-eddy-button:hover {
                background: var(--color-success-light) !important;
                color: var(--color-success-main) !important;
            }

            .new-eddy-button:disabled:hover {
                background: transparent !important;
                color: var(--text-muted) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button {
                color: var(--color-dark-text-muted) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button:hover {
                background: var(--color-success-light) !important;
                color: var(--color-success-dark) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button:disabled:hover {
                background: transparent !important;
                color: var(--color-dark-text-muted) !important;
            }

            /* 删除按钮特殊样式 */
            .delete-button {
                color: var(--text-muted) !important;
            }

            .delete-button:hover {
                background: var(--color-danger-light) !important;
                color: var(--color-danger-main) !important;
            }

            .delete-button:disabled:hover {
                background: transparent !important;
                color: var(--text-muted) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button {
                color: var(--color-dark-text-muted) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button:hover {
                background: var(--color-danger-light) !important;
                color: var(--color-danger-dark) !important;
            }

            #pageedit-floating-panel.dark-mode .delete-button:disabled:hover {
                background: transparent !important;
                color: var(--color-dark-text-muted) !important;
            }

            /* 自定义 Tooltip 样式 */
            .custom-tooltip {
                position: absolute;
                background: rgba(255, 255, 255, var(--panel-tooltip-background-opacity));
                backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                color: var(--text-primary);
                padding: 6px 10px;
                border-radius: var(--panel-button-border-radius);
                font-size: var(--panel-tooltip-font-size);
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transform: translateY(4px);
                transition: all var(--panel-tooltip-transition-duration) ease;
                z-index: 2147483646;
                font-family: inherit;
                border: 1px solid var(--border-primary);
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
                /* 移除 color 定义，使用动态变量 --text-primary 自动切换 */
                /* border-color 已由动态变量 --border-primary 自动处理 */
                backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
            }

            /* 系统主题适配 */
            @media (prefers-color-scheme: dark) {
                .custom-tooltip {
                    background: rgba(31, 41, 55, var(--panel-tooltip-background-opacity));
                    /* 移除 color 和 border-color 定义，使用动态变量自动切换 */
                    backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                    -webkit-backdrop-filter: blur(var(--panel-tooltip-blur)) saturate(var(--panel-tooltip-saturation)) contrast(var(--panel-tooltip-contrast));
                }
            }

            #pageedit-floating-panel.dark-mode .apply-button {
                background: var(--color-dark-surface-primary);
                color: var(--color-dark-text-muted);
            }

            #pageedit-floating-panel.dark-mode .apply-button:hover {
                background: var(--color-dark-surface-secondary);
            }

            #pageedit-floating-panel.dark-mode .apply-button svg {
                color: var(--color-icon-dark);
            }
            
            #pageedit-floating-panel.dark-mode .apply-button.active {
                background: var(--color-primary-light);
            }
            
            #pageedit-floating-panel.dark-mode .apply-button.active svg {
                color: white;
            }

            /* 撤销/重做/重置按钮样式 - 删除未使用的样式 */
            /* .undo-button, .redo-button, .reset-button 已删除 - 实际使用 icon-button 类 */

            /* 下拉菜单样式 */
            .dropdown {
                position: relative;
                display: inline-block;
            }
            
            .dropdown-button {
                color: var(--text-muted) !important;
                transition: transform var(--panel-transition-duration) ease;
                position: relative;
            }
            
            .dropdown-button:hover {
                background: var(--button-bg-hover) !important;
                color: var(--text-secondary) !important;
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: rgba(255, 255, 255, var(--panel-dropdown-background-opacity));
                backdrop-filter: blur(var(--panel-dropdown-blur)) saturate(var(--panel-dropdown-saturation)) contrast(var(--panel-dropdown-contrast));
                -webkit-backdrop-filter: blur(var(--panel-dropdown-blur)) saturate(var(--panel-dropdown-saturation)) contrast(var(--panel-dropdown-contrast));
                border: 1px solid var(--border-primary);
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
                font-size: var(--panel-font-size);
                color: var(--text-secondary);
                border-bottom: 1px solid var(--border-primary);
                transition: background-color var(--panel-transition-duration);
                display: flex;
                align-items: center;
            }
            
            .dropdown-item:last-child {
                border-bottom: none;
            }

            .dropdown-item:hover {
                background-color: var(--color-focus-light);
            }

            .dropdown-item.active {
                background-color: var(--color-success-light) !important;
                color: var(--color-success-main) !important;
                font-weight: 600;
                padding-top: 6px;
                padding-bottom: 6px;
            }

            #pageedit-floating-panel.dark-mode .dropdown-item {
                color: var(--color-dark-text-secondary);
                border-bottom-color: var(--color-dark-border-primary);
            }

            #pageedit-floating-panel.dark-mode .dropdown-item:hover {
                background-color: var(--color-focus-light);
            }
            
            #pageedit-floating-panel.dark-mode .dropdown-item.active {
                background-color: var(--color-success-light) !important;
                color: var(--color-success-dark) !important;
            }

            .dropdown-item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px;
            }
            
            .apply-button.processing {
                background: var(--color-primary-main);
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
                transition: all var(--panel-transition-duration) ease;
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
                background: var(--color-success-light) !important;
                color: var(--color-success-main) !important;
            }
            #pageedit-floating-panel.dark-mode .icon-button--create:hover {
                background: var(--color-success-light) !important;
                color: var(--color-success-dark) !important;
            }

            .icon-button--delete:hover,
            .icon-button--close:hover {
                background: var(--color-danger-light) !important;
                color: var(--color-danger-main) !important;
            }
            #pageedit-floating-panel.dark-mode .icon-button--delete:hover,
            #pageedit-floating-panel.dark-mode .icon-button--close:hover {
                background: var(--color-danger-light) !important;
                color: var(--color-danger-dark) !important;
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