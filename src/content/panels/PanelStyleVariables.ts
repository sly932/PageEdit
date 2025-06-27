/**
 * Panel 样式变量定义文件
 * Panel Style Variables Definition File
 * 
 * 🎨 这个文件是整个面板外观的控制中心！
 * 🎨 This file is the control center for the entire panel appearance!
 * 
 * 📖 文件作用说明：
 * 📖 File Purpose:
 * • 集中管理面板的所有视觉效果（透明度、模糊、颜色等）
 * • Centrally manages all visual effects of the panel (transparency, blur, colors, etc.)
 * • 提供多种预设配置，可以一键切换不同的视觉风格
 * • Provides multiple preset configurations for one-click switching between different visual styles
 * • 允许用户自定义每个细节的外观
 * • Allows users to customize the appearance of every detail
 * 
 * 🛠️ 如何使用：
 * 🛠️ How to use:
 * 1. 修改 defaultPanelConfig 中的数值来改变默认外观
 * 1. Modify values in defaultPanelConfig to change default appearance
 * 2. 使用 applyPanelPreset() 函数应用预设风格
 * 2. Use applyPanelPreset() function to apply preset styles
 * 3. 使用 updatePanelConfig() 函数实时更新配置
 * 3. Use updatePanelConfig() function to update configuration in real-time
 * 
 * 💡 配置示例：
 * 💡 Configuration examples:
 * • backgroundOpacity: 0.3 = 背景30%透明，70%不透明
 * • backgroundOpacity: 0.3 = Background 30% transparent, 70% opaque
 * • blur: "30px" = 背景模糊30像素，创造磨砂玻璃效果
 * • blur: "30px" = Background blurred by 30 pixels, creates frosted glass effect
 * • saturation: "200%" = 色彩饱和度提升到200%，颜色更鲜艳
 * • saturation: "200%" = Color saturation increased to 200%, more vibrant colors
 */

export interface PanelStyleConfig {
    // 颜色系统 / Color System
    colors: {
        // 亮色主题基础色 / Light Theme Base Colors
        light: {
            background: string;              // 面板的白色背景色 / Panel's white background color
            text: {
                primary: string;             // 主要文字颜色（如标题文字）/ Primary text color (like title text)
                secondary: string;           // 次要文字颜色（如按钮文字）/ Secondary text color (like button text)
                muted: string;               // 弱化文字颜色（如占位符文字）/ Muted text color (like placeholder text)
                disabled: string;            // 禁用状态文字颜色（如禁用按钮的文字）/ Disabled state text color (like disabled button text)
            };
            border: {
                primary: string;             // 主要边框颜色（如输入框边框）/ Primary border color (like input field border)
                muted: string;               // 弱化边框颜色（如分割线）/ Muted border color (like divider lines)
            };
            surface: {
                primary: string;             // 主要表面颜色（如按钮背景）/ Primary surface color (like button background)
                secondary: string;           // 次要表面颜色（如卡片背景）/ Secondary surface color (like card background)
                hover: string;               // 鼠标悬停时的背景色 / Background color when mouse hovers
            };
        };
        
        // 暗色主题基础色 / Dark Theme Base Colors
        dark: {
            background: string;              // 面板的暗色背景色 / Panel's dark background color
            text: {
                primary: string;             // 暗色模式下的主要文字颜色 / Primary text color in dark mode
                secondary: string;           // 暗色模式下的次要文字颜色 / Secondary text color in dark mode
                muted: string;               // 暗色模式下的弱化文字颜色 / Muted text color in dark mode
                disabled: string;            // 暗色模式下的禁用文字颜色 / Disabled text color in dark mode
            };
            border: {
                primary: string;             // 暗色模式下的主要边框颜色 / Primary border color in dark mode
                muted: string;               // 暗色模式下的弱化边框颜色 / Muted border color in dark mode
            };
            surface: {
                primary: string;             // 暗色模式下的主要表面颜色 / Primary surface color in dark mode
                secondary: string;           // 暗色模式下的次要表面颜色 / Secondary surface color in dark mode
                hover: string;               // 暗色模式下的悬停背景色 / Hover background color in dark mode
            };
        };
        
        // 功能色彩 / Functional Colors
        functional: {
            primary: {
                main: string;                // 品牌主色调（用于"应用"按钮等重要操作）/ Brand primary color (for "Apply" button and important actions)
                hover: string;               // 主色调的悬停状态（鼠标悬停时的颜色变化）/ Primary color hover state (color change when mouse hovers)
                light: string;               // 主色调的浅色版本（用于高亮显示）/ Light version of primary color (for highlighting)
            };
            success: {
                main: string;                // 成功状态颜色（绿色，用于成功提示）/ Success state color (green, for success messages)
                light: string;               // 成功色的浅色背景（用于成功提示的背景）/ Light success background (for success message backgrounds)
                dark: string;                // 成功色的深色版本（暗色模式下使用）/ Dark version of success color (for dark mode)
            };
            danger: {
                main: string;                // 危险/错误状态颜色（红色，用于删除按钮、错误提示）/ Danger/error state color (red, for delete buttons and error messages)
                light: string;               // 危险色的浅色背景（用于危险操作的背景提示）/ Light danger background (for dangerous action backgrounds)
                dark: string;                // 危险色的深色版本（暗色模式下使用）/ Dark version of danger color (for dark mode)
            };
            focus: {
                main: string;                // 焦点状态颜色（蓝色，当用户点击输入框时显示）/ Focus state color (blue, shown when user clicks input fields)
                light: string;               // 焦点色的浅色背景（焦点状态的背景色）/ Light focus background (background for focus states)
                border: string;              // 焦点边框颜色（输入框获得焦点时的边框）/ Focus border color (border when input field is focused)
                strong: string;              // 强调焦点颜色（更明显的焦点提示）/ Strong focus color (more prominent focus indication)
                dark: string;                // 焦点色的深色版本（暗色模式下使用）/ Dark version of focus color (for dark mode)
            };
        };
        
        // 组件专用色彩 / Component Specific Colors
        component: {
            placeholder: {
                light: string;               // 亮色模式下的占位符文字颜色（如"请输入内容..."）/ Light mode placeholder text color (like "Please enter content...")
                dark: string;                // 暗色模式下的占位符文字颜色 / Dark mode placeholder text color
            };
            icon: {
                light: string;               // 亮色模式下的图标颜色（按钮上的小图标）/ Light mode icon color (small icons on buttons)
                dark: string;                // 暗色模式下的图标颜色 / Dark mode icon color
                disabled: string;            // 禁用状态下的图标颜色（灰色，表示不可点击）/ Disabled state icon color (gray, indicating not clickable)
            };
        };
    };

