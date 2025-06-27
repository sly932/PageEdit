/**
 * Panel 样式变量定义
 * 集中管理 Panel 的透明度、颗粒感、模糊效果等视觉属性
 * 方便用户自定义和修改
 * 
 * Panel Style Variables Definition
 * Centralized management of Panel's transparency, graininess, blur effects and other visual properties
 * Easy for users to customize and modify
 */

export interface PanelStyleConfig {
    // 基础透明度设置 / Basic Transparency Settings
    backgroundOpacity: number;      // Panel 背景透明度 / Panel background opacity (0.6)
    borderOpacity: number;          // 边框透明度 / Border opacity (0.4)
    textareaBackgroundOpacity: number; // 文本框背景透明度 / Textarea background opacity (0.5)
    tooltipBackgroundOpacity: number;  // 提示框背景透明度 / Tooltip background opacity (0.7)
    dropdownBackgroundOpacity: number; // 下拉菜单背景透明度 / Dropdown menu background opacity (0.7)
    
    // 模糊效果设置 / Blur Effect Settings
    panelBlur: string;              // Panel 模糊效果 / Panel blur effect (30px)
    textareaBlur: string;           // 文本框模糊效果 / Textarea blur effect (20px)
    tooltipBlur: string;            // 提示框模糊效果 / Tooltip blur effect (18px)
    dropdownBlur: string;           // 下拉菜单模糊效果 / Dropdown menu blur effect (25px)
    
    // 饱和度和对比度设置 / Saturation and Contrast Settings
    panelSaturation: string;        // Panel 饱和度 / Panel saturation (200%)
    panelContrast: string;          // Panel 对比度 / Panel contrast (1.1)
    textareaSaturation: string;     // 文本框饱和度 / Textarea saturation (170%)
    textareaContrast: string;       // 文本框对比度 / Textarea contrast (1.08)
    tooltipSaturation: string;      // 提示框饱和度 / Tooltip saturation (170%)
    tooltipContrast: string;        // 提示框对比度 / Tooltip contrast (1.08)
    dropdownSaturation: string;     // 下拉菜单饱和度 / Dropdown menu saturation (190%)
    dropdownContrast: string;       // 下拉菜单对比度 / Dropdown menu contrast (1.1)
    
    // 尺寸设置 / Size Settings
    panelWidth: string;             // Panel 宽度 / Panel width (320px)
    panelBorderRadius: string;      // Panel 圆角 / Panel border radius (12px)
    textareaBorderRadius: string;   // 文本框圆角 / Textarea border radius (27px)
    buttonBorderRadius: string;     // 按钮圆角 / Button border radius (6px)
    
    // 阴影设置 / Shadow Settings
    panelShadow: string;            // Panel 阴影 / Panel shadow
    dropdownShadow: string;         // 下拉菜单阴影 / Dropdown menu shadow
    
    // 位置设置 / Position Settings
    panelRight: string;             // Panel 右侧位置 / Panel right position (96px)
    panelBottom: string;            // Panel 底部位置 / Panel bottom position (96px)
    
    // 间距设置 / Spacing Settings
    panelPadding: string;           // Panel 内边距 / Panel padding (16px)
    textareaPadding: string;        // 文本框内边距 / Textarea padding (16px 20px 48px 20px)
    headerPadding: string;          // 头部内边距 / Header padding (12px 16px 8px 16px)
    
    // 字体设置 / Font Settings
    fontSize: string;               // 字体大小 / Font size (14px)
    headerFontSize: string;         // 头部字体大小 / Header font size (15px)
    tooltipFontSize: string;        // 提示框字体大小 / Tooltip font size (11px)
}

