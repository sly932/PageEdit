/**
 * Panel 样式自定义示例
 * 展示如何使用 PanelStyleVariables 来自定义 Panel 的外观
 * 
 * Panel Style Customization Examples
 * Demonstrates how to use PanelStyleVariables to customize Panel appearance
 */

import { 
    updatePanelConfig, 
    resetPanelConfig, 
    applyPanelPreset, 
    getCurrentPanelConfig,
    getPanelPresetNames 
} from './PanelStyleVariables';

/**
 * 示例：调整 Panel 透明度
 * Example: Adjust Panel transparency
 * @param opacity 透明度值 (0-1) / Opacity value (0-1)
 */
export function adjustPanelTransparency(opacity: number) {
    updatePanelConfig({
        backgroundOpacity: opacity,                                    // Panel 背景透明度 / Panel background opacity
        textareaBackgroundOpacity: opacity * 0.8,                      // 文本框稍微透明一些 / Textarea slightly more transparent
        tooltipBackgroundOpacity: opacity * 1.2,                       // 提示框稍微不透明一些 / Tooltip slightly less transparent
        dropdownBackgroundOpacity: opacity * 1.2,                      // 下拉菜单稍微不透明一些 / Dropdown menu slightly less transparent
    });
    console.log(`[PanelStyleExample] Adjusted transparency to ${opacity}`);
}

/**
 * 示例：调整模糊效果
 * Example: Adjust blur effects
 * @param blur 模糊值 (如 "30px") / Blur value (e.g., "30px")
 */
export function adjustPanelBlur(blur: string) {
    updatePanelConfig({
        panelBlur: blur,                                               // Panel 模糊效果 / Panel blur effect
        textareaBlur: `${parseInt(blur) * 0.67}px`,                   // 文本框模糊效果是面板的 2/3 / Textarea blur is 2/3 of panel
        tooltipBlur: `${parseInt(blur) * 0.6}px`,                     // 提示框模糊效果是面板的 3/5 / Tooltip blur is 3/5 of panel
        dropdownBlur: `${parseInt(blur) * 0.83}px`,                   // 下拉菜单模糊效果是面板的 5/6 / Dropdown blur is 5/6 of panel
    });
    console.log(`[PanelStyleExample] Adjusted blur to ${blur}`);
}

/**
 * 示例：调整饱和度
 * Example: Adjust saturation
 * @param saturation 饱和度值 (如 "200%") / Saturation value (e.g., "200%")
 */
export function adjustPanelSaturation(saturation: string) {
    updatePanelConfig({
        panelSaturation: saturation,                                   // Panel 饱和度 / Panel saturation
        textareaSaturation: `${parseInt(saturation) * 0.85}%`,        // 文本框饱和度稍低 / Textarea saturation slightly lower
        tooltipSaturation: `${parseInt(saturation) * 0.85}%`,         // 提示框饱和度稍低 / Tooltip saturation slightly lower
        dropdownSaturation: `${parseInt(saturation) * 0.95}%`,        // 下拉菜单饱和度稍低 / Dropdown saturation slightly lower
    });
    console.log(`[PanelStyleExample] Adjusted saturation to ${saturation}`);
}

/**
 * 示例：调整对比度
 * Example: Adjust contrast
 * @param contrast 对比度值 (如 "1.1") / Contrast value (e.g., "1.1")
 */
export function adjustPanelContrast(contrast: string) {
    updatePanelConfig({
        panelContrast: contrast,                                       // Panel 对比度 / Panel contrast
        textareaContrast: `${parseFloat(contrast) * 0.98}`,           // 文本框对比度稍低 / Textarea contrast slightly lower
        tooltipContrast: `${parseFloat(contrast) * 0.98}`,            // 提示框对比度稍低 / Tooltip contrast slightly lower
        dropdownContrast: contrast,                                    // 下拉菜单对比度 / Dropdown contrast
    });
    console.log(`[PanelStyleExample] Adjusted contrast to ${contrast}`);
}

/**
 * 示例：调整 Panel 尺寸
 * Example: Adjust Panel size
 * @param width Panel 宽度 (如 "360px") / Panel width (e.g., "360px")
 */
export function adjustPanelSize(width: string) {
    updatePanelConfig({
        panelWidth: width,                                             // Panel 宽度 / Panel width
    });
    console.log(`[PanelStyleExample] Adjusted panel width to ${width}`);
}

