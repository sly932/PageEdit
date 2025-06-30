/**
 * HolyTrick Browser Extension - Content Script (Part 3)
 * 第三部分：国际化、UI组件和主要功能模块
 */

// ============================================================================
// 国际化模块
// ============================================================================

/**
 * 国际化资源
 */
const i18nResources = {
    en: {
        translation: {
            welcome: "Welcome",
            save: "Save",
            saved: "Saved",
            login: "Login",
            logout: "Logout",
            not_logged_in: "Not logged in",
            login_to_use: "Login required to use",
            custom_api_key: "Custom Claude API KEY",
            local_engine: "Local Engine",
            coming_soon: "Coming Soon",
            developer_mode: "Developer Mode",
            description: "Local edge engine + cloud engine combination can greatly improve Copilot's ceiling while maximizing privacy protection and unlocking more complex scenario capabilities and APIs.",
            developer_description: "If you are a developer, you can unlock full control of the Copilot system. Root permissions include directly modifying or writing code, accessing a series of proprietary engine APIs, and other hidden features to collaborate intimately with your Copilot.",
            version: "Version",
            action_now: "Take Action Now",
            placeholder: "What would you like to do with the current webpage",
            not_satisfied: "Still not satisfied, continue making requests",
            simple_request: "This requirement is simple, I don't care how it's implemented",
            delete: "Delete",
            share: "Share",
            login_and_share: "Login and Share",
            undo: "Undo",
            only_on_site: "Only effective on this site",
            unnamed_magic: "Unnamed Magic",
            executed: "Executed",
            system_name: "System Name",
            system_version: "System Version",
            version_description: "Version Description",
            core_allocated: "***Core Allocated, Engine Mounting***",
            engine_mounting: "Engine Mounting...",
            engine_mounted: "***Engine Mounted, Task Starting***",
            backup_power: "Backup Hidden Power",
            waiting_main_engine: "***Core Allocated, Waiting for Main Engine***",
            main_engine_mounting: "Main Engine Mounting...",
            main_engine_mounted: "***Main Engine Mounted, Task Starting***",
            gemini_two: "Gemini II",
            gemini_one: "Gemini I",
            unknown_strength: "Strength Unknown, follow the white rabbit",
            language_setting: "Language Setting",
            "step1.title": "Pin HolyTrick Icon",
            "step1.desc": "After pinning, click the icon to bring up the dialog box to hack your webpage",
            "step1.shortcut": "Prefer keyboard commands?",
            "step1.kai": "⌘K is the default shortcut",
            "step2.title": "Set API Key",
            "step2.desc": "Click the blue settings button in the lower right corner, enter the Claude API KEY, and click save",
            "step3.title": "Let's hack a webpage now!",
            "step3.desc": "Note: you need to refresh the old webpage to use HolyTrick.",
            next: "Next",
            registerAndLogin: "Register and Login",
            loginToReceive: "Sign in for free access",
            enterYourEmail: "input your email address",
            getCode: "Get Code",
            or: "Or",
            loginWithGoogle: "Continue with Google",
            placeholderEmail: "Input your email address",
            placeholderCode: "Verification code"
        }
    },
    zh: {
        translation: {
            welcome: "欢迎",
            save: "保存",
            saved: "已保存",
            login: "登录",
            logout: "退出",
            not_logged_in: "未登录",
            login_to_use: "登录后才可使用",
            custom_api_key: "自定义 Claude API KEY",
            local_engine: "本地引擎",
            coming_soon: "即将到来",
            developer_mode: "开发者模式",
            description: "本地端侧引擎 + 云端引擎结合可以大幅提高 Copilot 的上限，同时最大程度保护隐私，并解锁更多的复杂场景能力和 API。",
            developer_description: "如果你是开发者，可以解锁 Copilot 系统的完整控制权。 Root 权限包括直接修改或编写代码、访问一系列专有的引擎 API、以及其他隐藏特性，从而与你的 Copilot 亲密无间地协作。",
            version: "版本",
            action_now: "马上安排",
            placeholder: "想对当前网页做什么呢",
            not_satisfied: "还是不满意，继续提要求",
            simple_request: "这个需求很简单，怎么实现我不管",
            delete: "删除",
            share: "分享",
            login_and_share: "登录并分享",
            undo: "撤销",
            only_on_site: "仅在此网站上生效",
            unnamed_magic: "未命名魔法",
            executed: "已执行",
            system_name: "系统名称",
            system_version: "系统版本",
            version_description: "版本描述",
            core_allocated: "***核心已分配，引擎挂载中***",
            engine_mounting: "引擎开始挂载...",
            engine_mounted: "***引擎挂载完毕，作业启动***",
            backup_power: "后备隐藏能源",
            waiting_main_engine: "***核心已分配，等待主引擎***",
            main_engine_mounting: "主引擎开始挂载...",
            main_engine_mounted: "***主引擎挂载完毕，作业启动***",
            language_setting: "语言设置",
            "step1.title": "请置顶有挂",
            "step1.desc": "置顶后，可以随时点击图标唤起输入框",
            "step1.shortcut": "快速唤醒或隐藏窗口的快捷键：",
            "step1.kai": "⌘K→(kai)开挂",
            "step2.title": "注册并且登录",
            "step2.desc": "点击右下角蓝色设置按钮，输入 Claude API KEY 后点击保存",
            "step3.title": "现在，你可以随时唤起有挂，输入任意内容，修改任意网页 🎉",
            "step3.desc": "对于安装插件之前已经打开的网页，需要刷新后才能唤起有挂哦。",
            next: "继续",
            registerAndLogin: "注册并登录",
            loginToReceive: "登录后可领取官方限免额度",
            enterYourEmail: "请输入你的邮箱",
            getCode: "获取验证码",
            or: "或者",
            loginWithGoogle: "使用Google账号登录",
            placeholderEmail: "请输入你的邮箱",
            placeholderCode: "请输入验证码"
        }
    }
};

