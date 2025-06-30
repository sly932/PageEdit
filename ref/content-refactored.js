/**
 * HolyTrick Browser Extension - Content Script
 * 这是一个浏览器扩展的内容脚本，用于在网页中注入UI界面和执行脚本
 * 
 * 主要功能：
 * 1. 在网页中注入聊天界面
 * 2. 执行用户自定义脚本
 * 3. 与background script通信
 * 4. 管理本地存储
 */

(function() {
    "use strict";

    // ============================================================================
    // 工具函数和辅助方法
    // ============================================================================

    /**
     * 定义对象属性的工具函数
     */
    const defineProperty = Object.defineProperty;
    
    /**
     * 抛出类型错误的工具函数
     */
    const throwTypeError = (message) => {
        throw TypeError(message);
    };

    /**
     * 安全地定义对象属性
     */
    const safeDefineProperty = (obj, key, value) => {
        if (key in obj) {
            defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        } else {
            obj[key] = value;
        }
    };

    /**
     * 设置对象属性（支持符号键）
     */
    const setProperty = (obj, key, value) => {
        safeDefineProperty(obj, typeof key !== "symbol" ? key + "" : key, value);
    };

    /**
     * 检查私有字段访问权限
     */
    const checkPrivateField = (obj, privateMap, action) => {
        if (!privateMap.has(obj)) {
            throwTypeError("Cannot " + action);
        }
    };

    /**
     * 获取私有字段值
     */
    const getPrivateField = (obj, privateMap, getter) => {
        checkPrivateField(obj, privateMap, "read from private field");
        return getter ? getter.call(obj) : privateMap.get(obj);
    };

    /**
     * 设置私有字段值
     */
    const setPrivateField = (obj, privateMap, value, setter) => {
        checkPrivateField(obj, privateMap, "write to private field");
        if (setter) {
            setter.call(obj, value);
        } else {
            privateMap.set(obj, value);
        }
        return value;
    };

    /**
     * 访问私有方法
     */
    const accessPrivateMethod = (obj, privateMap, method) => {
        checkPrivateField(obj, privateMap, "access private method");
        return method;
    };

    // ============================================================================
    // 全局变量声明
    // ============================================================================
    
    // 私有字段映射
    let privateFieldMap1, privateFieldMap2, privateFieldMap3, privateFieldMap4, privateFieldMap5, privateFieldMap6;

    /**
     * 身份函数 - 直接返回输入值
     */
    function identity(value) {
        return value;
    }

    /**
     * 获取全局对象
     */
    const globalObject = typeof globalThis !== "undefined" ? globalThis : 
                        typeof window !== "undefined" ? window : 
                        typeof global !== "undefined" ? global : 
                        typeof self !== "undefined" ? self : {};

    /**
     * 获取ES模块的默认导出
     */
    function getDefaultExport(module) {
        return module && module.__esModule && Object.prototype.hasOwnProperty.call(module, "default") 
               ? module.default 
               : module;
    }

    // ============================================================================
    // 异步操作和Promise处理
    // ============================================================================

    /**
     * 异步生成器包装器
     */
    const asyncGeneratorWrapper = function(thisArg, args, PromiseClass, generatorFunction) {
        function resolvePromise(value) {
            return value instanceof PromiseClass ? value : new PromiseClass(function(resolve) {
                resolve(value);
            });
        }

        return new (PromiseClass || Promise)(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (error) {
                    reject(error);
                }
            }

            function rejected(value) {
                try {
                    step(generator.throw(value));
                } catch (error) {
                    reject(error);
                }
            }

            function step(result) {
                result.done ? resolve(result.value) : resolvePromise(result.value).then(fulfilled, rejected);
            }

            step((generator = generatorFunction.apply(thisArg, args || [])).next());
        });
    };

    // ============================================================================
    // 信号量控制类
    // ============================================================================

    /**
     * 加权信号量类 - 用于控制并发访问
     */
    class WeightedSemaphore {
        constructor(initialValue, cancelError = new Error("Semaphore cancelled")) {
            this._value = initialValue;
            this._cancelError = cancelError;
            this._queue = [];
            this._weightedWaiters = [];
        }

        /**
         * 获取信号量许可
         * @param {number} weight - 权重
         * @param {number} priority - 优先级
         * @returns {Promise<[number, Function]>} 返回[当前值, 释放函数]
         */
        acquire(weight = 1, priority = 0) {
            if (weight <= 0) {
                throw new Error(`Invalid weight ${weight}: must be positive`);
            }

            return new Promise((resolve, reject) => {
                const item = {
                    resolve,
                    reject,
                    weight,
                    priority
                };

                const insertIndex = this._findInsertIndex(this._queue, item => priority <= item.priority);
                
                if (insertIndex === -1 && weight <= this._value) {
                    this._dispatchItem(item);
                } else {
                    this._queue.splice(insertIndex + 1, 0, item);
                }
            });
        }

        /**
         * 独占运行函数
         */
        runExclusive(task, weight = 1, priority = 0) {
            return asyncGeneratorWrapper(this, arguments, void 0, function* (task, weight = 1, priority = 0) {
                const [value, release] = yield this.acquire(weight, priority);
                try {
                    return yield task(value);
                } finally {
                    release();
                }
            });
        }

        /**
         * 等待解锁
         */
        waitForUnlock(weight = 1, priority = 0) {
            if (weight <= 0) {
                throw new Error(`Invalid weight ${weight}: must be positive`);
            }

            if (this._couldLockImmediately(weight, priority)) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                if (!this._weightedWaiters[weight - 1]) {
                    this._weightedWaiters[weight - 1] = [];
                }
                this._insertByPriority(this._weightedWaiters[weight - 1], {
                    resolve,
                    priority
                });
            });
        }

        /**
         * 检查是否已锁定
         */
        isLocked() {
            return this._value <= 0;
        }

        /**
         * 获取当前值
         */
        getValue() {
            return this._value;
        }

        /**
         * 设置值
         */
        setValue(value) {
            this._value = value;
            this._dispatchQueue();
        }

        /**
         * 释放许可
         */
        release(weight = 1) {
            if (weight <= 0) {
                throw new Error(`Invalid weight ${weight}: must be positive`);
            }
            this._value += weight;
            this._dispatchQueue();
        }

        /**
         * 取消所有等待的操作
         */
        cancel() {
            this._queue.forEach(item => item.reject(this._cancelError));
            this._queue = [];
        }

        /**
         * 分发队列中的项目
         */
        _dispatchQueue() {
            for (this._drainUnlockWaiters(); 
                 this._queue.length > 0 && this._queue[0].weight <= this._value;) {
                this._dispatchItem(this._queue.shift());
                this._drainUnlockWaiters();
            }
        }

        /**
         * 分发单个项目
         */
        _dispatchItem(item) {
            const value = this._value;
            this._value -= item.weight;
            item.resolve([value, this._newReleaser(item.weight)]);
        }

        /**
         * 创建新的释放函数
         */
        _newReleaser(weight) {
            let released = false;
            return () => {
                if (!released) {
                    released = true;
                    this.release(weight);
                }
            };
        }

        /**
         * 清空解锁等待者
         */
        _drainUnlockWaiters() {
            if (this._queue.length === 0) {
                for (let i = this._value; i > 0; i--) {
                    const waiters = this._weightedWaiters[i - 1];
                    if (waiters) {
                        waiters.forEach(waiter => waiter.resolve());
                        this._weightedWaiters[i - 1] = [];
                    }
                }
            } else {
                const topPriority = this._queue[0].priority;
                for (let i = this._value; i > 0; i--) {
                    const waiters = this._weightedWaiters[i - 1];
                    if (!waiters) continue;

                    const index = waiters.findIndex(waiter => waiter.priority <= topPriority);
                    const toResolve = index === -1 ? waiters : waiters.splice(0, index);
                    toResolve.forEach(waiter => waiter.resolve());
                }
            }
        }

        /**
         * 检查是否可以立即锁定
         */
        _couldLockImmediately(weight, priority) {
            return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
        }

        /**
         * 按优先级插入项目
         */
        _insertByPriority(array, item) {
            const index = this._findInsertIndex(array, element => item.priority <= element.priority);
            array.splice(index + 1, 0, item);
        }

        /**
         * 查找插入位置
         */
        _findInsertIndex(array, predicate) {
            for (let i = array.length - 1; i >= 0; i--) {
                if (predicate(array[i])) {
                    return i;
                }
            }
            return -1;
        }
    }

    /**
     * 简单信号量类 - 基于加权信号量的简化版本
     */
    class SimpleSemaphore {
        constructor(cancelError) {
            this._semaphore = new WeightedSemaphore(1, cancelError);
        }

        /**
         * 获取许可
         */
        acquire(priority = 0) {
            return asyncGeneratorWrapper(this, arguments, void 0, function* (priority = 0) {
                const [, release] = yield this._semaphore.acquire(1, priority);
                return release;
            });
        }

        /**
         * 独占运行
         */
        runExclusive(task, priority = 0) {
            return this._semaphore.runExclusive(() => task(), 1, priority);
        }

        /**
         * 检查是否锁定
         */
        isLocked() {
            return this._semaphore.isLocked();
        }

        /**
         * 等待解锁
         */
        waitForUnlock(priority = 0) {
            return this._semaphore.waitForUnlock(1, priority);
        }

        /**
         * 释放
         */
        release() {
            if (this._semaphore.isLocked()) {
                this._semaphore.release();
            }
        }

        /**
         * 取消
         */
        cancel() {
            return this._semaphore.cancel();
        }
    }

    // ============================================================================
    // 存储管理模块
    // ============================================================================

    /**
     * 存储管理器
     */
    const storageManager = createStorageManager();

    function createStorageManager() {
        // 存储区域配置
        const storageAreas = {
            local: createStorageDriver("local"),
            session: createStorageDriver("session"),
            sync: createStorageDriver("sync"),
            managed: createStorageDriver("managed")
        };

        /**
         * 获取存储区域
         */
        const getStorageArea = (areaName) => {
            const area = storageAreas[areaName];
            if (area == null) {
                const availableAreas = Object.keys(storageAreas).join(", ");
                throw Error(`Invalid area "${areaName}". Options: ${availableAreas}`);
            }
            return area;
        };

        /**
         * 解析存储键
         */
        const parseStorageKey = (key) => {
            const colonIndex = key.indexOf(":");
            const areaName = key.substring(0, colonIndex);
            const actualKey = key.substring(colonIndex + 1);
            
            if (actualKey == null) {
                throw Error(`Storage key should be in the form of "area:key", but received "${key}"`);
            }
            
            return {
                driverArea: areaName,
                driverKey: actualKey,
                driver: getStorageArea(areaName)
            };
        };

        /**
         * 创建元数据键
         */
        const createMetaKey = (key) => key + "$";

        /**
         * 获取值或默认值
         */
        const getValueOrDefault = (value, fallback, defaultValue) => {
            return value ?? fallback ?? null;
        };

        /**
         * 确保对象类型
         */
        const ensureObject = (value) => {
            return typeof value === "object" && !Array.isArray(value) ? value : {};
        };

        /**
         * 获取存储项
         */
        const getItem = async (driver, key, options) => {
            const value = await driver.getItem(key);
            return getValueOrDefault(value, options?.fallback, options?.defaultValue);
        };

        /**
         * 获取元数据
         */
        const getMeta = async (driver, key) => {
            const metaKey = createMetaKey(key);
            const meta = await driver.getItem(metaKey);
            return ensureObject(meta);
        };

        /**
         * 设置存储项
         */
        const setItem = async (driver, key, value) => {
            await driver.setItem(key, value ?? null);
        };

        /**
         * 更新存储项
         */
        const updateItem = async (driver, key, updates) => {
            const metaKey = createMetaKey(key);
            const meta = {
                ...ensureObject(await driver.getItem(metaKey))
            };

            Object.entries(updates).forEach(([updateKey, updateValue]) => {
                if (updateValue == null) {
                    delete meta[updateKey];
                } else {
                    meta[updateKey] = updateValue;
                }
            });

            await driver.setItem(metaKey, meta);
        };

        /**
         * 移除存储项
         */
        const removeItem = async (driver, key, options) => {
            await driver.removeItem(key);
            if (options?.removeMeta) {
                const metaKey = createMetaKey(key);
                await driver.removeItem(metaKey);
            }
        };

        return {
            /**
             * 获取存储项
             */
            async getItem(key, options = {}) {
                const { driver, driverKey } = parseStorageKey(key);
                return await getItem(driver, driverKey, options);
            },

            /**
             * 设置存储项
             */
            async setItem(key, value) {
                const { driver, driverKey } = parseStorageKey(key);
                await setItem(driver, driverKey, value);
            },

            /**
             * 移除存储项
             */
            async removeItem(key, options = {}) {
                const { driver, driverKey } = parseStorageKey(key);
                await removeItem(driver, driverKey, options);
            },

            /**
             * 更新存储项
             */
            async updateItem(key, updates) {
                const { driver, driverKey } = parseStorageKey(key);
                await updateItem(driver, driverKey, updates);
            }
        };
    }

    /**
     * 创建存储驱动
     */
    function createStorageDriver(areaName) {
        // 这里会实现具体的存储驱动
        // 由于原代码很长，这里只展示接口
        return {
            async getItem(key) {
                // 实现获取存储项的逻辑
                return null;
            },
            async setItem(key, value) {
                // 实现设置存储项的逻辑
            },
            async removeItem(key) {
                // 实现移除存储项的逻辑
            }
        };
    }

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
            // 这里会初始化i18next库
            // 由于原代码使用了压缩的i18next，这里只展示接口
            const currentLanguage = localStorage.getItem("language") || navigator.language.split("-")[0] || "en";
            
            // 模拟i18next初始化
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

    // 初始化国际化
    i18nManager.init();

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
            // 这里会创建具体的UI组件
            // 由于原代码使用了React，这里只展示接口
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
            // 检查是否在HolyTrick网站或开发模式
            const isHolyTrickSite = window.location.host.includes("holytrick.com");
            const isDevelopmentMode = false; // 这里应该从配置中获取

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
                        // 处理测试代码
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
                // 这里会刷新UI组件
                console.log("Refreshing UI after script save");
            } else {
                isUIVisible = true;
                // 这里会挂载UI组件
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
    // 浏览器扩展API兼容性处理
    // ============================================================================

    /**
     * 浏览器扩展API模块
     */
    const browserExtensionAPI = {
        exports: {}
    };

    (function(module, exports) {
        (function(global, callback) {
            callback(global);
        })(typeof globalThis !== "undefined" ? globalThis : 
                typeof self !== "undefined" ? self : globalObject, function(global) {
            
            // 检查是否在浏览器扩展环境中
            if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) {
                throw new Error("This script should only be loaded in a browser extension.");
            }

            // 优先使用Firefox的browser API，否则使用Chrome API
            if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id) {
                global.exports = globalThis.browser;
            } else {
                // Chrome API兼容性处理
                const messagePortClosedError = "The message port closed before a response was received.";
                
                const createChromeAPI = (apiName) => {
                    const apiConfig = {
                        // 闹钟API配置
                        alarms: {
                            clear: { minArgs: 0, maxArgs: 1 },
                            clearAll: { minArgs: 0, maxArgs: 0 },
                            get: { minArgs: 0, maxArgs: 1 },
                            getAll: { minArgs: 0, maxArgs: 0 }
                        },
                        // 书签API配置
                        bookmarks: {
                            create: { minArgs: 1, maxArgs: 1 },
                            get: { minArgs: 1, maxArgs: 1 },
                            getChildren: { minArgs: 1, maxArgs: 1 },
                            getRecent: { minArgs: 1, maxArgs: 1 },
                            getSubTree: { minArgs: 1, maxArgs: 1 },
                            getTree: { minArgs: 0, maxArgs: 0 },
                            move: { minArgs: 2, maxArgs: 2 },
                            remove: { minArgs: 1, maxArgs: 1 },
                            removeTree: { minArgs: 1, maxArgs: 1 },
                            search: { minArgs: 1, maxArgs: 1 },
                            update: { minArgs: 2, maxArgs: 2 }
                        },
                        // 浏览器操作API配置
                        browserAction: {
                            disable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: true },
                            enable: { minArgs: 0, maxArgs: 1, fallbackToNoCallback: true },
                            getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                            getBadgeText: { minArgs: 1, maxArgs: 1 },
                            getPopup: { minArgs: 1, maxArgs: 1 },
                            getTitle: { minArgs: 1, maxArgs: 1 },
                            openPopup: { minArgs: 0, maxArgs: 0 },
                            setBadgeBackgroundColor: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: true },
                            setBadgeText: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: true },
                            setIcon: { minArgs: 1, maxArgs: 1 },
                            setPopup: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: true },
                            setTitle: { minArgs: 1, maxArgs: 1, fallbackToNoCallback: true }
                        },
                        // 浏览数据API配置
                        browsingData: {
                            remove: { minArgs: 2, maxArgs: 2 },
                            removeCache: { minArgs: 1, maxArgs: 1 },
                            removeCookies: { minArgs: 1, maxArgs: 1 },
                            removeDownloads: { minArgs: 1, maxArgs: 1 },
                            removeFormData: { minArgs: 1, maxArgs: 1 },
                            removeHistory: { minArgs: 1, maxArgs: 1 },
                            removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                            removePasswords: { minArgs: 1, maxArgs: 1 }
                        }
                    };

                    // 这里会继续实现Chrome API的兼容性处理
                    // 由于代码量很大，这里只展示部分结构
                };

                // 创建Chrome API兼容层
                createChromeAPI('chrome');
            }
        });
    })(browserExtensionAPI, browserExtensionAPI.exports);

    // 导出浏览器API
    const browserAPI = browserExtensionAPI.exports;

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
            const { main: mainFunction, ...config } = mainConfig;
            const extensionAPI = { /* 这里会创建扩展API实例 */ };
            return await mainFunction(extensionAPI);
        } catch (error) {
            throw logger.error('The content script "ui" crashed on startup!', error);
        }
    })();

    console.log("HolyTrick Content Script - 重构版本已加载 (第3部分)");

})(); 