    // Panel 主体配置 / Panel Main Configuration
    panel: {
        backgroundOpacity: number;           // 背景透明度（0-1，0=完全透明，1=完全不透明）/ Background opacity (0-1, 0=fully transparent, 1=fully opaque)
        borderOpacity: number;              // 边框透明度（0-1，控制边框的可见程度）/ Border opacity (0-1, controls border visibility)  
        blur: string;                       // 模糊效果强度（如"30px"，数值越大越模糊，创造磨砂玻璃效果）/ Blur effect strength (like "30px", higher values = more blur, creates frosted glass effect)
        saturation: string;                 // 饱和度增强（如"200%"，提升色彩鲜艳度）/ Saturation enhancement (like "200%", enhances color vibrancy)
        contrast: string;                   // 对比度调整（如"1.1"，让颜色更清晰）/ Contrast adjustment (like "1.1", makes colors clearer)
        width: string;                      // 面板宽度（如"320px"，控制整个面板的宽度）/ Panel width (like "320px", controls entire panel width)
        borderRadius: string;               // 圆角大小（如"12px"，数值越大圆角越明显）/ Border radius (like "12px", higher values = more rounded corners)
        shadow: string;                     // 阴影效果（CSS阴影语法，让面板有立体感）/ Shadow effect (CSS shadow syntax, gives panel depth)
        padding: string;                    // 内边距（如"16px"，控制内容与边框的距离）/ Padding (like "16px", controls distance between content and border)
        position: {                         // 位置设置 / Position settings
            right: string;                  // 距离屏幕右边的距离（如"96px"）/ Distance from right edge of screen (like "96px")
            bottom: string;                 // 距离屏幕底部的距离（如"96px"）/ Distance from bottom of screen (like "96px")
        };
    };
    
    // 文本框配置 / Textarea Configuration
    textarea: {
        backgroundOpacity: number;          // 输入框背景透明度（0-1，让背景有玻璃质感）/ Input box background opacity (0-1, gives background glass-like texture)
        blur: string;                       // 输入框模糊效果（如"20px"，背景模糊强度）/ Input box blur effect (like "20px", background blur strength)
        saturation: string;                 // 输入框饱和度（如"170%"，色彩增强效果）/ Input box saturation (like "170%", color enhancement effect)
        contrast: string;                   // 输入框对比度（如"1.08"，文字清晰度）/ Input box contrast (like "1.08", text clarity)
        borderRadius: string;               // 输入框圆角（如"27px"，让输入框看起来更圆润）/ Input box border radius (like "27px", makes input box look more rounded)
        padding: string;                    // 输入框内边距（如"16px 20px 48px 20px"，上右下左的间距）/ Input box padding (like "16px 20px 48px 20px", top-right-bottom-left spacing)
    };
    
    // 提示框配置 / Tooltip Configuration
    tooltip: {
        backgroundOpacity: number;          // 提示框背景透明度（鼠标悬停时显示的小提示框）/ Tooltip background opacity (small hint box shown when mouse hovers)
        blur: string;                       // 提示框模糊效果（让提示框有磨砂质感）/ Tooltip blur effect (gives tooltip frosted texture)
        saturation: string;                 // 提示框饱和度（提示框的色彩鲜艳度）/ Tooltip saturation (tooltip color vibrancy)
        contrast: string;                   // 提示框对比度（提示框文字的清晰度）/ Tooltip contrast (tooltip text clarity)
        fontSize: string;                   // 提示框字体大小（如"11px"，提示文字的大小）/ Tooltip font size (like "11px", hint text size)
    };
    