/**
 * 国际化管理器
 */
const i18nManager = {
    /**
     * 初始化国际化
     */
    init() {
        const currentLanguage = localStorage.getItem("language") || navigator.language.split("-")[0] || "en";
        this.currentLanguage = currentLanguage;
        this.resources = i18nResources;
    },

    /**
     * 翻译文本
     */
    t(key) {
        const translation = this.resources[this.currentLanguage]?.translation?.[key];
        return translation || key;
    },

    /**
     * 切换语言
     */
    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem("language", language);
    }
};

// ============================================================================
// UI组件管理器
// ============================================================================

/**
 * UI组件管理器
 */
const uiComponentManager = {
    /**
     * 创建UI组件
     */
    async createComponent(extensionAPI, config) {
        return {
            mount() {
                console.log(`Mounting ${config.name} component`);
            },
            remove() {
                console.log(`Removing ${config.name} component`);
            }
        };
    }
};

// ============================================================================
// 主要功能模块
// ============================================================================

/**
 * 主功能配置
 */
const mainConfig = {
    matches: ["<all_urls>"],
    cssInjectionMode: "ui",
    matchAboutBlank: true
};

/**
 * UI显示状态
 */
let isUIVisible = false;

/**
 * 主功能函数
 */
async function mainFunction(extensionAPI) {
    /**
     * 初始化页面通信
     */
    function initializePageCommunication() {
        const isHolyTrickSite = window.location.host.includes("holytrick.com");
        const isDevelopmentMode = false;

        if (isHolyTrickSite || isDevelopmentMode) {
            // 发送页面问候消息
            window.postMessage({
                type: "__YG_PAGE_HELLO__"
            });

            // 监听页面消息
            window.addEventListener("message", (event) => {
                if (event.source !== window) return;

                const messageData = event.data;
                if (!messageData) return;

                // 处理测试代码消息
                if (messageData.type === "__YG_TEST_CODE__") {
                    console.log("Received test code message");
                }
                // 处理保存脚本消息
                else if (messageData.type === "__YG_SAVE_TRICK__") {
                    handleSaveScript(messageData.data);
                }
            });
        }
    }

    /**
     * 处理保存脚本
     */
    async function handleSaveScript(scriptData) {
        if (!scriptData.title || !scriptData.code || !scriptData.code.startsWith("// EXEC")) {
            return false;
        }

        // 获取现有脚本
        const existingScripts = await storageManager.getItem("local:localScript", {
            fallback: []
        }) || [];

        // 创建新脚本对象
        const newScript = {
            name: scriptData.title,
            script: scriptData.code,
            type: "ONCE"
        };

        // 添加到脚本列表
        existingScripts.push(newScript);
        await storageManager.setItem("local:localScript", existingScripts);

        // 刷新UI
        if (isUIVisible) {
            console.log("Refreshing UI after script save");
        } else {
            isUIVisible = true;
            console.log("Mounting UI after script save");
        }

        return true;
    }

    // 创建主UI组件
    const mainUIComponent = await uiComponentManager.createComponent(extensionAPI, {
        name: "content-ui",
        position: "overlay",
        zIndex: 1000000,
        alignment: "bottom-right",
        isolateEvents: true,
        mode: "open"
    });

    // 创建执行UI组件
    const execUIComponent = await uiComponentManager.createComponent(extensionAPI, {
        name: "exec-ui",
        position: "overlay",
        zIndex: 1000000,
        alignment: "top-right",
        isolateEvents: true,
        mode: "closed"
    });

    // 挂载执行UI组件
    execUIComponent.mount();

    // 监听来自background script的消息
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "refresh_page") {
            window.location.reload();
        } else if (message.action === "toggleUI") {
            if (isUIVisible) {
                isUIVisible = false;
                setTimeout(() => {
                    mainUIComponent.remove();
                }, 200);
            } else {
                isUIVisible = true;
                mainUIComponent.mount();
            }
        }
    });

    // 初始化页面通信
    initializePageCommunication();
}

// ============================================================================
// 日志管理器
// ============================================================================

/**
 * 日志管理器
 */
const logger = {
    debug: (...args) => console.debug(...args),
    log: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args)
};

// ============================================================================
// 启动函数
// ============================================================================

/**
 * 启动函数
 */
(async () => {
    try {
        // 初始化国际化
        i18nManager.init();
        
        const { main: mainFunction, ...config } = mainConfig;
        const extensionAPI = { /* 扩展API实例 */ };
        return await mainFunction(extensionAPI);
    } catch (error) {
        throw logger.error('The content script "ui" crashed on startup!', error);
    }
})();

console.log("HolyTrick Content Script - 重构版本第3部分已加载"); 