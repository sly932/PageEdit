var background = function() {
    "use strict";
    var xe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
    function De(s) {
        return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s
    }
    var ye = {
        exports: {}
    };
    (function(s, t) {
        (function(n, o) {
            o(s)
        }
        )(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : xe, function(n) {
            if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id))
                throw new Error("This script should only be loaded in a browser extension.");
            if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)
                n.exports = globalThis.browser;
            else {
                const o = "The message port closed before a response was received."
                  , v = w => {
                    const f = {
                        alarms: {
                            clear: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            clearAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            get: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            getAll: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        bookmarks: {
                            create: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            get: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getChildren: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getRecent: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getSubTree: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getTree: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            move: {
                                minArgs: 2,
                                maxArgs: 2
                            },
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeTree: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            search: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            update: {
                                minArgs: 2,
                                maxArgs: 2
                            }
                        },
                        browserAction: {
                            disable: {
                                minArgs: 0,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            enable: {
                                minArgs: 0,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            getBadgeBackgroundColor: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getBadgeText: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getPopup: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getTitle: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            openPopup: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            setBadgeBackgroundColor: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            setBadgeText: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            setIcon: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            setPopup: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            setTitle: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            }
                        },
                        browsingData: {
                            remove: {
                                minArgs: 2,
                                maxArgs: 2
                            },
                            removeCache: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeCookies: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeDownloads: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeFormData: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeHistory: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeLocalStorage: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removePasswords: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removePluginData: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            settings: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        commands: {
                            getAll: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        contextMenus: {
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            update: {
                                minArgs: 2,
                                maxArgs: 2
                            }
                        },
                        cookies: {
                            get: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getAll: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getAllCookieStores: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            set: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        devtools: {
                            inspectedWindow: {
                                eval: {
                                    minArgs: 1,
                                    maxArgs: 2,
                                    singleCallbackArg: !1
                                }
                            },
                            panels: {
                                create: {
                                    minArgs: 3,
                                    maxArgs: 3,
                                    singleCallbackArg: !0
                                },
                                elements: {
                                    createSidebarPane: {
                                        minArgs: 1,
                                        maxArgs: 1
                                    }
                                }
                            }
                        },
                        downloads: {
                            cancel: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            download: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            erase: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getFileIcon: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            open: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            pause: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeFile: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            resume: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            search: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            show: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            }
                        },
                        extension: {
                            isAllowedFileSchemeAccess: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            isAllowedIncognitoAccess: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        history: {
                            addUrl: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            deleteAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            deleteRange: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            deleteUrl: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getVisits: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            search: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        i18n: {
                            detectLanguage: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getAcceptLanguages: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        identity: {
                            launchWebAuthFlow: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        idle: {
                            queryState: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        management: {
                            get: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            getSelf: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            setEnabled: {
                                minArgs: 2,
                                maxArgs: 2
                            },
                            uninstallSelf: {
                                minArgs: 0,
                                maxArgs: 1
                            }
                        },
                        notifications: {
                            clear: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            create: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            getAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            getPermissionLevel: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            update: {
                                minArgs: 2,
                                maxArgs: 2
                            }
                        },
                        pageAction: {
                            getPopup: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getTitle: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            hide: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            setIcon: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            setPopup: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            setTitle: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            },
                            show: {
                                minArgs: 1,
                                maxArgs: 1,
                                fallbackToNoCallback: !0
                            }
                        },
                        permissions: {
                            contains: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getAll: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            request: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        runtime: {
                            getBackgroundPage: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            getPlatformInfo: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            openOptionsPage: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            requestUpdateCheck: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            sendMessage: {
                                minArgs: 1,
                                maxArgs: 3
                            },
                            sendNativeMessage: {
                                minArgs: 2,
                                maxArgs: 2
                            },
                            setUninstallURL: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        sessions: {
                            getDevices: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            getRecentlyClosed: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            restore: {
                                minArgs: 0,
                                maxArgs: 1
                            }
                        },
                        storage: {
                            local: {
                                clear: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                get: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getBytesInUse: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                set: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            },
                            managed: {
                                get: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getBytesInUse: {
                                    minArgs: 0,
                                    maxArgs: 1
                                }
                            },
                            sync: {
                                clear: {
                                    minArgs: 0,
                                    maxArgs: 0
                                },
                                get: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                getBytesInUse: {
                                    minArgs: 0,
                                    maxArgs: 1
                                },
                                remove: {
                                    minArgs: 1,
                                    maxArgs: 1
                                },
                                set: {
                                    minArgs: 1,
                                    maxArgs: 1
                                }
                            }
                        },
                        tabs: {
                            captureVisibleTab: {
                                minArgs: 0,
                                maxArgs: 2
                            },
                            create: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            detectLanguage: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            discard: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            duplicate: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            executeScript: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            get: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getCurrent: {
                                minArgs: 0,
                                maxArgs: 0
                            },
                            getZoom: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            getZoomSettings: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            goBack: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            goForward: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            highlight: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            insertCSS: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            move: {
                                minArgs: 2,
                                maxArgs: 2
                            },
                            query: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            reload: {
                                minArgs: 0,
                                maxArgs: 2
                            },
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            removeCSS: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            sendMessage: {
                                minArgs: 2,
                                maxArgs: 3
                            },
                            setZoom: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            setZoomSettings: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            update: {
                                minArgs: 1,
                                maxArgs: 2
                            }
                        },
                        topSites: {
                            get: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        webNavigation: {
                            getAllFrames: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            getFrame: {
                                minArgs: 1,
                                maxArgs: 1
                            }
                        },
                        webRequest: {
                            handlerBehaviorChanged: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        },
                        windows: {
                            create: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            get: {
                                minArgs: 1,
                                maxArgs: 2
                            },
                            getAll: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            getCurrent: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            getLastFocused: {
                                minArgs: 0,
                                maxArgs: 1
                            },
                            remove: {
                                minArgs: 1,
                                maxArgs: 1
                            },
                            update: {
                                minArgs: 2,
                                maxArgs: 2
                            }
                        }
                    };
                    if (Object.keys(f).length === 0)
                        throw new Error("api-metadata.json has not been included in browser-polyfill");
                    class h extends WeakMap {
                        constructor(m, k=void 0) {
                            super(k),
                            this.createItem = m
                        }
                        get(m) {
                            return this.has(m) || this.set(m, this.createItem(m)),
                            super.get(m)
                        }
                    }
                    const q = u => u && typeof u == "object" && typeof u.then == "function"
                      , O = (u, m) => (...k) => {
                        w.runtime.lastError ? u.reject(new Error(w.runtime.lastError.message)) : m.singleCallbackArg || k.length <= 1 && m.singleCallbackArg !== !1 ? u.resolve(k[0]) : u.resolve(k)
                    }
                      , E = u => u == 1 ? "argument" : "arguments"
                      , L = (u, m) => function(b, ...C) {
                        if (C.length < m.minArgs)
                            throw new Error(`Expected at least ${m.minArgs} ${E(m.minArgs)} for ${u}(), got ${C.length}`);
                        if (C.length > m.maxArgs)
                            throw new Error(`Expected at most ${m.maxArgs} ${E(m.maxArgs)} for ${u}(), got ${C.length}`);
                        return new Promise( (P, D) => {
                            if (m.fallbackToNoCallback)
                                try {
                                    b[u](...C, O({
                                        resolve: P,
                                        reject: D
                                    }, m))
                                } catch (p) {
                                    console.warn(`${u} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, p),
                                    b[u](...C),
                                    m.fallbackToNoCallback = !1,
                                    m.noCallback = !0,
                                    P()
                                }
                            else
                                m.noCallback ? (b[u](...C),
                                P()) : b[u](...C, O({
                                    resolve: P,
                                    reject: D
                                }, m))
                        }
                        )
                    }
                      , a = (u, m, k) => new Proxy(m,{
                        apply(b, C, P) {
                            return k.call(C, u, ...P)
                        }
                    });
                    let l = Function.call.bind(Object.prototype.hasOwnProperty);
                    const e = (u, m={}, k={}) => {
                        let b = Object.create(null)
                          , C = {
                            has(D, p) {
                                return p in u || p in b
                            },
                            get(D, p, R) {
                                if (p in b)
                                    return b[p];
                                if (!(p in u))
                                    return;
                                let U = u[p];
                                if (typeof U == "function")
                                    if (typeof m[p] == "function")
                                        U = a(u, u[p], m[p]);
                                    else if (l(k, p)) {
                                        let B = L(p, k[p]);
                                        U = a(u, u[p], B)
                                    } else
                                        U = U.bind(u);
                                else if (typeof U == "object" && U !== null && (l(m, p) || l(k, p)))
                                    U = e(U, m[p], k[p]);
                                else if (l(k, "*"))
                                    U = e(U, m[p], k["*"]);
                                else
                                    return Object.defineProperty(b, p, {
                                        configurable: !0,
                                        enumerable: !0,
                                        get() {
                                            return u[p]
                                        },
                                        set(B) {
                                            u[p] = B
                                        }
                                    }),
                                    U;
                                return b[p] = U,
                                U
                            },
                            set(D, p, R, U) {
                                return p in b ? b[p] = R : u[p] = R,
                                !0
                            },
                            defineProperty(D, p, R) {
                                return Reflect.defineProperty(b, p, R)
                            },
                            deleteProperty(D, p) {
                                return Reflect.deleteProperty(b, p)
                            }
                        }
                          , P = Object.create(u);
                        return new Proxy(P,C)
                    }
                      , r = u => ({
                        addListener(m, k, ...b) {
                            m.addListener(u.get(k), ...b)
                        },
                        hasListener(m, k) {
                            return m.hasListener(u.get(k))
                        },
                        removeListener(m, k) {
                            m.removeListener(u.get(k))
                        }
                    })
                      , i = new h(u => typeof u != "function" ? u : function(k) {
                        const b = e(k, {}, {
                            getContent: {
                                minArgs: 0,
                                maxArgs: 0
                            }
                        });
                        u(b)
                    }
                    )
                      , c = new h(u => typeof u != "function" ? u : function(k, b, C) {
                        let P = !1, D, p = new Promise(F => {
                            D = function(j) {
                                P = !0,
                                F(j)
                            }
                        }
                        ), R;
                        try {
                            R = u(k, b, D)
                        } catch (F) {
                            R = Promise.reject(F)
                        }
                        const U = R !== !0 && q(R);
                        if (R !== !0 && !U && !P)
                            return !1;
                        const B = F => {
                            F.then(j => {
                                C(j)
                            }
                            , j => {
                                let G;
                                j && (j instanceof Error || typeof j.message == "string") ? G = j.message : G = "An unexpected error occurred",
                                C({
                                    __mozWebExtensionPolyfillReject__: !0,
                                    message: G
                                })
                            }
                            ).catch(j => {
                                console.error("Failed to send onMessage rejected reply", j)
                            }
                            )
                        }
                        ;
                        return B(U ? R : p),
                        !0
                    }
                    )
                      , x = ({reject: u, resolve: m}, k) => {
                        w.runtime.lastError ? w.runtime.lastError.message === o ? m() : u(new Error(w.runtime.lastError.message)) : k && k.__mozWebExtensionPolyfillReject__ ? u(new Error(k.message)) : m(k)
                    }
                      , g = (u, m, k, ...b) => {
                        if (b.length < m.minArgs)
                            throw new Error(`Expected at least ${m.minArgs} ${E(m.minArgs)} for ${u}(), got ${b.length}`);
                        if (b.length > m.maxArgs)
                            throw new Error(`Expected at most ${m.maxArgs} ${E(m.maxArgs)} for ${u}(), got ${b.length}`);
                        return new Promise( (C, P) => {
                            const D = x.bind(null, {
                                resolve: C,
                                reject: P
                            });
                            b.push(D),
                            k.sendMessage(...b)
                        }
                        )
                    }
                      , d = {
                        devtools: {
                            network: {
                                onRequestFinished: r(i)
                            }
                        },
                        runtime: {
                            onMessage: r(c),
                            onMessageExternal: r(c),
                            sendMessage: g.bind(null, "sendMessage", {
                                minArgs: 1,
                                maxArgs: 3
                            })
                        },
                        tabs: {
                            sendMessage: g.bind(null, "sendMessage", {
                                minArgs: 2,
                                maxArgs: 3
                            })
                        }
                    }
                      , _ = {
                        clear: {
                            minArgs: 1,
                            maxArgs: 1
                        },
                        get: {
                            minArgs: 1,
                            maxArgs: 1
                        },
                        set: {
                            minArgs: 1,
                            maxArgs: 1
                        }
                    };
                    return f.privacy = {
                        network: {
                            "*": _
                        },
                        services: {
                            "*": _
                        },
                        websites: {
                            "*": _
                        }
                    },
                    e(w, d, f)
                }
                ;
                n.exports = v(chrome)
            }
        })
    }
    )(ye);
    var Be = ye.exports;
    const S = De(Be);
    function je(s) {
        return s == null || typeof s == "function" ? {
            main: s
        } : s
    }
    var _e = Object.prototype.hasOwnProperty;
    function oe(s, t) {
        var n, o;
        if (s === t)
            return !0;
        if (s && t && (n = s.constructor) === t.constructor) {
            if (n === Date)
                return s.getTime() === t.getTime();
            if (n === RegExp)
                return s.toString() === t.toString();
            if (n === Array) {
                if ((o = s.length) === t.length)
                    for (; o-- && oe(s[o], t[o]); )
                        ;
                return o === -1
            }
            if (!n || typeof s == "object") {
                o = 0;
                for (n in s)
                    if (_e.call(s, n) && ++o && !_e.call(t, n) || !(n in t) || !oe(s[n], t[n]))
                        return !1;
                return Object.keys(t).length === o
            }
        }
        return s !== s && t !== t
    }
    function ee(s, ...t) {}
    const le = {
        debug: (...s) => ee(console.debug, ...s),
        log: (...s) => ee(console.log, ...s),
        warn: (...s) => ee(console.warn, ...s),
        error: (...s) => ee(console.error, ...s)
    };
    function Fe(s) {
        return Array.isArray(s) ? s : [s]
    }
    const Ve = new Error("request for lock canceled");
    var Ke = function(s, t, n, o) {
        function v(w) {
            return w instanceof n ? w : new n(function(f) {
                f(w)
            }
            )
        }
        return new (n || (n = Promise))(function(w, f) {
            function h(E) {
                try {
                    O(o.next(E))
                } catch (L) {
                    f(L)
                }
            }
            function q(E) {
                try {
                    O(o.throw(E))
                } catch (L) {
                    f(L)
                }
            }
            function O(E) {
                E.done ? w(E.value) : v(E.value).then(h, q)
            }
            O((o = o.apply(s, t || [])).next())
        }
        )
    };
    class $e {
        constructor(t, n=Ve) {
            this._value = t,
            this._cancelError = n,
            this._queue = [],
            this._weightedWaiters = []
        }
        acquire(t=1, n=0) {
            if (t <= 0)
                throw new Error(`invalid weight ${t}: must be positive`);
            return new Promise( (o, v) => {
                const w = {
                    resolve: o,
                    reject: v,
                    weight: t,
                    priority: n
                }
                  , f = ke(this._queue, h => n <= h.priority);
                f === -1 && t <= this._value ? this._dispatchItem(w) : this._queue.splice(f + 1, 0, w)
            }
            )
        }
        runExclusive(t) {
            return Ke(this, arguments, void 0, function*(n, o=1, v=0) {
                const [w,f] = yield this.acquire(o, v);
                try {
                    return yield n(w)
                } finally {
                    f()
                }
            })
        }
        waitForUnlock(t=1, n=0) {
            if (t <= 0)
                throw new Error(`invalid weight ${t}: must be positive`);
            return this._couldLockImmediately(t, n) ? Promise.resolve() : new Promise(o => {
                this._weightedWaiters[t - 1] || (this._weightedWaiters[t - 1] = []),
                ze(this._weightedWaiters[t - 1], {
                    resolve: o,
                    priority: n
                })
            }
            )
        }
        isLocked() {
            return this._value <= 0
        }
        getValue() {
            return this._value
        }
        setValue(t) {
            this._value = t,
            this._dispatchQueue()
        }
        release(t=1) {
            if (t <= 0)
                throw new Error(`invalid weight ${t}: must be positive`);
            this._value += t,
            this._dispatchQueue()
        }
        cancel() {
            this._queue.forEach(t => t.reject(this._cancelError)),
            this._queue = []
        }
        _dispatchQueue() {
            for (this._drainUnlockWaiters(); this._queue.length > 0 && this._queue[0].weight <= this._value; )
                this._dispatchItem(this._queue.shift()),
                this._drainUnlockWaiters()
        }
        _dispatchItem(t) {
            const n = this._value;
            this._value -= t.weight,
            t.resolve([n, this._newReleaser(t.weight)])
        }
        _newReleaser(t) {
            let n = !1;
            return () => {
                n || (n = !0,
                this.release(t))
            }
        }
        _drainUnlockWaiters() {
            if (this._queue.length === 0)
                for (let t = this._value; t > 0; t--) {
                    const n = this._weightedWaiters[t - 1];
                    n && (n.forEach(o => o.resolve()),
                    this._weightedWaiters[t - 1] = [])
                }
            else {
                const t = this._queue[0].priority;
                for (let n = this._value; n > 0; n--) {
                    const o = this._weightedWaiters[n - 1];
                    if (!o)
                        continue;
                    const v = o.findIndex(w => w.priority <= t);
                    (v === -1 ? o : o.splice(0, v)).forEach(w => w.resolve())
                }
            }
        }
        _couldLockImmediately(t, n) {
            return (this._queue.length === 0 || this._queue[0].priority < n) && t <= this._value
        }
    }
    function ze(s, t) {
        const n = ke(s, o => t.priority <= o.priority);
        s.splice(n + 1, 0, t)
    }
    function ke(s, t) {
        for (let n = s.length - 1; n >= 0; n--)
            if (t(s[n]))
                return n;
        return -1
    }
    var We = function(s, t, n, o) {
        function v(w) {
            return w instanceof n ? w : new n(function(f) {
                f(w)
            }
            )
        }
        return new (n || (n = Promise))(function(w, f) {
            function h(E) {
                try {
                    O(o.next(E))
                } catch (L) {
                    f(L)
                }
            }
            function q(E) {
                try {
                    O(o.throw(E))
                } catch (L) {
                    f(L)
                }
            }
            function O(E) {
                E.done ? w(E.value) : v(E.value).then(h, q)
            }
            O((o = o.apply(s, t || [])).next())
        }
        )
    };
    class Ge {
        constructor(t) {
            this._semaphore = new $e(1,t)
        }
        acquire() {
            return We(this, arguments, void 0, function*(t=0) {
                const [,n] = yield this._semaphore.acquire(1, t);
                return n
            })
        }
        runExclusive(t, n=0) {
            return this._semaphore.runExclusive( () => t(), 1, n)
        }
        isLocked() {
            return this._semaphore.isLocked()
        }
        waitForUnlock(t=0) {
            return this._semaphore.waitForUnlock(1, t)
        }
        release() {
            this._semaphore.isLocked() && this._semaphore.release()
        }
        cancel() {
            return this._semaphore.cancel()
        }
    }
    const ce = Xe();
    function Xe() {
        const s = {
            local: re("local"),
            session: re("session"),
            sync: re("sync"),
            managed: re("managed")
        }
          , t = e => {
            const r = s[e];
            if (r == null) {
                const i = Object.keys(s).join(", ");
                throw Error(`Invalid area "${e}". Options: ${i}`)
            }
            return r
        }
          , n = e => {
            const r = e.indexOf(":")
              , i = e.substring(0, r)
              , c = e.substring(r + 1);
            if (c == null)
                throw Error(`Storage key should be in the form of "area:key", but received "${e}"`);
            return {
                driverArea: i,
                driverKey: c,
                driver: t(i)
            }
        }
          , o = e => e + "$"
          , v = (e, r) => e ?? r ?? null
          , w = e => typeof e == "object" && !Array.isArray(e) ? e : {}
          , f = async (e, r, i) => {
            const c = await e.getItem(r);
            return v(c, (i == null ? void 0 : i.fallback) ?? (i == null ? void 0 : i.defaultValue))
        }
          , h = async (e, r) => {
            const i = o(r)
              , c = await e.getItem(i);
            return w(c)
        }
          , q = async (e, r, i) => {
            await e.setItem(r, i ?? null)
        }
          , O = async (e, r, i) => {
            const c = o(r)
              , g = {
                ...w(await e.getItem(c))
            };
            Object.entries(i).forEach( ([d,_]) => {
                _ == null ? delete g[d] : g[d] = _
            }
            ),
            await e.setItem(c, g)
        }
          , E = async (e, r, i) => {
            if (await e.removeItem(r),
            i != null && i.removeMeta) {
                const c = o(r);
                await e.removeItem(c)
            }
        }
          , L = async (e, r, i) => {
            const c = o(r);
            if (i == null)
                await e.removeItem(c);
            else {
                const x = w(await e.getItem(c));
                Fe(i).forEach(g => delete x[g]),
                await e.setItem(c, x)
            }
        }
          , a = (e, r, i) => e.watch(r, i);
        return {
            getItem: async (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                return await f(i, c, r)
            }
            ,
            getItems: async e => {
                const r = new Map
                  , i = new Map;
                return e.forEach(x => {
                    let g, d;
                    typeof x == "string" ? g = x : (g = x.key,
                    d = x.options);
                    const {driverArea: _, driverKey: u} = n(g)
                      , m = r.get(_) ?? [];
                    r.set(_, m.concat(u)),
                    i.set(g, d)
                }
                ),
                (await Promise.all(Array.from(r.entries()).map(async ([x,g]) => (await s[x].getItems(g)).map(_ => {
                    const u = `${x}:${_.key}`
                      , m = i.get(u)
                      , k = v(_.value, (m == null ? void 0 : m.fallback) ?? (m == null ? void 0 : m.defaultValue));
                    return {
                        key: u,
                        value: k
                    }
                }
                )))).flat()
            }
            ,
            getMeta: async e => {
                const {driver: r, driverKey: i} = n(e);
                return await h(r, i)
            }
            ,
            setItem: async (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                await q(i, c, r)
            }
            ,
            setItems: async e => {
                const r = new Map;
                e.forEach( ({key: i, value: c}) => {
                    const {driverArea: x, driverKey: g} = n(i)
                      , d = r.get(x) ?? [];
                    r.set(x, d.concat({
                        key: g,
                        value: c
                    }))
                }
                ),
                await Promise.all(Array.from(r.entries()).map(async ([i,c]) => {
                    await t(i).setItems(c)
                }
                ))
            }
            ,
            setMeta: async (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                await O(i, c, r)
            }
            ,
            removeItem: async (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                await E(i, c, r)
            }
            ,
            removeItems: async e => {
                const r = new Map;
                e.forEach(i => {
                    let c, x;
                    typeof i == "string" ? c = i : (c = i.key,
                    x = i.options);
                    const {driverArea: g, driverKey: d} = n(c)
                      , _ = r.get(g) ?? [];
                    _.push(d),
                    x != null && x.removeMeta && _.push(o(d)),
                    r.set(g, _)
                }
                ),
                await Promise.all(Array.from(r.entries()).map(async ([i,c]) => {
                    await t(i).removeItems(c)
                }
                ))
            }
            ,
            removeMeta: async (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                await L(i, c, r)
            }
            ,
            snapshot: async (e, r) => {
                var x;
                const c = await t(e).snapshot();
                return (x = r == null ? void 0 : r.excludeKeys) == null || x.forEach(g => {
                    delete c[g],
                    delete c[o(g)]
                }
                ),
                c
            }
            ,
            restoreSnapshot: async (e, r) => {
                await t(e).restoreSnapshot(r)
            }
            ,
            watch: (e, r) => {
                const {driver: i, driverKey: c} = n(e);
                return a(i, c, r)
            }
            ,
            unwatch() {
                Object.values(s).forEach(e => {
                    e.unwatch()
                }
                )
            },
            defineItem: (e, r) => {
                const {driver: i, driverKey: c} = n(e)
                  , {version: x=1, migrations: g={}} = r ?? {};
                if (x < 1)
                    throw Error("Storage item version cannot be less than 1. Initial versions should be set to 1, not 0.");
                const d = async () => {
                    var U;
                    const b = o(c)
                      , [{value: C},{value: P}] = await i.getItems([c, b]);
                    if (C == null)
                        return;
                    const D = (P == null ? void 0 : P.v) ?? 1;
                    if (D > x)
                        throw Error(`Version downgrade detected (v${D} -> v${x}) for "${e}"`);
                    le.debug(`Running storage migration for ${e}: v${D} -> v${x}`);
                    const p = Array.from({
                        length: x - D
                    }, (B, F) => D + F + 1);
                    let R = C;
                    for (const B of p)
                        R = await ((U = g == null ? void 0 : g[B]) == null ? void 0 : U.call(g, R)) ?? R;
                    await i.setItems([{
                        key: c,
                        value: R
                    }, {
                        key: b,
                        value: {
                            ...P,
                            v: x
                        }
                    }]),
                    le.debug(`Storage migration completed for ${e} v${x}`, {
                        migratedValue: R
                    })
                }
                  , _ = (r == null ? void 0 : r.migrations) == null ? Promise.resolve() : d().catch(b => {
                    le.error(`Migration failed for ${e}`, b)
                }
                )
                  , u = new Ge
                  , m = () => (r == null ? void 0 : r.fallback) ?? (r == null ? void 0 : r.defaultValue) ?? null
                  , k = () => u.runExclusive(async () => {
                    const b = await i.getItem(c);
                    if (b != null || (r == null ? void 0 : r.init) == null)
                        return b;
                    const C = await r.init();
                    return await i.setItem(c, C),
                    C
                }
                );
                return _.then(k),
                {
                    get defaultValue() {
                        return m()
                    },
                    get fallback() {
                        return m()
                    },
                    getValue: async () => (await _,
                    r != null && r.init ? await k() : await f(i, c, r)),
                    getMeta: async () => (await _,
                    await h(i, c)),
                    setValue: async b => (await _,
                    await q(i, c, b)),
                    setMeta: async b => (await _,
                    await O(i, c, b)),
                    removeValue: async b => (await _,
                    await E(i, c, b)),
                    removeMeta: async b => (await _,
                    await L(i, c, b)),
                    watch: b => a(i, c, (C, P) => b(C ?? m(), P ?? m())),
                    migrate: d
                }
            }
        }
    }
    function re(s) {
        const t = () => {
            if (S.runtime == null)
                throw Error(["'wxt/storage' must be loaded in a web extension environment", `
 - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371`, ` - If thrown during tests, mock 'wxt/browser' correctly. See https://wxt.dev/guide/go-further/testing.html
`].join(`
`));
            if (S.storage == null)
                throw Error("You must add the 'storage' permission to your manifest to use 'wxt/storage'");
            const o = S.storage[s];
            if (o == null)
                throw Error(`"browser.storage.${s}" is undefined`);
            return o
        }
          , n = new Set;
        return {
            getItem: async o => (await t().get(o))[o],
            getItems: async o => {
                const v = await t().get(o);
                return o.map(w => ({
                    key: w,
                    value: v[w] ?? null
                }))
            }
            ,
            setItem: async (o, v) => {
                v == null ? await t().remove(o) : await t().set({
                    [o]: v
                })
            }
            ,
            setItems: async o => {
                const v = o.reduce( (w, {key: f, value: h}) => (w[f] = h,
                w), {});
                await t().set(v)
            }
            ,
            removeItem: async o => {
                await t().remove(o)
            }
            ,
            removeItems: async o => {
                await t().remove(o)
            }
            ,
            snapshot: async () => await t().get(),
            restoreSnapshot: async o => {
                await t().set(o)
            }
            ,
            watch(o, v) {
                const w = f => {
                    const h = f[o];
                    h != null && (oe(h.newValue, h.oldValue) || v(h.newValue ?? null, h.oldValue ?? null))
                }
                ;
                return t().onChanged.addListener(w),
                n.add(w),
                () => {
                    t().onChanged.removeListener(w),
                    n.delete(w)
                }
            },
            unwatch() {
                n.forEach(o => {
                    t().onChanged.removeListener(o)
                }
                ),
                n.clear()
            }
        }
    }
    const Ee = "0.1.4"
      , ge = "https://api.holytrick.com";
    async function ue() {
        const s = await de();
        if (!s)
            return console.error("No auth token found"),
            null;
        try {
            const t = await fetch(ge + "/auth/account", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + s
                }
            });
            if (!t.ok)
                return console.error("Failed to fetch user account"),
                null;
            const n = await t.json();
            return console.log("User Account Info:", n),
            n
        } catch (t) {
            return console.error("Error fetching user account:", t),
            null
        }
    }
    async function He(s, t, n, o, v, w) {
        var f, h, q;
        try {
            const O = await ue()
              , E = O ? await de() : ""
              , L = (n == null ? void 0 : n.apiKey) && (n == null ? void 0 : n.apiKey.startsWith("sk-ant-"))
              , a = await fetch(ge + "/getTrick", {
                method: "POST",
                body: JSON.stringify({
                    user_command: s,
                    html: t,
                    extra: n
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: O ? `Bearer ${E}` : ""
                }
            });
            if (!a.ok) {
                w == null || w(await a.text() || "未知错误");
                return
            }
            const l = (f = a.body) == null ? void 0 : f.getReader()
              , e = new TextDecoder("utf-8");
            let r = ""
              , i = "";
            for (; ; ) {
                const {done: c, value: x} = await l.read();
                if (c)
                    break;
                r += e.decode(x, {
                    stream: !0
                });
                const g = r.split(`
`);
                r = g.pop() || "";
                for (const d of g)
                    if (d.startsWith("data: ")) {
                        const _ = d.slice(6);
                        if (_ === "[DONE]")
                            continue;
                        try {
                            const m = ((q = (h = JSON.parse(_).choices[0]) == null ? void 0 : h.delta) == null ? void 0 : q.content) || "";
                            m && (i += m,
                            o == null || o(i))
                        } catch (u) {
                            console.error("Error parsing JSON:", u)
                        }
                    }
            }
            v == null || v(i)
        } catch (O) {
            console.error("Error sending data:", O),
            w == null || w(O)
        }
    }
    async function Ze(s) {
        try {
            const t = await ue()
              , n = t ? await de() : ""
              , v = await (await fetch(ge + "/generateShareUrl", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: t ? `Bearer ${n}` : ""
                },
                body: JSON.stringify({
                    msg: s
                })
            })).json();
            return console.log(v),
            v.url ? v.url : null
        } catch (t) {
            return console.error("Error generating share URL:", t),
            null
        }
    }
    var me = {
        exports: {}
    };
    (function(s, t) {
        (function(n, o) {
            var v = "1.0.39"
              , w = ""
              , f = "?"
              , h = "function"
              , q = "undefined"
              , O = "object"
              , E = "string"
              , L = "major"
              , a = "model"
              , l = "name"
              , e = "type"
              , r = "vendor"
              , i = "version"
              , c = "architecture"
              , x = "console"
              , g = "mobile"
              , d = "tablet"
              , _ = "smarttv"
              , u = "wearable"
              , m = "embedded"
              , k = 500
              , b = "Amazon"
              , C = "Apple"
              , P = "ASUS"
              , D = "BlackBerry"
              , p = "Browser"
              , R = "Chrome"
              , U = "Edge"
              , B = "Firefox"
              , F = "Google"
              , j = "Huawei"
              , G = "LG"
              , he = "Microsoft"
              , Ce = "Motorola"
              , J = "Opera"
              , Y = "Samsung"
              , Ie = "Sharp"
              , te = "Sony"
              , fe = "Xiaomi"
              , Ae = "Zebra"
              , Me = "Facebook"
              , Oe = "Chromium OS"
              , Ne = "Mac OS"
              , Pe = " Browser"
              , or = function(T, I) {
                var y = {};
                for (var N in T)
                    I[N] && I[N].length % 2 === 0 ? y[N] = I[N].concat(T[N]) : y[N] = T[N];
                return y
            }
              , se = function(T) {
                for (var I = {}, y = 0; y < T.length; y++)
                    I[T[y].toUpperCase()] = T[y];
                return I
            }
              , Re = function(T, I) {
                return typeof T === E ? H(I).indexOf(H(T)) !== -1 : !1
            }
              , H = function(T) {
                return T.toLowerCase()
            }
              , lr = function(T) {
                return typeof T === E ? T.replace(/[^\d\.]/g, w).split(".")[0] : o
            }
              , ve = function(T, I) {
                if (typeof T === E)
                    return T = T.replace(/^\s\s*/, w),
                    typeof I === q ? T : T.substring(0, k)
            }
              , Q = function(T, I) {
                for (var y = 0, N, z, K, M, A, $; y < I.length && !A; ) {
                    var pe = I[y]
                      , qe = I[y + 1];
                    for (N = z = 0; N < pe.length && !A && pe[N]; )
                        if (A = pe[N++].exec(T),
                        A)
                            for (K = 0; K < qe.length; K++)
                                $ = A[++z],
                                M = qe[K],
                                typeof M === O && M.length > 0 ? M.length === 2 ? typeof M[1] == h ? this[M[0]] = M[1].call(this, $) : this[M[0]] = M[1] : M.length === 3 ? typeof M[1] === h && !(M[1].exec && M[1].test) ? this[M[0]] = $ ? M[1].call(this, $, M[2]) : o : this[M[0]] = $ ? $.replace(M[1], M[2]) : o : M.length === 4 && (this[M[0]] = $ ? M[3].call(this, $.replace(M[1], M[2])) : o) : this[M] = $ || o;
                    y += 2
                }
            }
              , ne = function(T, I) {
                for (var y in I)
                    if (typeof I[y] === O && I[y].length > 0) {
                        for (var N = 0; N < I[y].length; N++)
                            if (Re(I[y][N], T))
                                return y === f ? o : y
                    } else if (Re(I[y], T))
                        return y === f ? o : y;
                return I.hasOwnProperty("*") ? I["*"] : T
            }
              , cr = {
                "1.0": "/8",
                "1.2": "/1",
                "1.3": "/3",
                "2.0": "/412",
                "2.0.2": "/416",
                "2.0.3": "/417",
                "2.0.4": "/419",
                "?": "/"
            }
              , Ue = {
                ME: "4.90",
                "NT 3.11": "NT3.51",
                "NT 4.0": "NT4.0",
                2e3: "NT 5.0",
                XP: ["NT 5.1", "NT 5.2"],
                Vista: "NT 6.0",
                7: "NT 6.1",
                8: "NT 6.2",
                "8.1": "NT 6.3",
                10: ["NT 6.4", "NT 10.0"],
                RT: "ARM"
            }
              , Le = {
                browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [i, [l, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [i, [l, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [l, i], [/opios[\/ ]+([\w\.]+)/i], [i, [l, J + " Mini"]], [/\bop(?:rg)?x\/([\w\.]+)/i], [i, [l, J + " GX"]], [/\bopr\/([\w\.]+)/i], [i, [l, J]], [/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i], [i, [l, "Baidu"]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i, /(avant|iemobile|slim)\s?(?:browser)?[\/ ]?([\w\.]*)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [l, i], [/quark(?:pc)?\/([-\w\.]+)/i], [i, [l, "Quark"]], [/\bddg\/([\w\.]+)/i], [i, [l, "DuckDuckGo"]], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [i, [l, "UC" + p]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i, /micromessenger\/([\w\.]+)/i], [i, [l, "WeChat"]], [/konqueror\/([\w\.]+)/i], [i, [l, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [i, [l, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [i, [l, "Yandex"]], [/slbrowser\/([\w\.]+)/i], [i, [l, "Smart Lenovo " + p]], [/(avast|avg)\/([\w\.]+)/i], [[l, /(.+)/, "$1 Secure " + p], i], [/\bfocus\/([\w\.]+)/i], [i, [l, B + " Focus"]], [/\bopt\/([\w\.]+)/i], [i, [l, J + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [i, [l, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [i, [l, "Dolphin"]], [/coast\/([\w\.]+)/i], [i, [l, J + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [i, [l, "MIUI " + p]], [/fxios\/([-\w\.]+)/i], [i, [l, B]], [/\bqihu|(qi?ho?o?|360)browser/i], [[l, "360" + Pe]], [/\b(qq)\/([\w\.]+)/i], [[l, /(.+)/, "$1Browser"], i], [/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i], [[l, /(.+)/, "$1" + Pe], i], [/samsungbrowser\/([\w\.]+)/i], [i, [l, Y + " Internet"]], [/(comodo_dragon)\/([\w\.]+)/i], [[l, /_/g, " "], i], [/metasr[\/ ]?([\d\.]+)/i], [i, [l, "Sogou Explorer"]], [/(sogou)mo\w+\/([\d\.]+)/i], [[l, "Sogou Mobile"], i], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|2345Explorer)[\/ ]?([\w\.]+)/i], [l, i], [/(lbbrowser|rekonq)/i, /\[(linkedin)app\]/i], [l], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[l, Me], i], [/(Klarna)\/([\w\.]+)/i, /(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(alipay)client\/([\w\.]+)/i, /(twitter)(?:and| f.+e\/([\w\.]+))/i, /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i], [l, i], [/\bgsa\/([\w\.]+) .*safari\//i], [i, [l, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [i, [l, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [i, [l, R + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[l, R + " WebView"], i], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [i, [l, "Android " + p]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [l, i], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [i, [l, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [i, l], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [l, [i, ne, cr]], [/(webkit|khtml)\/([\w\.]+)/i], [l, i], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[l, "Netscape"], i], [/(wolvic)\/([\w\.]+)/i], [l, i], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [i, [l, B + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i], [l, [i, /_/g, "."]], [/(cobalt)\/([\w\.]+)/i], [l, [i, /master.|lts./, ""]]],
                cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[c, "amd64"]], [/(ia32(?=;))/i], [[c, H]], [/((?:i[346]|x)86)[;\)]/i], [[c, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[c, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[c, "armhf"]], [/windows (ce|mobile); ppc;/i], [[c, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[c, /ower/, w, H]], [/(sun4\w)[;\)]/i], [[c, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[c, H]]],
                device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [a, [r, Y], [e, d]], [/\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]((?!sm-[lr])[-\w]+)/i, /sec-(sgh\w+)/i], [a, [r, Y], [e, g]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [a, [r, C], [e, g]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [a, [r, C], [e, d]], [/(macintosh);/i], [a, [r, C]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [a, [r, Ie], [e, g]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [a, [r, j], [e, d]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [a, [r, j], [e, g]], [/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i], [[a, /_/g, " "], [r, fe], [e, g]], [/oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i, /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[a, /_/g, " "], [r, fe], [e, d]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [a, [r, "OPPO"], [e, g]], [/\b(opd2\d{3}a?) bui/i], [a, [r, "OPPO"], [e, d]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [a, [r, "Vivo"], [e, g]], [/\b(rmx[1-3]\d{3})(?: bui|;|\))/i], [a, [r, "Realme"], [e, g]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [a, [r, Ce], [e, g]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [a, [r, Ce], [e, d]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [a, [r, G], [e, d]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [a, [r, G], [e, g]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [a, [r, "Lenovo"], [e, d]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[a, /_/g, " "], [r, "Nokia"], [e, g]], [/(pixel c)\b/i], [a, [r, F], [e, d]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [a, [r, F], [e, g]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [a, [r, te], [e, g]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[a, "Xperia Tablet"], [r, te], [e, d]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [a, [r, "OnePlus"], [e, g]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [a, [r, b], [e, d]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[a, /(.+)/g, "Fire Phone $1"], [r, b], [e, g]], [/(playbook);[-\w\),; ]+(rim)/i], [a, r, [e, d]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [a, [r, D], [e, g]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [a, [r, P], [e, d]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [a, [r, P], [e, g]], [/(nexus 9)/i], [a, [r, "HTC"], [e, d]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [r, [a, /_/g, " "], [e, g]], [/droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i], [a, [r, "TCL"], [e, d]], [/(itel) ((\w+))/i], [[r, H], a, [e, ne, {
                    tablet: ["p10001l", "w7001"],
                    "*": "mobile"
                }]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [a, [r, "Acer"], [e, d]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [a, [r, "Meizu"], [e, g]], [/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i], [a, [r, "Ulefone"], [e, g]], [/droid.+; (a(?:015|06[35]|142p?))/i], [a, [r, "Nothing"], [e, g]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [r, a, [e, g]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [r, a, [e, d]], [/(surface duo)/i], [a, [r, he], [e, d]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [a, [r, "Fairphone"], [e, g]], [/(u304aa)/i], [a, [r, "AT&T"], [e, g]], [/\bsie-(\w*)/i], [a, [r, "Siemens"], [e, g]], [/\b(rct\w+) b/i], [a, [r, "RCA"], [e, d]], [/\b(venue[\d ]{2,7}) b/i], [a, [r, "Dell"], [e, d]], [/\b(q(?:mv|ta)\w+) b/i], [a, [r, "Verizon"], [e, d]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [a, [r, "Barnes & Noble"], [e, d]], [/\b(tm\d{3}\w+) b/i], [a, [r, "NuVision"], [e, d]], [/\b(k88) b/i], [a, [r, "ZTE"], [e, d]], [/\b(nx\d{3}j) b/i], [a, [r, "ZTE"], [e, g]], [/\b(gen\d{3}) b.+49h/i], [a, [r, "Swiss"], [e, g]], [/\b(zur\d{3}) b/i], [a, [r, "Swiss"], [e, d]], [/\b((zeki)?tb.*\b) b/i], [a, [r, "Zeki"], [e, d]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[r, "Dragon Touch"], a, [e, d]], [/\b(ns-?\w{0,9}) b/i], [a, [r, "Insignia"], [e, d]], [/\b((nxa|next)-?\w{0,9}) b/i], [a, [r, "NextBook"], [e, d]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[r, "Voice"], a, [e, g]], [/\b(lvtel\-)?(v1[12]) b/i], [[r, "LvTel"], a, [e, g]], [/\b(ph-1) /i], [a, [r, "Essential"], [e, g]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [a, [r, "Envizen"], [e, d]], [/\b(trio[-\w\. ]+) b/i], [a, [r, "MachSpeed"], [e, d]], [/\btu_(1491) b/i], [a, [r, "Rotor"], [e, d]], [/(shield[\w ]+) b/i], [a, [r, "Nvidia"], [e, d]], [/(sprint) (\w+)/i], [r, a, [e, g]], [/(kin\.[onetw]{3})/i], [[a, /\./g, " "], [r, he], [e, g]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [a, [r, Ae], [e, d]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [a, [r, Ae], [e, g]], [/smart-tv.+(samsung)/i], [r, [e, _]], [/hbbtv.+maple;(\d+)/i], [[a, /^/, "SmartTV"], [r, Y], [e, _]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[r, G], [e, _]], [/(apple) ?tv/i], [r, [a, C + " TV"], [e, _]], [/crkey/i], [[a, R + "cast"], [r, F], [e, _]], [/droid.+aft(\w+)( bui|\))/i], [a, [r, b], [e, _]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [a, [r, Ie], [e, _]], [/(bravia[\w ]+)( bui|\))/i], [a, [r, te], [e, _]], [/(mitv-\w{5}) bui/i], [a, [r, fe], [e, _]], [/Hbbtv.*(technisat) (.*);/i], [r, a, [e, _]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[r, ve], [a, ve], [e, _]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[e, _]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [r, a, [e, x]], [/droid.+; (shield) bui/i], [a, [r, "Nvidia"], [e, x]], [/(playstation [345portablevi]+)/i], [a, [r, te], [e, x]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [a, [r, he], [e, x]], [/\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i], [a, [r, Y], [e, u]], [/((pebble))app/i], [r, a, [e, u]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [a, [r, C], [e, u]], [/droid.+; (glass) \d/i], [a, [r, F], [e, u]], [/droid.+; (wt63?0{2,3})\)/i], [a, [r, Ae], [e, u]], [/(quest( \d| pro)?)/i], [a, [r, Me], [e, u]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [r, [e, m]], [/(aeobc)\b/i], [a, [r, b], [e, m]], [/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i], [a, [e, g]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [a, [e, d]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[e, d]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[e, g]], [/(android[-\w\. ]{0,9});.+buil/i], [a, [r, "Generic"]]],
                engine: [[/windows.+ edge\/([\w\.]+)/i], [i, [l, U + "HTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [i, [l, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [l, i], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [i, l]],
                os: [[/microsoft (windows) (vista|xp)/i], [l, i], [/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i], [l, [i, ne, Ue]], [/windows nt 6\.2; (arm)/i, /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i, /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[i, ne, Ue], [l, "Windows"]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[i, /_/g, "."], [l, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[l, Ne], [i, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [i, l], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [l, i], [/\(bb(10);/i], [i, [l, D]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [i, [l, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [i, [l, B + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [i, [l, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [i, [l, "watchOS"]], [/crkey\/([\d\.]+)/i], [i, [l, R + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[l, Oe], i], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [l, i], [/(sunos) ?([\w\.\d]*)/i], [[l, "Solaris"], i], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [l, i]]
            }
              , V = function(T, I) {
                if (typeof T === O && (I = T,
                T = o),
                !(this instanceof V))
                    return new V(T,I).getResult();
                var y = typeof n !== q && n.navigator ? n.navigator : o
                  , N = T || (y && y.userAgent ? y.userAgent : w)
                  , z = y && y.userAgentData ? y.userAgentData : o
                  , K = I ? or(Le, I) : Le
                  , M = y && y.userAgent == N;
                return this.getBrowser = function() {
                    var A = {};
                    return A[l] = o,
                    A[i] = o,
                    Q.call(A, N, K.browser),
                    A[L] = lr(A[i]),
                    M && y && y.brave && typeof y.brave.isBrave == h && (A[l] = "Brave"),
                    A
                }
                ,
                this.getCPU = function() {
                    var A = {};
                    return A[c] = o,
                    Q.call(A, N, K.cpu),
                    A
                }
                ,
                this.getDevice = function() {
                    var A = {};
                    return A[r] = o,
                    A[a] = o,
                    A[e] = o,
                    Q.call(A, N, K.device),
                    M && !A[e] && z && z.mobile && (A[e] = g),
                    M && A[a] == "Macintosh" && y && typeof y.standalone !== q && y.maxTouchPoints && y.maxTouchPoints > 2 && (A[a] = "iPad",
                    A[e] = d),
                    A
                }
                ,
                this.getEngine = function() {
                    var A = {};
                    return A[l] = o,
                    A[i] = o,
                    Q.call(A, N, K.engine),
                    A
                }
                ,
                this.getOS = function() {
                    var A = {};
                    return A[l] = o,
                    A[i] = o,
                    Q.call(A, N, K.os),
                    M && !A[l] && z && z.platform && z.platform != "Unknown" && (A[l] = z.platform.replace(/chrome os/i, Oe).replace(/macos/i, Ne)),
                    A
                }
                ,
                this.getResult = function() {
                    return {
                        ua: this.getUA(),
                        browser: this.getBrowser(),
                        engine: this.getEngine(),
                        os: this.getOS(),
                        device: this.getDevice(),
                        cpu: this.getCPU()
                    }
                }
                ,
                this.getUA = function() {
                    return N
                }
                ,
                this.setUA = function(A) {
                    return N = typeof A === E && A.length > k ? ve(A, k) : A,
                    this
                }
                ,
                this.setUA(N),
                this
            };
            V.VERSION = v,
            V.BROWSER = se([l, i, L]),
            V.CPU = se([c]),
            V.DEVICE = se([a, r, e, x, g, _, d, u, m]),
            V.ENGINE = V.OS = se([l, i]),
            s.exports && (t = s.exports = V),
            t.UAParser = V;
            var Z = typeof n !== q && (n.jQuery || n.Zepto);
            if (Z && !Z.ua) {
                var ae = new V;
                Z.ua = ae.getResult(),
                Z.ua.get = function() {
                    return ae.getUA()
                }
                ,
                Z.ua.set = function(T) {
                    ae.setUA(T);
                    var I = ae.getResult();
                    for (var y in I)
                        Z.ua[y] = I[y]
                }
            }
        }
        )(typeof window == "object" ? window : xe)
    }
    )(me, me.exports);
    var Je = me.exports;
    const Ye = "https://www.google-analytics.com/mp/collect"
      , Qe = "G-CCZPDHFT9X"
      , er = "BdpFZvFrSkmEMoeuELTxEQ"
      , rr = 30
      , ir = 100;
    let X = "";
    async function tr() {
        if (X)
            return X;
        const s = await S.storage.local.get("clientId")
          , t = s == null ? void 0 : s.clientId;
        return t ? X = t : (X = self.crypto.randomUUID(),
        await S.storage.local.set({
            clientId: X
        })),
        X
    }
    async function sr() {
        let {sessionData: s} = await S.storage.session.get("sessionData");
        const t = Date.now();
        return s && s.timestamp && ((t - s.timestamp) / 6e4 > rr ? s = null : (s.timestamp = t,
        await S.storage.session.set({
            sessionData: s
        }))),
        s || (s = {
            session_id: t.toString(),
            timestamp: t.toString()
        },
        await S.storage.session.set({
            sessionData: s
        })),
        s.session_id
    }
    async function W(s, t, n=!1) {
        const o = new Je.UAParser
          , v = await tr();
        fetch(`${Ye}?measurement_id=${Qe}&api_secret=${er}`, {
            method: "POST",
            body: JSON.stringify({
                client_id: v,
                user_id: v,
                events: [{
                    name: s,
                    params: s !== "first_visit" ? {
                        session_id: await sr(),
                        engagement_time_msec: ir,
                        version: Ee,
                        browser: o.getBrowser().name,
                        ...t
                    } : void 0
                }]
            })
        }).catch( () => !1)
    }
    const Te = `
function ht_showDataToUser(data) {
  window.postMessage({ type: '__ht_show_info__', data });
}
`;
    async function Se(s, t) {
        if (await S.debugger.attach({
            tabId: s
        }, "1.3"),
        Array.isArray(t)) {
            const n = [];
            for (const o of t) {
                const v = await S.debugger.sendCommand({
                    tabId: s
                }, "Runtime.evaluate", {
                    expression: Te + o,
                    returnByValue: !0
                });
                W("EXEC_CODE"),
                n.push(v)
            }
            return await S.debugger.detach({
                tabId: s
            }),
            n
        } else {
            const n = await S.debugger.sendCommand({
                tabId: s
            }, "Runtime.evaluate", {
                expression: Te + t,
                returnByValue: !0
            });
            return await S.debugger.detach({
                tabId: s
            }),
            W("EXEC_CODE"),
            n
        }
    }
    async function de() {
        return new Promise(s => {
            S.storage.local.get("authToken").then(t => {
                const n = t.authToken || null;
                s(n)
            }
            )
        }
        )
    }
    let we = "";
    const nr = je( () => {
        ce.getItem("local:apiKey").then(s => {
            we = s || ""
        }
        ),
        ce.watch("local:apiKey", s => {
            we = s || ""
        }
        ),
        S.runtime.onMessage.addListener(async (s, t, n) => {
            var o, v, w;
            if (s.action === "ht_send_feature")
                return t.tab ? (ce.getItem("local:apiKey").then(f => {
                    He(s.data, s.html, {
                        apiKey: f || we || "",
                        version: Ee,
                        ...s.extra
                    }, h => {
                        S.tabs.sendMessage(t.tab.id, {
                            action: "ht_send_feature_progress",
                            finished: !1,
                            data: h
                        })
                    }
                    , async h => {
                        var q, O, E, L, a;
                        W("SEND_FEATURE"),
                        console.log("onFinish", h),
                        await S.tabs.sendMessage(t.tab.id, {
                            action: "ht_send_feature_progress",
                            finished: !0,
                            data: h
                        });
                        try {
                            if (h != null && h.includes("// EXEC")) {
                                const l = h.substring(h.indexOf("// EXEC"))
                                  , e = await Se(t.tab.id, l);
                                await S.tabs.sendMessage(t.tab.id, {
                                    action: "ht_send_feature_finished",
                                    data: (q = e == null ? void 0 : e.result) == null ? void 0 : q.value,
                                    code: l
                                }),
                                (E = (O = e == null ? void 0 : e.result) == null ? void 0 : O.value) != null && E.success && W(`EXEC_CODE_${(a = (L = e == null ? void 0 : e.result) == null ? void 0 : L.value) != null && a.success ? "SUCCESS" : "FAILED"}`)
                            } else
                                await S.tabs.sendMessage(t.tab.id, {
                                    action: "ht_send_feature_finished",
                                    data: {
                                        success: !1,
                                        message: h.replace("REJECTED: ", "")
                                    }
                                })
                        } catch (l) {
                            console.error(l),
                            W("EXEC_CODE_FAILED", {
                                error: typeof l == "object" ? JSON.stringify(l) : l
                            }),
                            await S.tabs.sendMessage(t.tab.id, {
                                action: "ht_send_feature_finished",
                                data: {
                                    success: !1,
                                    message: typeof l == "object" ? JSON.stringify(l) : l
                                }
                            })
                        }
                    }
                    , h => S.tabs.sendMessage(t.tab.id, {
                        action: "ht_send_feature_finished",
                        data: {
                            message: h,
                            success: !1
                        }
                    })),
                    n({
                        action: "hello"
                    })
                }
                ),
                !0) : void 0;
            if (s.action === "trigger_close_ui")
                S.tabs.sendMessage((o = t.tab) == null ? void 0 : o.id, {
                    action: "toggleUI"
                });
            else if (s.action === "ht_trigger_script") {
                if (!((v = s == null ? void 0 : s.data) != null && v.length))
                    return;
                Se(t.tab.id, (w = s.data) == null ? void 0 : w.filter(f => f.startsWith("// EXEC"))).then(async f => {
                    f.forEach(async (h, q) => {
                        setTimeout( () => {
                            var O, E, L, a, l;
                            S.tabs.sendMessage(t.tab.id, {
                                action: "ht_send_feature_finished",
                                data: (O = h == null ? void 0 : h.result) == null ? void 0 : O.value
                            }),
                            (L = (E = h == null ? void 0 : h.result) == null ? void 0 : E.value) != null && L.success && W(`EXEC_CODE_${(l = (a = h == null ? void 0 : h.result) == null ? void 0 : a.value) != null && l.success ? "SUCCESS" : "FAILED"}`)
                        }
                        , (q + 1) * 300)
                    }
                    )
                }
                )
            } else if (s.action === "signIn") {
                const f = S.runtime.getURL("welcome.html?step=2&closeOnLogin=true");
                return S.tabs.create({
                    url: f,
                    active: !0
                }),
                n({
                    success: !0
                }),
                !0
            } else {
                if (s.action === "signOut")
                    return S.storage.local.remove("authToken").then( () => {
                        n({
                            success: !0
                        })
                    }
                    ),
                    !0;
                if (s.action === "isLogin") {
                    const f = await ue();
                    return n({
                        isLogin: !!f,
                        userInfo: f
                    }),
                    {
                        isLogin: !!f,
                        userInfo: f
                    }
                } else if (s.action === "generateShareUrl")
                    return Ze(s.data).then(f => {
                        n({
                            url: f
                        })
                    }
                    ).catch(f => {
                        console.error(f),
                        n({
                            url: null
                        })
                    }
                    ),
                    !0
            }
        }
        ),
        S.commands.onCommand.addListener(s => {
            s === "toggle-feature" && S.tabs.query({
                active: !0,
                currentWindow: !0
            }).then(t => {
                var n;
                console.log(t),
                (n = t == null ? void 0 : t[0]) != null && n.id && S.tabs.sendMessage(t == null ? void 0 : t[0].id, {
                    action: "toggleUI"
                })
            }
            )
        }
        ),
        S.action.onClicked.addListener(s => {
            s.id && S.tabs.sendMessage(s.id, {
                action: "toggleUI"
            })
        }
        ),
        S.runtime.onInstalled.addListener(async s => {
            try {
                if (s.reason === "install") {
                    await W("new_install");
                    const t = S.runtime.getURL("welcome.html");
                    await S.tabs.create({
                        url: t,
                        active: !0
                    })
                } else
                    s.reason === "update" && await W("extension_update")
            } catch (t) {
                console.error(t)
            }
        }
        )
    }
    );
    function mr() {}
    function ie(s, ...t) {}
    const ar = {
        debug: (...s) => ie(console.debug, ...s),
        log: (...s) => ie(console.log, ...s),
        warn: (...s) => ie(console.warn, ...s),
        error: (...s) => ie(console.error, ...s)
    };
    let be;
    try {
        be = nr.main(),
        be instanceof Promise && console.warn("The background's main() function return a promise, but it must be synchronous")
    } catch (s) {
        throw ar.error("The background crashed on startup!"),
        s
    }
    return be
}();
background;