    // 下拉菜单配置 / Dropdown Configuration
    dropdown: {
        backgroundOpacity: number;          // 下拉菜单背景透明度（点击按钮时出现的菜单）/ Dropdown menu background opacity (menu that appears when clicking buttons)
        blur: string;                       // 下拉菜单模糊效果（菜单的磨砂玻璃效果）/ Dropdown menu blur effect (menu's frosted glass effect)
        saturation: string;                 // 下拉菜单饱和度（菜单的色彩鲜艳度）/ Dropdown menu saturation (menu color vibrancy)
        contrast: string;                   // 下拉菜单对比度（菜单文字的清晰度）/ Dropdown menu contrast (menu text clarity)
        shadow: string;                     // 下拉菜单阴影（让菜单有悬浮感）/ Dropdown menu shadow (gives menu floating effect)
    };
    
    // 头部配置 / Header Configuration
    header: {
        padding: string;                    // 头部内边距（标题区域的间距）/ Header padding (title area spacing)
        fontSize: string;                   // 头部字体大小（标题文字的大小）/ Header font size (title text size)
    };
    
    // 按钮配置 / Button Configuration
    button: {
        borderRadius: string;               // 按钮圆角（如"6px"，让按钮看起来更圆润）/ Button border radius (like "6px", makes buttons look more rounded)
        size: string;                       // 按钮尺寸（如"32px"，按钮的宽高）/ Button size (like "32px", button width and height)
    };
    
    // 通用配置 / Common Configuration
    common: {
        fontSize: string;                   // 基础字体大小（面板中大部分文字的大小）/ Base font size (size of most text in panel)
        iconSize: string;                   // 图标尺寸（按钮上小图标的大小）/ Icon size (size of small icons on buttons)
        transitionDuration: string;         // 过渡动画时长（如"0.2s"，颜色变化等动画的速度）/ Transition duration (like "0.2s", speed of color changes and other animations)
        hoverTransitionDuration: string;    // 悬停动画时长（鼠标悬停时动画的速度）/ Hover transition duration (speed of animations when mouse hovers)
        tooltipTransitionDuration: string;  // 提示框动画时长（提示框出现/消失的速度）/ Tooltip transition duration (speed of tooltip appearance/disappearance)
    };
}

