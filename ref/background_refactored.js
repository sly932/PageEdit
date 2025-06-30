// ========================================
// 浏览器扩展后台脚本 - 详细注释版
// 这个文件是浏览器扩展的核心逻辑，处理所有后台操作
// ========================================

// 原始压缩代码中的变量映射说明：
// s = message (消息对象) - 从content script发来的消息
// t = sender (发送者) - 发送消息的标签页信息
// n = sendResponse (响应函数) - 用于回复消息的函数
// f = apiKey (API密钥) - 用于调用AI服务的密钥
// h = callback/result (回调/结果) - 处理结果的回调函数
// l = error (错误) - 错误信息
// e = executionResult (执行结果) - 代码执行的结果
// q, O, E, L, a = 临时变量 - 用于存储中间值

// 全局变量：存储用户的API密钥
let globalApiKey = "";

// 定义后台脚本的主要逻辑
const backgroundScript = defineBackground(() => {
    // ========================================
    // 1. 初始化阶段 - 设置API密钥
    // ========================================
    
    // 从本地存储中获取API密钥
    storage.getItem("local:apiKey").then(apiKey => {
        globalApiKey = apiKey || ""; // 如果没有找到，设为空字符串
    });
    
    // 监听API密钥的变化，实时更新全局变量
    storage.watch("local:apiKey", newApiKey => {
        globalApiKey = newApiKey || "";
    });
    
    // ========================================
    // 2. 消息监听器 - 处理来自网页的消息
    // ========================================
    
    // 监听来自content script（网页中运行的脚本）的消息
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        
        // ========================================
        // 2.1 处理页面编辑功能请求
        // ========================================
        if (message.action === "ht_send_feature") {
            // 检查是否有标签页信息（安全验证）
            if (!sender.tab) {
                return; // 如果没有标签页信息，直接返回
            }
            
            // 获取API密钥并发送编辑请求
            storage.getItem("local:apiKey").then(apiKey => {
                // 调用HolyTrick API进行页面编辑
                // 这个API可以根据用户的文字描述来修改网页
                sendFeatureRequest(
                    message.data,           // 用户输入的命令（比如"把按钮改成红色"）
                    message.html,           // 当前页面的HTML代码
                    {
                        apiKey: apiKey || globalApiKey || "", // 使用API密钥
                        version: VERSION,                     // 扩展版本号
                        ...message.extra                      // 其他额外参数
                    },
                    
                    // ========================================
                    // 进度回调函数 - 实时返回编辑进度
                    // ========================================
                    progressData => {
                        // 向content script发送进度信息
                        browser.tabs.sendMessage(sender.tab.id, {
                            action: "ht_send_feature_progress", // 动作类型：进度更新
                            finished: false,                    // 还没完成
                            data: progressData                  // 进度数据
                        });
                    },
                    
                    // ========================================
                    // 完成回调函数 - 处理编辑结果
                    // ========================================
                    async finalResult => {
                        // 发送分析事件，记录用户使用了编辑功能
                        sendAnalytics("SEND_FEATURE");
                        console.log("编辑完成", finalResult);
                        
                        // 通知content script编辑已完成
                        await browser.tabs.sendMessage(sender.tab.id, {
                            action: "ht_send_feature_progress", // 动作类型：进度更新
                            finished: true,                     // 已完成
                            data: finalResult                   // 最终结果
                        });
                        
                        // ========================================
                        // 处理编辑结果 - 可能需要执行代码
                        // ========================================
                        try {
                            // 检查结果中是否包含需要执行的代码
                            // "// EXEC" 是特殊标记，表示后面跟着要执行的JavaScript代码
                            if (finalResult && finalResult.includes("// EXEC")) {
                                // 提取需要执行的代码部分
                                const execCode = finalResult.substring(finalResult.indexOf("// EXEC"));
                                
                                // 在网页中执行这段代码
                                const executionResult = await executeScript(sender.tab.id, execCode);
                                
                                // 将执行结果发送回content script
                                await browser.tabs.sendMessage(sender.tab.id, {
                                    action: "ht_send_feature_finished", // 动作类型：功能完成
                                    data: executionResult?.result?.value, // 执行结果
                                    code: execCode                       // 执行的代码
                                });
                                
                                // 发送分析事件，记录代码执行是否成功
                                if (executionResult?.result?.value?.success) {
                                    sendAnalytics("EXEC_CODE_SUCCESS"); // 执行成功
                                } else {
                                    sendAnalytics("EXEC_CODE_FAILED");  // 执行失败
                                }
                            } else {
                                // 如果没有需要执行的代码，发送错误信息
                                await browser.tabs.sendMessage(sender.tab.id, {
                                    action: "ht_send_feature_finished",
                                    data: {
                                        success: false, // 操作失败
                                        message: finalResult.replace("REJECTED: ", "") // 错误信息
                                    }
                                });
                            }
                        } catch (error) {
                            // ========================================
                            // 错误处理 - 如果执行代码时出错
                            // ========================================
                            console.error("执行代码时出错:", error);
                            
                            // 发送执行失败的分析事件
                            sendAnalytics("EXEC_CODE_FAILED", {
                                error: typeof error === "object" ? JSON.stringify(error) : error
                            });
                            
                            // 向用户显示错误信息
                            await browser.tabs.sendMessage(sender.tab.id, {
                                action: "ht_send_feature_finished",
                                data: {
                                    success: false,
                                    message: typeof error === "object" ? JSON.stringify(error) : error
                                }
                            });
                        }
                    },
                    
                    // ========================================
                    // 错误回调函数 - 如果API调用失败
                    // ========================================
                    errorMessage => {
                        // 向content script发送错误信息
                        browser.tabs.sendMessage(sender.tab.id, {
                            action: "ht_send_feature_finished",
                            data: {
                                message: errorMessage, // 错误信息
                                success: false         // 操作失败
                            }
                        });
                    }
                );
                
                // 立即回复，表示消息已收到
                sendResponse({ action: "hello" });
            });
            
            return true; // 保持消息通道开放，允许异步回复
        }
        
        // ========================================
        // 2.2 关闭UI界面
        // ========================================
        if (message.action === "trigger_close_ui") {
            // 向content script发送关闭UI的消息
            browser.tabs.sendMessage(sender.tab?.id, {
                action: "toggleUI" // 切换UI显示状态
            });
        }
        
        // ========================================
        // 2.3 触发脚本执行
        // ========================================
        else if (message.action === "ht_trigger_script") {
            // 检查是否有要执行的脚本
            if (!message.data || !message.data.length) {
                return; // 如果没有脚本，直接返回
            }
            
            // 过滤出需要执行的代码（以"// EXEC"开头的脚本）
            const execScripts = message.data.filter(script => script.startsWith("// EXEC"));
            
            // 执行所有脚本
            executeScript(sender.tab.id, execScripts).then(async results => {
                // 逐个发送执行结果，每个间隔300毫秒
                results.forEach(async (result, index) => {
                    setTimeout(() => {
                        // 发送执行结果
                        browser.tabs.sendMessage(sender.tab.id, {
                            action: "ht_send_feature_finished",
                            data: result?.result?.value
                        });
                        
                        // 记录执行成功或失败
                        if (result?.result?.value?.success) {
                            sendAnalytics("EXEC_CODE_SUCCESS");
                        } else {
                            sendAnalytics("EXEC_CODE_FAILED");
                        }
                    }, (index + 1) * 300); // 延迟发送，避免消息冲突
                });
            });
        }
        
        // ========================================
        // 2.4 用户登录功能
        // ========================================
        else if (message.action === "signIn") {
            // 创建登录页面的URL
            const loginUrl = browser.runtime.getURL("welcome.html?step=2&closeOnLogin=true");
            
            // 打开登录页面
            browser.tabs.create({
                url: loginUrl,
                active: true // 设为活动标签页
            });
            
            // 回复登录请求已处理
            sendResponse({ success: true });
            return true;
        }
        
        // ========================================
        // 2.5 用户登出功能
        // ========================================
        else if (message.action === "signOut") {
            // 从本地存储中删除认证令牌
            browser.storage.local.remove("authToken").then(() => {
                sendResponse({ success: true });
            });
            return true;
        }
        
        // ========================================
        // 2.6 检查登录状态
        // ========================================
        else if (message.action === "isLogin") {
            // 获取用户账户信息
            const userInfo = await getUserAccount();
            
            // 准备回复数据
            const response = {
                isLogin: !!userInfo, // 转换为布尔值
                userInfo: userInfo   // 用户信息
            };
            
            // 发送回复
            sendResponse(response);
            return response;
        }
        
        // ========================================
        // 2.7 生成分享链接
        // ========================================
        else if (message.action === "generateShareUrl") {
            // 调用API生成分享链接
            generateShareUrl(message.data).then(url => {
                sendResponse({ url: url });
            }).catch(error => {
                // 如果生成失败，记录错误并返回null
                console.error("生成分享链接失败:", error);
                sendResponse({ url: null });
            });
            return true;
        }
    });
    
    // ========================================
    // 3. 快捷键监听器
    // ========================================
    
    // 监听键盘快捷键
    browser.commands.onCommand.addListener(command => {
        // 如果按下的是"toggle-feature"快捷键
        if (command === "toggle-feature") {
            // 查询当前活动的标签页
            browser.tabs.query({
                active: true,        // 当前活动的标签页
                currentWindow: true  // 当前窗口
            }).then(tabs => {
                console.log("当前标签页:", tabs);
                const currentTab = tabs?.[0]; // 获取第一个（应该是唯一的）标签页
                
                // 如果找到了标签页，发送切换UI的消息
                if (currentTab?.id) {
                    browser.tabs.sendMessage(currentTab.id, {
                        action: "toggleUI"
                    });
                }
            });
        }
    });
    
    // ========================================
    // 4. 扩展图标点击监听器
    // ========================================
    
    // 当用户点击扩展图标时
    browser.action.onClicked.addListener(tab => {
        // 如果标签页存在，发送切换UI的消息
        if (tab.id) {
            browser.tabs.sendMessage(tab.id, {
                action: "toggleUI"
            });
        }
    });
    
    // ========================================
    // 5. 扩展安装/更新监听器
    // ========================================
    
    // 当扩展被安装或更新时
    browser.runtime.onInstalled.addListener(async installInfo => {
        try {
            if (installInfo.reason === "install") {
                // ========================================
                // 5.1 新安装处理
                // ========================================
                
                // 发送新安装的分析事件
                await sendAnalytics("new_install");
                
                // 创建欢迎页面的URL
                const welcomeUrl = browser.runtime.getURL("welcome.html");
                
                // 打开欢迎页面
                await browser.tabs.create({
                    url: welcomeUrl,
                    active: true
                });
                
            } else if (installInfo.reason === "update") {
                // ========================================
                // 5.2 更新处理
                // ========================================
                
                // 发送扩展更新的分析事件
                await sendAnalytics("extension_update");
            }
        } catch (error) {
            // 如果处理安装事件时出错，记录错误
            console.error("处理安装事件时出错:", error);
        }
    });
});

// ========================================
// 6. 工具函数
// ========================================

// 空函数 - 用于控制日志输出
// 在生产环境中，这个函数什么都不做，减少控制台输出
function noop(message, ...args) {}

// 日志工具对象
const logger = {
    debug: (...args) => noop(console.debug, ...args), // 调试信息
    log: (...args) => noop(console.log, ...args),     // 一般日志
    warn: (...args) => noop(console.warn, ...args),   // 警告信息
    error: (...args) => noop(console.error, ...args)  // 错误信息
};

// ========================================
// 7. 启动后台脚本
// ========================================

// 存储后台脚本实例
let backgroundInstance;

try {
    // 启动后台脚本
    backgroundInstance = backgroundScript.main();
    
    // 检查main函数是否返回了Promise（不应该这样）
    if (backgroundInstance instanceof Promise) {
        console.warn("后台脚本的main()函数返回了Promise，但必须是同步的");
    }
} catch (error) {
    // 如果启动时出错，记录错误并抛出异常
    throw logger.error("后台脚本启动时崩溃!");
    error;
}

// 返回后台脚本实例
return backgroundInstance; 