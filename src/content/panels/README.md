# Panel 样式变量系统 / Panel Style Variables System

这个系统允许你轻松自定义 PageEdit Panel 的视觉效果，包括透明度、模糊效果、饱和度等。
This system allows you to easily customize the visual effects of PageEdit Panel, including transparency, blur effects, saturation, etc.

## 文件结构 / File Structure

- `PanelStyleVariables.ts` - 核心变量定义和配置管理 / Core variable definitions and configuration management
- `PanelStyles.ts` - 使用变量的样式文件 / Style file using variables
- `PanelStyleExample.ts` - 使用示例和预设配置 / Usage examples and preset configurations

## 主要功能 / Main Features

### 1. 透明度控制 / Transparency Control
- `backgroundOpacity` - Panel 背景透明度 (0.6) / Panel background opacity (0.6)
- `borderOpacity` - 边框透明度 (0.4) / Border opacity (0.4)
- `textareaBackgroundOpacity` - 文本框背景透明度 (0.5) / Textarea background opacity (0.5)
- `tooltipBackgroundOpacity` - 提示框背景透明度 (0.7) / Tooltip background opacity (0.7)
- `dropdownBackgroundOpacity` - 下拉菜单背景透明度 (0.7) / Dropdown menu background opacity (0.7)

### 2. 模糊效果控制 / Blur Effect Control
- `panelBlur` - Panel 模糊效果 (30px) / Panel blur effect (30px)
- `textareaBlur` - 文本框模糊效果 (20px) / Textarea blur effect (20px)
- `tooltipBlur` - 提示框模糊效果 (18px) / Tooltip blur effect (18px)
- `dropdownBlur` - 下拉菜单模糊效果 (25px) / Dropdown menu blur effect (25px)

### 3. 饱和度和对比度控制 / Saturation and Contrast Control
- `panelSaturation` - Panel 饱和度 (200%) / Panel saturation (200%)
- `panelContrast` - Panel 对比度 (1.1) / Panel contrast (1.1)
- `textareaSaturation` - 文本框饱和度 (170%) / Textarea saturation (170%)
- `textareaContrast` - 文本框对比度 (1.08) / Textarea contrast (1.08)
- `tooltipSaturation` - 提示框饱和度 (170%) / Tooltip saturation (170%)
- `tooltipContrast` - 提示框对比度 (1.08) / Tooltip contrast (1.08)
- `dropdownSaturation` - 下拉菜单饱和度 (190%) / Dropdown menu saturation (190%)
- `dropdownContrast` - 下拉菜单对比度 (1.1) / Dropdown menu contrast (1.1)

### 4. 尺寸和布局控制 / Size and Layout Control
- `panelWidth` - Panel 宽度 (320px) / Panel width (320px)
- `panelBorderRadius` - Panel 圆角 (12px) / Panel border radius (12px)
- `textareaBorderRadius` - 文本框圆角 (27px) / Textarea border radius (27px)
- `buttonBorderRadius` - 按钮圆角 (6px) / Button border radius (6px)
- `panelPadding` - Panel 内边距 (16px) / Panel padding (16px)
- `textareaPadding` - 文本框内边距 / Textarea padding
- `headerPadding` - 头部内边距 / Header padding

## 使用方法 / Usage

### 基本使用 / Basic Usage

```typescript
import { updatePanelConfig, resetPanelConfig } from './PanelStyleVariables';

// 调整透明度 / Adjust transparency
updatePanelConfig({
    backgroundOpacity: 0.3,
    textareaBackgroundOpacity: 0.25,
});

// 调整模糊效果 / Adjust blur effects
updatePanelConfig({
    panelBlur: '40px',
    textareaBlur: '30px',
});

// 重置为默认配置 / Reset to default configuration
resetPanelConfig();
```

### 使用预设配置 / Using Preset Configurations