/**
 * 示例：调整圆角
 * Example: Adjust border radius
 * @param radius 圆角值 (如 "16px") / Border radius value (e.g., "16px")
 */
export function adjustPanelBorderRadius(radius: string) {
    updatePanelConfig({
        panelBorderRadius: radius,                                     // Panel 圆角 / Panel border radius
        textareaBorderRadius: `${parseInt(radius) * 2.25}px`,         // 文本框圆角是面板的 2.25 倍 / Textarea radius is 2.25x panel radius
        buttonBorderRadius: radius,                                    // 按钮圆角 / Button border radius
    });
    console.log(`[PanelStyleExample] Adjusted border radius to ${radius}`);
}

/**
 * 示例：应用预设配置
 * Example: Apply preset configurations
 */
export function applyPresetExample() {
    console.log('[PanelStyleExample] Available presets:', getPanelPresetNames());
    
    // 应用高透明度预设 / Apply high transparency preset
    applyPanelPreset('highTransparency');
    console.log('[PanelStyleExample] Applied high transparency preset');
    
    // 应用强模糊效果预设 / Apply strong blur preset
    applyPanelPreset('strongBlur');
    console.log('[PanelStyleExample] Applied strong blur preset');
}

/**
 * 示例：重置为默认配置
 * Example: Reset to default configuration
 */
export function resetToDefaultExample() {
    resetPanelConfig();
    console.log('[PanelStyleExample] Reset to default configuration');
}

/**
 * 示例：获取当前配置
 * Example: Get current configuration
 * @returns 当前配置对象 / Current configuration object
 */
export function getCurrentConfigExample() {
    const config = getCurrentPanelConfig();
    console.log('[PanelStyleExample] Current configuration:', config);
    return config;
}

/**
 * 示例：创建自定义配置
 * Example: Create custom configuration
 * 创建一个高透明度、强模糊、高饱和度的配置
 * Creates a configuration with high transparency, strong blur, and high saturation
 */
export function createCustomConfigExample() {
    // 创建一个高透明度、强模糊、高饱和度的配置
    // Create a configuration with high transparency, strong blur, and high saturation
    updatePanelConfig({
        // 透明度设置 / Transparency settings
        backgroundOpacity: 0.3,                                        // Panel 背景透明度 30% / Panel background opacity 30%
        borderOpacity: 0.2,                                            // 边框透明度 20% / Border opacity 20%
        textareaBackgroundOpacity: 0.25,                               // 文本框背景透明度 25% / Textarea background opacity 25%
        tooltipBackgroundOpacity: 0.4,                                 // 提示框背景透明度 40% / Tooltip background opacity 40%
        dropdownBackgroundOpacity: 0.4,                                // 下拉菜单背景透明度 40% / Dropdown background opacity 40%
        
        // 模糊效果设置 / Blur effect settings
        panelBlur: '40px',                                             // Panel 模糊效果 40px / Panel blur effect 40px
        textareaBlur: '30px',                                          // 文本框模糊效果 30px / Textarea blur effect 30px
        tooltipBlur: '25px',                                           // 提示框模糊效果 25px / Tooltip blur effect 25px
        dropdownBlur: '35px',                                          // 下拉菜单模糊效果 35px / Dropdown blur effect 35px
        
        // 饱和度设置 / Saturation settings
        panelSaturation: '250%',                                       // Panel 饱和度 250% / Panel saturation 250%
        textareaSaturation: '220%',                                    // 文本框饱和度 220% / Textarea saturation 220%
        tooltipSaturation: '220%',                                     // 提示框饱和度 220% / Tooltip saturation 220%
        dropdownSaturation: '240%',                                    // 下拉菜单饱和度 240% / Dropdown saturation 240%
        
        // 对比度设置 / Contrast settings
        panelContrast: '1.2',                                          // Panel 对比度 1.2 / Panel contrast 1.2
        textareaContrast: '1.15',                                      // 文本框对比度 1.15 / Textarea contrast 1.15
        tooltipContrast: '1.15',                                       // 提示框对比度 1.15 / Tooltip contrast 1.15
        dropdownContrast: '1.2',                                       // 下拉菜单对比度 1.2 / Dropdown contrast 1.2
    });
    
    console.log('[PanelStyleExample] Created custom high-transparency, strong-blur, high-saturation configuration');
}

/**
 * 示例：创建紧凑布局配置
 * Example: Create compact layout configuration
 */