// 默认配置 / Default Configuration
export const defaultPanelConfig: PanelStyleConfig = {
    // 透明度设置 / Transparency Settings
    backgroundOpacity: 0.6,         // Panel 背景透明度 / Panel background opacity
    borderOpacity: 0.4,             // 边框透明度 / Border opacity
    textareaBackgroundOpacity: 0.5, // 文本框背景透明度 / Textarea background opacity
    tooltipBackgroundOpacity: 0.7,  // 提示框背景透明度 / Tooltip background opacity
    dropdownBackgroundOpacity: 0.7, // 下拉菜单背景透明度 / Dropdown menu background opacity
    
    // 模糊效果设置 / Blur Effect Settings
    panelBlur: '30px',              // Panel 模糊效果 / Panel blur effect
    textareaBlur: '20px',           // 文本框模糊效果 / Textarea blur effect
    tooltipBlur: '18px',            // 提示框模糊效果 / Tooltip blur effect
    dropdownBlur: '25px',           // 下拉菜单模糊效果 / Dropdown menu blur effect
    
    // 饱和度和对比度设置 / Saturation and Contrast Settings
    panelSaturation: '200%',        // Panel 饱和度 / Panel saturation 
    panelContrast: '1.1',           // Panel 对比度 / Panel contrast
    textareaSaturation: '170%',     // 文本框饱和度 / Textarea saturation
    textareaContrast: '1.08',       // 文本框对比度 / Textarea contrast
    tooltipSaturation: '170%',      // 提示框饱和度 / Tooltip saturation
    tooltipContrast: '1.08',        // 提示框对比度 / Tooltip contrast 
    dropdownSaturation: '190%',     // 下拉菜单饱和度 / Dropdown menu saturation
    dropdownContrast: '1.1',        // 下拉菜单对比度 / Dropdown menu contrast
    
    // 尺寸设置 / Size Settings
    panelWidth: '320px',            // Panel 宽度 / Panel width 
    panelBorderRadius: '12px',      // Panel 圆角 / Panel border radius
    textareaBorderRadius: '27px',   // 文本框圆角 / Textarea border radius
    buttonBorderRadius: '6px',      // 按钮圆角 / Button border radius
    
    // 阴影设置 / Shadow Settings
    panelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Panel 阴影 / Panel shadow
    dropdownShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', // 下拉菜单阴影 / Dropdown menu shadow
    
    // 位置设置 / Position Settings
    panelRight: '96px',             // Panel 右侧位置 / Panel right position 
    panelBottom: '96px',            // Panel 底部位置 / Panel bottom position 
    
    // 间距设置 / Spacing Settings
    panelPadding: '16px',           // Panel 内边距 / Panel padding 
    textareaPadding: '16px 20px 48px 20px', // 文本框内边距 / Textarea padding
    headerPadding: '12px 16px 8px 16px',    // 头部内边距 / Header padding
    
    // 字体设置 / Font Settings
    fontSize: '14px',               // 字体大小 / Font size     
    headerFontSize: '15px',         // 头部字体大小 / Header font size 
    tooltipFontSize: '8px',        // 提示框字体大小 / Tooltip font size 
};

// 当前配置（可动态修改）/ Current Configuration (dynamically modifiable)
export let currentPanelConfig: PanelStyleConfig = { ...defaultPanelConfig };

/**
 * 更新 Panel 样式配置
 * Update Panel style configuration
 * @param newConfig 新的配置项 / New configuration items
 */
export function updatePanelConfig(newConfig: Partial<PanelStyleConfig>): void {
    currentPanelConfig = { ...currentPanelConfig, ...newConfig };
    console.log('[PanelStyleVariables] Panel config updated:', currentPanelConfig);
}

/**
 * 重置为默认配置
 * Reset to default configuration
 */
export function resetPanelConfig(): void {
    currentPanelConfig = { ...defaultPanelConfig };
    console.log('[PanelStyleVariables] Panel config reset to default');
}

/**
 * 获取当前配置
 * Get current configuration
 * @returns 当前配置的副本 / Copy of current configuration
 */
export function getCurrentPanelConfig(): PanelStyleConfig {
    return { ...currentPanelConfig };
}

/**
 * 生成 CSS 变量字符串
 * Generate CSS variables string
 * @returns CSS 变量字符串 / CSS variables string
 */
export function generatePanelCSSVariables(): string {
    const config = currentPanelConfig;
    
    return `
        /* Panel 样式变量 / Panel Style Variables */
        --panel-background-opacity: ${config.backgroundOpacity};
        --panel-border-opacity: ${config.borderOpacity};
        --panel-textarea-background-opacity: ${config.textareaBackgroundOpacity};
        --panel-tooltip-background-opacity: ${config.tooltipBackgroundOpacity};
        --panel-dropdown-background-opacity: ${config.dropdownBackgroundOpacity};
        
        --panel-blur: ${config.panelBlur};
        --panel-textarea-blur: ${config.textareaBlur};
        --panel-tooltip-blur: ${config.tooltipBlur};
        --panel-dropdown-blur: ${config.dropdownBlur};
        
        --panel-saturation: ${config.panelSaturation};
        --panel-contrast: ${config.panelContrast};
        --panel-textarea-saturation: ${config.textareaSaturation};
        --panel-textarea-contrast: ${config.textareaContrast};
        --panel-tooltip-saturation: ${config.tooltipSaturation};
        --panel-tooltip-contrast: ${config.tooltipContrast};
        --panel-dropdown-saturation: ${config.dropdownSaturation};
        --panel-dropdown-contrast: ${config.dropdownContrast};
        
        --panel-width: ${config.panelWidth};
        --panel-border-radius: ${config.panelBorderRadius};
        --panel-textarea-border-radius: ${config.textareaBorderRadius};
        --panel-button-border-radius: ${config.buttonBorderRadius};
        
        --panel-shadow: ${config.panelShadow};
        --panel-dropdown-shadow: ${config.dropdownShadow};
        
        --panel-right: ${config.panelRight};
        --panel-bottom: ${config.panelBottom};
        
        --panel-padding: ${config.panelPadding};
        --panel-textarea-padding: ${config.textareaPadding};
        --panel-header-padding: ${config.headerPadding};
        
        --panel-font-size: ${config.fontSize};
        --panel-header-font-size: ${config.headerFontSize};
        --panel-tooltip-font-size: ${config.tooltipFontSize};
    `;
}