```typescript
import { applyPanelPreset, getPanelPresetNames } from './PanelStyleVariables';

// 查看所有可用预设 / View all available presets
console.log(getPanelPresetNames());
// ['highTransparency', 'lowTransparency', 'strongBlur', 'weakBlur', 'highSaturation', 'lowSaturation', 'compact', 'spacious']

// 应用高透明度预设 / Apply high transparency preset
applyPanelPreset('highTransparency');

// 应用强模糊效果预设 / Apply strong blur preset
applyPanelPreset('strongBlur');

// 应用紧凑布局预设 / Apply compact layout preset
applyPanelPreset('compact');
```

### 使用示例函数 / Using Example Functions

```typescript
import { PanelStyleExamples } from './PanelStyleExample';

// 调整透明度 / Adjust transparency
PanelStyleExamples.adjustPanelTransparency(0.4);

// 调整模糊效果 / Adjust blur effects
PanelStyleExamples.adjustPanelBlur('35px');

// 调整饱和度 / Adjust saturation
PanelStyleExamples.adjustPanelSaturation('250%');

// 调整对比度 / Adjust contrast
PanelStyleExamples.adjustPanelContrast('1.2');

// 调整 Panel 尺寸 / Adjust Panel size
PanelStyleExamples.adjustPanelSize('360px');

// 调整圆角 / Adjust border radius
PanelStyleExamples.adjustPanelBorderRadius('16px');

// 创建自定义配置 / Create custom configuration
PanelStyleExamples.createCustomConfigExample();

// 根据系统主题自动调整 / Auto-adjust based on system theme
PanelStyleExamples.adjustForSystemTheme();
```

## 预设配置说明 / Preset Configuration Description

### 透明度预设 / Transparency Presets
- `highTransparency` - 高透明度 (0.3-0.5) / High transparency (0.3-0.5)
- `lowTransparency` - 低透明度 (0.8-0.9) / Low transparency (0.8-0.9)

### 模糊效果预设 / Blur Effect Presets
- `strongBlur` - 强模糊效果 (25px-40px) / Strong blur effect (25px-40px)
- `weakBlur` - 弱模糊效果 (8px-15px) / Weak blur effect (8px-15px)

### 饱和度预设 / Saturation Presets
- `highSaturation` - 高饱和度 (220%-250%) / High saturation (220%-250%)
- `lowSaturation` - 低饱和度 (120%-150%) / Low saturation (120%-150%)

### 布局预设 / Layout Presets
- `compact` - 紧凑布局 (280px 宽度，较小间距) / Compact layout (280px width, smaller spacing)
- `spacious` - 宽松布局 (360px 宽度，较大间距) / Spacious layout (360px width, larger spacing)

## 动态更新 / Dynamic Updates

配置更改会立即生效，无需重新加载页面。所有样式都通过 CSS 变量实现，确保性能最佳。
Configuration changes take effect immediately without reloading the page. All styles are implemented through CSS variables to ensure optimal performance.

## 注意事项 / Notes

1. 所有透明度值应在 0-1 之间 / All opacity values should be between 0-1
2. 模糊效果值应为有效的 CSS 长度单位 (如 px, rem) / Blur effect values should be valid CSS length units (e.g., px, rem)
3. 饱和度值应为百分比字符串 (如 "200%") / Saturation values should be percentage strings (e.g., "200%")
4. 对比度值应为数字字符串 (如 "1.1") / Contrast values should be numeric strings (e.g., "1.1")
5. 尺寸值应为有效的 CSS 长度单位 / Size values should be valid CSS length units

## 扩展功能 / Extension Features

你可以轻松添加新的预设配置或自定义函数：
You can easily add new preset configurations or custom functions:

```typescript
// 添加新的预设 / Add new preset
export const customPresets = {
    myCustomPreset: {
        backgroundOpacity: 0.5,
        panelBlur: '25px',
        panelSaturation: '180%',
    }
};

// 应用自定义预设 / Apply custom preset
updatePanelConfig(customPresets.myCustomPreset);
```

这个系统为 PageEdit Panel 提供了强大的样式自定义能力，同时保持了代码的整洁和可维护性。
This system provides powerful style customization capabilities for PageEdit Panel while maintaining clean and maintainable code. 