// 默认配置 / Default Configuration
export const defaultPanelConfig: PanelStyleConfig = {
    // 颜色系统 / Color System
    colors: {
        // 亮色主题 / Light Theme
        light: {
            background: '#ffffff',                              // 面板白色背景 / Panel white background
            text: {
                primary: 'rgb(17, 24, 39)',                    // 主要文字颜色（深灰色，如标题）/ Primary text color (dark gray, like titles)
                secondary: 'rgb(55, 65, 81)',                  // 次要文字颜色（中灰色，如按钮文字）/ Secondary text color (medium gray, like button text)
                muted: 'rgb(156, 163, 175)',                   // 弱化文字颜色（浅灰色，如占位符）/ Muted text color (light gray, like placeholders)
                disabled: 'rgb(156, 163, 175)',                // 禁用文字颜色（浅灰色，不可点击状态）/ Disabled text color (light gray, non-clickable state)
            },
            border: {
                primary: 'rgba(0, 0, 0, 0.15)',               // 主要边框颜色（半透明黑色）/ Primary border color (semi-transparent black)
                muted: 'rgba(255, 255, 255, 1)',              // 弱化边框颜色（白色）/ Muted border color (white)
            },
            surface: {
                primary: '#f3f4f6',                            // 主要表面颜色（浅灰色，按钮背景）/ Primary surface color (light gray, button background)
                secondary: '#e5e7eb',                          // 次要表面颜色（更浅灰色，卡片背景）/ Secondary surface color (lighter gray, card background)
                hover: 'rgba(0, 0, 0, 0.05)',                 // 悬停背景颜色（很淡的黑色覆盖）/ Hover background color (very light black overlay)
            },
        },
        
        // 暗色主题 / Dark Theme
        dark: {
            background: 'rgba(30, 30, 30, 1)',                // 面板暗色背景（深灰色）/ Panel dark background (deep gray)
            text: {
                primary: 'rgb(240, 240, 240)',                // 暗色模式主要文字（亮灰色）/ Dark mode primary text (bright gray)
                secondary: 'rgb(229, 231, 235)',              // 暗色模式次要文字（稍暗的亮灰色）/ Dark mode secondary text (slightly darker bright gray)
                muted: 'rgb(156, 163, 175)',                  // 暗色模式弱化文字（中等灰色）/ Dark mode muted text (medium gray)
                disabled: 'rgb(107, 114, 128)',               // 暗色模式禁用文字（暗灰色）/ Dark mode disabled text (dark gray)
            },
            border: {
                primary: 'rgba(75, 85, 99, 1)',               // 暗色模式主要边框（中等深灰色）/ Dark mode primary border (medium dark gray)
                muted: 'rgba(60, 60, 60, 0.9)',               // 暗色模式弱化边框（深灰色，半透明）/ Dark mode muted border (dark gray, semi-transparent)
            },
            surface: {
                primary: '#374151',                            // 暗色模式主要表面（深灰蓝色）/ Dark mode primary surface (dark gray-blue)
                secondary: '#4b5563',                          // 暗色模式次要表面（稍亮的深灰色）/ Dark mode secondary surface (slightly lighter dark gray)
                hover: 'rgba(255, 255, 255, 0.1)',            // 暗色模式悬停背景（淡白色覆盖）/ Dark mode hover background (light white overlay)
            },
        },
        
        // 功能色彩 / Functional Colors
        functional: {
            primary: {
                main: '#8952f1',                               // 品牌主色（紫色，应用按钮等重要操作）/ Brand primary color (purple, for apply button and important actions)
                hover: '#9a6bf3',                              // 主色悬停状态（稍亮的紫色）/ Primary color hover state (slightly brighter purple)
                light: '#a855f7',                              // 主色浅色版本（用于高亮）/ Light version of primary color (for highlighting)
            },
            success: {
                main: 'rgb(34, 197, 94)',                     // 成功颜色（绿色，成功提示）/ Success color (green, for success messages)
                light: 'rgba(34, 197, 94, 0.1)',              // 成功颜色浅色背景（淡绿色背景）/ Light success background (light green background)
                dark: 'rgb(74, 222, 128)',                    // 成功颜色深色版本（暗色模式用）/ Dark version of success color (for dark mode)
            },
            danger: {
                main: 'rgb(239, 68, 68)',                     // 危险颜色（红色，删除按钮、错误提示）/ Danger color (red, for delete buttons and error messages)
                light: 'rgba(239, 68, 68, 0.1)',              // 危险颜色浅色背景（淡红色背景）/ Light danger background (light red background)
                dark: 'rgb(248, 113, 113)',                   // 危险颜色深色版本（暗色模式用）/ Dark version of danger color (for dark mode)
            },
            focus: {
                main: 'rgb(59, 130, 246)',                    // 焦点颜色（蓝色，输入框获得焦点时）/ Focus color (blue, when input fields are focused)
                light: 'rgba(59, 130, 246, 0.1)',             // 焦点颜色浅色背景（淡蓝色背景）/ Light focus background (light blue background)
                border: 'rgba(59, 130, 246, 0.2)',            // 焦点边框颜色（半透明蓝色边框）/ Focus border color (semi-transparent blue border)
                strong: 'rgba(59, 130, 246, 0.3)',            // 强调焦点颜色（更明显的蓝色）/ Strong focus color (more prominent blue)
                dark: 'rgb(96, 165, 250)',                    // 焦点颜色深色版本（暗色模式用）/ Dark version of focus color (for dark mode)
            },
        },
        
        // 组件专用色彩 / Component Specific Colors
        component: {
            placeholder: {
                light: '#A0A0A0',                              // 亮色模式占位符文字（中等灰色）/ Light mode placeholder text (medium gray)
                dark: '#9CA3AF',                               // 暗色模式占位符文字（稍亮的灰色）/ Dark mode placeholder text (slightly brighter gray)
            },
            icon: {
                light: '#000000',                              // 亮色模式图标颜色（黑色）/ Light mode icon color (black)
                dark: '#ffffff',                               // 暗色模式图标颜色（白色）/ Dark mode icon color (white)
                disabled: 'rgb(156, 163, 175)',               // 禁用状态图标颜色（灰色，表示不可点击）/ Disabled state icon color (gray, indicates not clickable)
            },
        },
    },

    // Panel 主体配置 / Panel Main Configuration
    panel: {
        backgroundOpacity: 0.6,                                // 背景透明度 60%（40%透明，60%不透明）/ Background opacity 60% (40% transparent, 60% opaque)
        borderOpacity: 0.4,                                   // 边框透明度 40%（边框较淡）/ Border opacity 40% (border is quite faint)
        blur: '30px',                                         // 背景模糊 30px（强磨砂玻璃效果）/ Background blur 30px (strong frosted glass effect)
        saturation: '200%',                                   // 饱和度 200%（色彩鲜艳度翻倍）/ Saturation 200% (color vibrancy doubled)
        contrast: '1.1',                                      // 对比度 1.1（稍微增强对比度）/ Contrast 1.1 (slightly enhanced contrast)
        width: '320px',                                       // 面板宽度 320px（中等宽度）/ Panel width 320px (medium width)
        borderRadius: '12px',                                 // 圆角 12px（适中的圆角）/ Border radius 12px (moderate rounded corners)
        shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',     // 阴影效果（较深的投影，增强立体感）/ Shadow effect (deep drop shadow, enhances depth)
        padding: '16px',                                      // 内边距 16px（舒适的内容间距）/ Padding 16px (comfortable content spacing)
        position: {
            right: '96px',                                    // 距离右边屏幕边缘 96px / 96px from right screen edge
            bottom: '96px',                                   // 距离底部屏幕边缘 96px / 96px from bottom screen edge
        },
    },
    
    // 文本框配置 / Textarea Configuration
    textarea: {
        backgroundOpacity: 0.5,                               // 输入框背景透明度 50%（半透明玻璃效果）/ Input box background opacity 50% (semi-transparent glass effect)
        blur: '20px',                                         // 输入框背景模糊 20px（中等磨砂效果）/ Input box background blur 20px (medium frosted effect)
        saturation: '170%',                                   // 输入框饱和度 170%（色彩较鲜艳）/ Input box saturation 170% (quite vibrant colors)
        contrast: '1.08',                                     // 输入框对比度 1.08（轻微增强文字清晰度）/ Input box contrast 1.08 (slightly enhanced text clarity)
        borderRadius: '27px',                                 // 输入框圆角 27px（很圆润的外观）/ Input box border radius 27px (very rounded appearance)
        padding: '16px 20px 48px 20px',                      // 输入框内边距（上16px 右20px 下48px 左20px，下方留空给应用按钮）/ Input box padding (top 16px, right 20px, bottom 48px, left 20px, bottom space for apply button)
    },
    
    // 提示框配置 / Tooltip Configuration
    tooltip: {
        backgroundOpacity: 0.7,                               // 提示框背景透明度 70%（较不透明，确保可读性）/ Tooltip background opacity 70% (less transparent, ensures readability)
        blur: '18px',                                         // 提示框背景模糊 18px（轻微磨砂效果）/ Tooltip background blur 18px (light frosted effect)
        saturation: '170%',                                   // 提示框饱和度 170%（与输入框一致）/ Tooltip saturation 170% (consistent with input box)
        contrast: '1.08',                                     // 提示框对比度 1.08（轻微增强文字清晰度）/ Tooltip contrast 1.08 (slightly enhanced text clarity)
        fontSize: '11px',                                     // 提示框字体大小 11px（小而精致的提示文字）/ Tooltip font size 11px (small and delicate hint text)
    },
    
    // 下拉菜单配置 / Dropdown Configuration
    dropdown: {
        backgroundOpacity: 0.7,                               // 下拉菜单背景透明度 70%（确保菜单内容清晰可读）/ Dropdown menu background opacity 70% (ensures menu content is clearly readable)
        blur: '25px',                                         // 下拉菜单背景模糊 25px（较强磨砂效果）/ Dropdown menu background blur 25px (stronger frosted effect)
        saturation: '190%',                                   // 下拉菜单饱和度 190%（较鲜艳的色彩）/ Dropdown menu saturation 190% (quite vibrant colors)
        contrast: '1.1',                                      // 下拉菜单对比度 1.1（与面板主体一致）/ Dropdown menu contrast 1.1 (consistent with main panel)
        shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',       // 下拉菜单阴影（轻微的悬浮效果）/ Dropdown menu shadow (subtle floating effect)
    },
    
    // 头部配置 / Header Configuration
    header: {
        padding: '12px 16px 8px 16px',                        // 头部内边距（上12px 右16px 下8px 左16px，紧凑的标题区域）/ Header padding (top 12px, right 16px, bottom 8px, left 16px, compact title area)
        fontSize: '15px',                                     // 头部字体大小 15px（适中的标题文字大小）/ Header font size 15px (moderate title text size)
    },
    
    // 按钮配置 / Button Configuration
    button: {
        borderRadius: '6px',                                  // 按钮圆角 6px（轻微圆角，现代感）/ Button border radius 6px (slight rounding, modern feel)
        size: '32px',                                         // 按钮尺寸 32px（宽高都是32px的正方形按钮）/ Button size 32px (32px x 32px square buttons)
    },
    
    // 通用配置 / Common Configuration
    common: {
        fontSize: '14px',                                     // 基础字体大小 14px（面板中大部分文字的标准大小）/ Base font size 14px (standard size for most text in panel)
        iconSize: '20px',                                     // 图标尺寸 20px（按钮上图标的标准大小）/ Icon size 20px (standard size for icons on buttons)
        transitionDuration: '0.2s',                          // 过渡动画时长 0.2秒（颜色变化等动画的速度）/ Transition duration 0.2s (speed of color changes and other animations)
        hoverTransitionDuration: '0.15s',                    // 悬停动画时长 0.15秒（鼠标悬停时的动画速度，稍快）/ Hover transition duration 0.15s (animation speed when mouse hovers, slightly faster)
        tooltipTransitionDuration: '0.1s',                   // 提示框动画时长 0.1秒（提示框出现/消失的速度，很快）/ Tooltip transition duration 0.1s (speed of tooltip appearance/disappearance, very fast)
    },
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
        
        /* 颜色系统 / Color System */
        /* 亮色主题颜色 / Light Theme Colors */
        --color-light-background: ${config.colors.light.background};
        --color-light-text-primary: ${config.colors.light.text.primary};
        --color-light-text-secondary: ${config.colors.light.text.secondary};
        --color-light-text-muted: ${config.colors.light.text.muted};
        --color-light-text-disabled: ${config.colors.light.text.disabled};
        --color-light-border-primary: ${config.colors.light.border.primary};
        --color-light-border-muted: ${config.colors.light.border.muted};
        --color-light-surface-primary: ${config.colors.light.surface.primary};
        --color-light-surface-secondary: ${config.colors.light.surface.secondary};
        --color-light-surface-hover: ${config.colors.light.surface.hover};
        
        /* 暗色主题颜色 / Dark Theme Colors */
        --color-dark-background: ${config.colors.dark.background};
        --color-dark-text-primary: ${config.colors.dark.text.primary};
        --color-dark-text-secondary: ${config.colors.dark.text.secondary};
        --color-dark-text-muted: ${config.colors.dark.text.muted};
        --color-dark-text-disabled: ${config.colors.dark.text.disabled};
        --color-dark-border-primary: ${config.colors.dark.border.primary};
        --color-dark-border-muted: ${config.colors.dark.border.muted};
        --color-dark-surface-primary: ${config.colors.dark.surface.primary};
        --color-dark-surface-secondary: ${config.colors.dark.surface.secondary};
        --color-dark-surface-hover: ${config.colors.dark.surface.hover};
        
        /* 功能色彩 / Functional Colors */
        --color-primary-main: ${config.colors.functional.primary.main};
        --color-primary-hover: ${config.colors.functional.primary.hover};
        --color-primary-light: ${config.colors.functional.primary.light};
        --color-success-main: ${config.colors.functional.success.main};
        --color-success-light: ${config.colors.functional.success.light};
        --color-success-dark: ${config.colors.functional.success.dark};
        --color-danger-main: ${config.colors.functional.danger.main};
        --color-danger-light: ${config.colors.functional.danger.light};
        --color-danger-dark: ${config.colors.functional.danger.dark};
        --color-focus-main: ${config.colors.functional.focus.main};
        --color-focus-light: ${config.colors.functional.focus.light};
        --color-focus-border: ${config.colors.functional.focus.border};
        --color-focus-strong: ${config.colors.functional.focus.strong};
        --color-focus-dark: ${config.colors.functional.focus.dark};
        
        /* 组件专用颜色 / Component Specific Colors */
        --color-placeholder-light: ${config.colors.component.placeholder.light};
        --color-placeholder-dark: ${config.colors.component.placeholder.dark};
        --color-icon-light: ${config.colors.component.icon.light};
        --color-icon-dark: ${config.colors.component.icon.dark};
        --color-icon-disabled: ${config.colors.component.icon.disabled};
        
        /* 透明度设置 / Opacity Settings */
        --panel-background-opacity: ${config.panel.backgroundOpacity};
        --panel-border-opacity: ${config.panel.borderOpacity};
        --panel-textarea-background-opacity: ${config.textarea.backgroundOpacity};
        --panel-tooltip-background-opacity: ${config.tooltip.backgroundOpacity};
        --panel-dropdown-background-opacity: ${config.dropdown.backgroundOpacity};
        
        /* 模糊效果 / Blur Effects */
        --panel-blur: ${config.panel.blur};
        --panel-textarea-blur: ${config.textarea.blur};
        --panel-tooltip-blur: ${config.tooltip.blur};
        --panel-dropdown-blur: ${config.dropdown.blur};
        
        /* 饱和度和对比度 / Saturation and Contrast */
        --panel-saturation: ${config.panel.saturation};
        --panel-contrast: ${config.panel.contrast};
        --panel-textarea-saturation: ${config.textarea.saturation};
        --panel-textarea-contrast: ${config.textarea.contrast};
        --panel-tooltip-saturation: ${config.tooltip.saturation};
        --panel-tooltip-contrast: ${config.tooltip.contrast};
        --panel-dropdown-saturation: ${config.dropdown.saturation};
        --panel-dropdown-contrast: ${config.dropdown.contrast};
        
        /* 尺寸设置 / Size Settings */
        --panel-width: ${config.panel.width};
        --panel-border-radius: ${config.panel.borderRadius};
        --panel-textarea-border-radius: ${config.textarea.borderRadius};
        --panel-button-border-radius: ${config.button.borderRadius};
        --panel-button-size: ${config.button.size};
        
        /* 阴影设置 / Shadow Settings */
        --panel-shadow: ${config.panel.shadow};
        --panel-dropdown-shadow: ${config.dropdown.shadow};
        
        /* 位置设置 / Position Settings */
        --panel-right: ${config.panel.position.right};
        --panel-bottom: ${config.panel.position.bottom};
        
        /* 间距设置 / Spacing Settings */
        --panel-padding: ${config.panel.padding};
        --panel-textarea-padding: ${config.textarea.padding};
        --panel-header-padding: ${config.header.padding};
        
        /* 字体设置 / Font Settings */
        --panel-font-size: ${config.common.fontSize};
        --panel-header-font-size: ${config.header.fontSize};
        --panel-tooltip-font-size: ${config.tooltip.fontSize};
        --panel-icon-size: ${config.common.iconSize};
        
        /* 动画设置 / Animation Settings */
        --panel-transition-duration: ${config.common.transitionDuration};
        --panel-hover-transition-duration: ${config.common.hoverTransitionDuration};
        --panel-tooltip-transition-duration: ${config.common.tooltipTransitionDuration};
        
        /* 动态颜色变量 / Dynamic Color Variables */
        /* 这些变量会根据主题自动切换 / These variables will switch automatically based on theme */
        --icon-color: var(--color-icon-light);
        --icon-color-disabled: var(--color-icon-disabled);
        --button-bg-hover: var(--color-light-surface-hover);
        --text-primary: var(--color-light-text-primary);
        --text-secondary: var(--color-light-text-secondary);
        --text-muted: var(--color-light-text-muted);
        --border-primary: var(--color-light-border-primary);
        --surface-primary: var(--color-light-surface-primary);
        --surface-secondary: var(--color-light-surface-secondary);
        --button-size: ${config.button.size};
        --button-radius: var(--panel-button-border-radius);
        --icon-size: ${config.common.iconSize};
    `;
}

/**
 * 预设配置
 * Preset Configurations
 * 
 * 这些预设提供了不同的视觉效果组合，可以快速应用到面板上
 * These presets provide different visual effect combinations that can be quickly applied to the panel
 */
export const panelPresets = {
    // 高透明度预设 / High Transparency Preset
    // 效果：面板几乎透明，可以清楚看到背景网页内容
    // Effect: Panel is almost transparent, background webpage content is clearly visible
    highTransparency: {
        panel: {
            backgroundOpacity: 0.3,         // Panel 背景透明度 30%（很透明，背景网页清晰可见）/ Panel background opacity 30% (very transparent, background webpage clearly visible)
            borderOpacity: 0.2,             // 边框透明度 20%（边框几乎看不见）/ Border opacity 20% (border barely visible)
        },
        textarea: {
            backgroundOpacity: 0.3,         // 文本框背景透明度 30%（输入区域也很透明）/ Textarea background opacity 30% (input area also very transparent)
        },
        tooltip: {
            backgroundOpacity: 0.5,         // 提示框背景透明度 50%（提示框稍微明显一些）/ Tooltip background opacity 50% (tooltip slightly more visible)
        },
        dropdown: {
            backgroundOpacity: 0.5,         // 下拉菜单背景透明度 50%（菜单稍微明显一些以确保可读性）/ Dropdown menu background opacity 50% (menu slightly more visible for readability)
        },
    },
    
    // 低透明度预设 / Low Transparency Preset
    // 效果：面板基本不透明，背景内容不会干扰面板使用
    // Effect: Panel is mostly opaque, background content won't interfere with panel usage
    lowTransparency: {
        panel: {
            backgroundOpacity: 0.9,         // Panel 背景透明度 90%（几乎不透明，背景干扰很小）/ Panel background opacity 90% (almost opaque, minimal background interference)
            borderOpacity: 0.6,             // 边框透明度 60%（边框清晰可见）/ Border opacity 60% (border clearly visible)
        },
        textarea: {
            backgroundOpacity: 0.8,         // 文本框背景透明度 80%（输入区域清晰，便于阅读）/ Textarea background opacity 80% (input area clear, easy to read)
        },
        tooltip: {
            backgroundOpacity: 0.9,         // 提示框背景透明度 90%（提示框非常清晰）/ Tooltip background opacity 90% (tooltip very clear)
        },
        dropdown: {
            backgroundOpacity: 0.9,         // 下拉菜单背景透明度 90%（菜单非常清晰易读）/ Dropdown menu background opacity 90% (menu very clear and readable)
        },
    },
    
    // 强模糊效果预设 / Strong Blur Effect Preset
    // 效果：强烈的磨砂玻璃效果，背景内容被大幅模糊
    // Effect: Strong frosted glass effect, background content is heavily blurred
    strongBlur: {
        panel: {
            blur: '40px',                   // Panel 模糊效果 40px（很强的模糊，背景几乎看不清细节）/ Panel blur effect 40px (very strong blur, background details barely visible)
        },
        textarea: {
            blur: '30px',                   // 文本框模糊效果 30px（输入框有强烈磨砂感）/ Textarea blur effect 30px (input box has strong frosted feel)
        },
        tooltip: {
            blur: '25px',                   // 提示框模糊效果 25px（提示框有明显磨砂质感）/ Tooltip blur effect 25px (tooltip has obvious frosted texture)
        },
        dropdown: {
            blur: '35px',                   // 下拉菜单模糊效果 35px（菜单有很强的磨砂玻璃感）/ Dropdown menu blur effect 35px (menu has very strong frosted glass feel)
        },
    },
    
    // 弱模糊效果预设 / Weak Blur Effect Preset
    // 效果：轻微的模糊效果，保持背景内容的可见性
    // Effect: Slight blur effect, maintains background content visibility
    weakBlur: {
        panel: {
            blur: '15px',                   // Panel 模糊效果 15px（轻微模糊，背景内容还能看清）/ Panel blur effect 15px (slight blur, background content still visible)
        },
        textarea: {
            blur: '10px',                   // 文本框模糊效果 10px（很轻的磨砂感）/ Textarea blur effect 10px (very light frosted feel)
        },
        tooltip: {
            blur: '8px',                    // 提示框模糊效果 8px（最轻微的模糊）/ Tooltip blur effect 8px (minimal blur)
        },
        dropdown: {
            blur: '12px',                   // 下拉菜单模糊效果 12px（轻微的磨砂感）/ Dropdown menu blur effect 12px (light frosted feel)
        },
    },
    
    // 高饱和度预设 / High Saturation Preset
    // 效果：色彩非常鲜艳，视觉冲击力强
    // Effect: Very vibrant colors, strong visual impact
    highSaturation: {
        panel: {
            saturation: '250%',             // Panel 饱和度 250%（色彩非常鲜艳，视觉效果强烈）/ Panel saturation 250% (very vibrant colors, strong visual effect)
        },
        textarea: {
            saturation: '220%',             // 文本框饱和度 220%（输入框色彩鲜艳）/ Textarea saturation 220% (input box has vibrant colors)
        },
        tooltip: {
            saturation: '220%',             // 提示框饱和度 220%（提示框色彩鲜艳）/ Tooltip saturation 220% (tooltip has vibrant colors)
        },
        dropdown: {
            saturation: '240%',             // 下拉菜单饱和度 240%（菜单色彩非常鲜艳）/ Dropdown menu saturation 240% (menu has very vibrant colors)
        },
    },
    
    // 低饱和度预设 / Low Saturation Preset
    // 效果：色彩较为柔和，视觉舒适
    // Effect: Softer colors, visually comfortable
    lowSaturation: {
        panel: {
            saturation: '150%',             // Panel 饱和度 150%（色彩适中，不会过于刺眼）/ Panel saturation 150% (moderate colors, not too bright)
        },
        textarea: {
            saturation: '120%',             // 文本框饱和度 120%（输入框色彩柔和）/ Textarea saturation 120% (input box has soft colors)
        },
        tooltip: {
            saturation: '120%',             // 提示框饱和度 120%（提示框色彩柔和）/ Tooltip saturation 120% (tooltip has soft colors)
        },
        dropdown: {
            saturation: '140%',             // 下拉菜单饱和度 140%（菜单色彩适中）/ Dropdown menu saturation 140% (menu has moderate colors)
        },
    },
    
    // 紧凑布局预设 / Compact Layout Preset
    // 效果：面板尺寸较小，适合小屏幕或希望节省空间的场景
    // Effect: Smaller panel size, suitable for small screens or space-saving scenarios
    compact: {
        panel: {
            width: '280px',                 // Panel 宽度 280px（比默认窄，节省屏幕空间）/ Panel width 280px (narrower than default, saves screen space)
            padding: '12px',                // Panel 内边距 12px（更紧凑的间距）/ Panel padding 12px (more compact spacing)
        },
        textarea: {
            padding: '12px 16px 40px 16px', // 文本框内边距（更小的内边距，节省空间）/ Textarea padding (smaller padding, saves space)
        },
        header: {
            padding: '8px 12px 6px 12px',   // 头部内边距（更紧凑的头部区域）/ Header padding (more compact header area)
            fontSize: '14px',               // 头部字体大小 14px（稍小的标题文字）/ Header font size 14px (slightly smaller title text)
        },
        common: {
            fontSize: '13px',               // 字体大小 13px（更小的文字，适合紧凑布局）/ Font size 13px (smaller text, suitable for compact layout)
        },
    },
    
    // 宽松布局预设 / Spacious Layout Preset
    // 效果：面板尺寸较大，间距宽松，适合大屏幕或需要舒适阅读体验的场景
    // Effect: Larger panel size, spacious layout, suitable for large screens or comfortable reading experience
    spacious: {
        panel: {
            width: '360px',                 // Panel 宽度 360px（比默认宽，提供更多空间）/ Panel width 360px (wider than default, provides more space)
            padding: '20px',                // Panel 内边距 20px（更宽松的间距）/ Panel padding 20px (more spacious layout)
        },
        textarea: {
            padding: '20px 24px 56px 24px', // 文本框内边距（更大的内边距，舒适的输入体验）/ Textarea padding (larger padding, comfortable input experience)
        },
        header: {
            padding: '16px 20px 12px 20px', // 头部内边距（更宽松的头部区域）/ Header padding (more spacious header area)
            fontSize: '16px',               // 头部字体大小 16px（更大的标题文字）/ Header font size 16px (larger title text)
        },
        common: {
            fontSize: '15px',               // 字体大小 15px（更大的文字，便于阅读）/ Font size 15px (larger text, easier to read)
        },
    },
};

/**
 * 深度合并配置对象
 * Deep merge configuration objects
 * @param target 目标对象 / Target object
 * @param source 源对象 / Source object
 * @returns 合并后的对象 / Merged object
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] !== undefined) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // 如果是对象且不是数组，则递归合并
                (result as any)[key] = deepMerge((target as any)[key] || {}, source[key] as any);
            } else {
                // 否则直接赋值
                (result as any)[key] = source[key];
            }
        }
    }
    
    return result;
}

/**
 * 应用预设配置
 * Apply preset configuration
 * @param presetName 预设名称 / Preset name
 */
export function applyPanelPreset(presetName: keyof typeof panelPresets): void {
    const preset = panelPresets[presetName];
    currentPanelConfig = deepMerge(currentPanelConfig, preset as Partial<PanelStyleConfig>);
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