/**
 * 预设配置
 * Preset Configurations
 */
export const panelPresets = {
    // 高透明度 / High Transparency
    highTransparency: {
        backgroundOpacity: 0.3,         // Panel 背景透明度 30% / Panel background opacity 30%
        borderOpacity: 0.2,             // 边框透明度 20% / Border opacity 20%
        textareaBackgroundOpacity: 0.3, // 文本框背景透明度 30% / Textarea background opacity 30%
        tooltipBackgroundOpacity: 0.5,  // 提示框背景透明度 50% / Tooltip background opacity 50%
        dropdownBackgroundOpacity: 0.5, // 下拉菜单背景透明度 50% / Dropdown menu background opacity 50%
    },
    
    // 低透明度 / Low Transparency
    lowTransparency: {
        backgroundOpacity: 0.9,         // Panel 背景透明度 90% / Panel background opacity 90%
        borderOpacity: 0.6,             // 边框透明度 60% / Border opacity 60%
        textareaBackgroundOpacity: 0.8, // 文本框背景透明度 80% / Textarea background opacity 80%
        tooltipBackgroundOpacity: 0.9,  // 提示框背景透明度 90% / Tooltip background opacity 90%
        dropdownBackgroundOpacity: 0.9, // 下拉菜单背景透明度 90% / Dropdown menu background opacity 90%
    },
    
    // 强模糊效果 / Strong Blur Effect
    strongBlur: {
        panelBlur: '40px',              // Panel 模糊效果 40px / Panel blur effect 40px
        textareaBlur: '30px',           // 文本框模糊效果 30px / Textarea blur effect 30px
        tooltipBlur: '25px',            // 提示框模糊效果 25px / Tooltip blur effect 25px
        dropdownBlur: '35px',           // 下拉菜单模糊效果 35px / Dropdown menu blur effect 35px
    },
    
    // 弱模糊效果 / Weak Blur Effect
    weakBlur: {
        panelBlur: '15px',              // Panel 模糊效果 15px / Panel blur effect 15px
        textareaBlur: '10px',           // 文本框模糊效果 10px / Textarea blur effect 10px
        tooltipBlur: '8px',             // 提示框模糊效果 8px / Tooltip blur effect 8px
        dropdownBlur: '12px',           // 下拉菜单模糊效果 12px / Dropdown menu blur effect 12px
    },
    
    // 高饱和度 / High Saturation
    highSaturation: {
        panelSaturation: '250%',        // Panel 饱和度 250% / Panel saturation 250%
        textareaSaturation: '220%',     // 文本框饱和度 220% / Textarea saturation 220%
        tooltipSaturation: '220%',      // 提示框饱和度 220% / Tooltip saturation 220%
        dropdownSaturation: '240%',     // 下拉菜单饱和度 240% / Dropdown menu saturation 240%
    },
    
    // 低饱和度 / Low Saturation
    lowSaturation: {
        panelSaturation: '150%',        // Panel 饱和度 150% / Panel saturation 150%
        textareaSaturation: '120%',     // 文本框饱和度 120% / Textarea saturation 120%
        tooltipSaturation: '120%',      // 提示框饱和度 120% / Tooltip saturation 120%
        dropdownSaturation: '140%',     // 下拉菜单饱和度 140% / Dropdown menu saturation 140%
    },
    
    // 紧凑布局 / Compact Layout
    compact: {
        panelWidth: '280px',            // Panel 宽度 280px / Panel width 280px
        panelPadding: '12px',           // Panel 内边距 12px / Panel padding 12px
        textareaPadding: '12px 16px 40px 16px', // 文本框内边距 / Textarea padding
        headerPadding: '8px 12px 6px 12px',     // 头部内边距 / Header padding
        fontSize: '13px',               // 字体大小 13px / Font size 13px
        headerFontSize: '14px',         // 头部字体大小 14px / Header font size 14px
    },
    
    // 宽松布局 / Spacious Layout
    spacious: {
        panelWidth: '360px',            // Panel 宽度 360px / Panel width 360px
        panelPadding: '20px',           // Panel 内边距 20px / Panel padding 20px
        textareaPadding: '20px 24px 56px 24px', // 文本框内边距 / Textarea padding
        headerPadding: '16px 20px 12px 20px',   // 头部内边距 / Header padding
        fontSize: '15px',               // 字体大小 15px / Font size 15px
        headerFontSize: '16px',         // 头部字体大小 16px / Header font size 16px
    },
};

/**
 * 应用预设配置
 * Apply preset configuration
 * @param presetName 预设名称 / Preset name
 */
export function applyPanelPreset(presetName: keyof typeof panelPresets): void {
    const preset = panelPresets[presetName];
    updatePanelConfig(preset);
    console.log(`[PanelStyleVariables] Applied preset: ${presetName}`);
}

/**
 * 获取所有预设名称
 * Get all preset names
 * @returns 预设名称数组 / Array of preset names
 */
export function getPanelPresetNames(): string[] {
    return Object.keys(panelPresets);
} 