export function createCompactLayoutExample() {
    updatePanelConfig({
        panelWidth: '280px',                                           // Panel 宽度 280px / Panel width 280px
        panelPadding: '12px',                                          // Panel 内边距 12px / Panel padding 12px
        textareaPadding: '12px 16px 40px 16px',                        // 文本框内边距 / Textarea padding
        headerPadding: '8px 12px 6px 12px',                            // 头部内边距 / Header padding
        fontSize: '13px',                                              // 字体大小 13px / Font size 13px
        headerFontSize: '14px',                                        // 头部字体大小 14px / Header font size 14px
        tooltipFontSize: '10px',                                       // 提示框字体大小 10px / Tooltip font size 10px
    });
    
    console.log('[PanelStyleExample] Created compact layout configuration');
}

/**
 * 示例：创建宽松布局配置
 * Example: Create spacious layout configuration
 */
export function createSpaciousLayoutExample() {
    updatePanelConfig({
        panelWidth: '360px',                                           // Panel 宽度 360px / Panel width 360px
        panelPadding: '20px',                                          // Panel 内边距 20px / Panel padding 20px
        textareaPadding: '20px 24px 56px 24px',                        // 文本框内边距 / Textarea padding
        headerPadding: '16px 20px 12px 20px',                          // 头部内边距 / Header padding
        fontSize: '15px',                                              // 字体大小 15px / Font size 15px
        headerFontSize: '16px',                                        // 头部字体大小 16px / Header font size 16px
        tooltipFontSize: '12px',                                       // 提示框字体大小 12px / Tooltip font size 12px
    });
    
    console.log('[PanelStyleExample] Created spacious layout configuration');
}

/**
 * 示例：根据系统主题调整配置
 * Example: Adjust configuration based on system theme
 */
export function adjustForSystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
        // 暗色模式下使用更高的透明度和更强的模糊效果
        // Use higher transparency and stronger blur in dark mode
        updatePanelConfig({
            backgroundOpacity: 0.7,                                    // Panel 背景透明度 70% / Panel background opacity 70%
            textareaBackgroundOpacity: 0.6,                            // 文本框背景透明度 60% / Textarea background opacity 60%
            panelBlur: '35px',                                         // Panel 模糊效果 35px / Panel blur effect 35px
            textareaBlur: '25px',                                      // 文本框模糊效果 25px / Textarea blur effect 25px
        });
        console.log('[PanelStyleExample] Adjusted for dark theme');
    } else {
        // 亮色模式下使用较低的透明度和较弱的模糊效果
        // Use lower transparency and weaker blur in light mode
        updatePanelConfig({
            backgroundOpacity: 0.5,                                    // Panel 背景透明度 50% / Panel background opacity 50%
            textareaBackgroundOpacity: 0.4,                            // 文本框背景透明度 40% / Textarea background opacity 40%
            panelBlur: '25px',                                         // Panel 模糊效果 25px / Panel blur effect 25px
            textareaBlur: '15px',                                      // 文本框模糊效果 15px / Textarea blur effect 15px
        });
        console.log('[PanelStyleExample] Adjusted for light theme');
    }
}

/**
 * 示例：监听系统主题变化并自动调整
 * Example: Listen for system theme changes and adjust automatically
 */
export function setupThemeChangeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (event) => {
        adjustForSystemTheme();                                        // 主题变化时自动调整 / Auto-adjust when theme changes
    });
    
    console.log('[PanelStyleExample] Set up theme change listener');
}

// 导出所有示例函数 / Export all example functions
export const PanelStyleExamples = {
    adjustPanelTransparency,      // 调整透明度 / Adjust transparency
    adjustPanelBlur,              // 调整模糊效果 / Adjust blur effects
    adjustPanelSaturation,        // 调整饱和度 / Adjust saturation
    adjustPanelContrast,          // 调整对比度 / Adjust contrast
    adjustPanelSize,              // 调整尺寸 / Adjust size
    adjustPanelBorderRadius,      // 调整圆角 / Adjust border radius
    applyPresetExample,           // 应用预设 / Apply presets
    resetToDefaultExample,        // 重置默认 / Reset to default
    getCurrentConfigExample,      // 获取当前配置 / Get current config
    createCustomConfigExample,    // 创建自定义配置 / Create custom config
    createCompactLayoutExample,   // 创建紧凑布局 / Create compact layout
    createSpaciousLayoutExample,  // 创建宽松布局 / Create spacious layout
    adjustForSystemTheme,         // 根据主题调整 / Adjust for theme
    setupThemeChangeListener,     // 设置主题监听 / Setup theme listener
}; 