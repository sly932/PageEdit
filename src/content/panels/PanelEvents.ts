import { Eddy } from '../../types/eddy';
import { StorageService } from '../../services/storageService';
import { PanelTooltip } from './PanelTooltip';
import { showConfirmDialog } from '../components/ConfirmDialog';

// 事件处理模块
export class PanelEvents {
    private static panel: HTMLDivElement | null = null;
    private static titleElement: HTMLSpanElement | null = null;
    private static dropdownButton: HTMLButtonElement | null = null;
    private static dropdownMenu: HTMLDivElement | null = null;
    private static newEddyButton: HTMLButtonElement | null = null;
    private static deleteButton: HTMLButtonElement | null = null;
    private static currentEddy: Eddy | null = null;
    private static isNewEddy: boolean = false;
    private static hasUnsavedChanges: boolean = false;
    private static isDropdownOpen: boolean = false;
    
    // 回调函数
    private static onNewEddy: (() => Promise<void>) | null = null;
    private static onSaveEddy: (() => Promise<void>) | null = null;
    private static onSwitchEddy: ((eddy: Eddy) => void) | null = null;
    private static onDeleteEddy: (() => Promise<void>) | null = null;
    private static floatingPanel: any = null; // 添加 FloatingPanel 引用

    static initialize(
        panel: HTMLDivElement,
        titleElement: HTMLSpanElement,
        dropdownButton: HTMLButtonElement,
        dropdownMenu: HTMLDivElement,
        newEddyButton: HTMLButtonElement,
        deleteButton: HTMLButtonElement,
        callbacks: {
            onNewEddy: () => Promise<void>;
            onSaveEddy: () => Promise<void>;
            onSwitchEddy: (eddy: Eddy) => void;
            onDeleteEddy: () => Promise<void>;
        },
        floatingPanel?: any // 添加 FloatingPanel 参数
    ) {
        PanelEvents.panel = panel;
        PanelEvents.titleElement = titleElement;
        PanelEvents.dropdownButton = dropdownButton;
        PanelEvents.dropdownMenu = dropdownMenu;
        PanelEvents.newEddyButton = newEddyButton;
        PanelEvents.deleteButton = deleteButton;
        PanelEvents.onNewEddy = callbacks.onNewEddy;
        PanelEvents.onSaveEddy = callbacks.onSaveEddy;
        PanelEvents.onSwitchEddy = callbacks.onSwitchEddy;
        PanelEvents.onDeleteEddy = callbacks.onDeleteEddy;
        PanelEvents.floatingPanel = floatingPanel; // 保存 FloatingPanel 引用
        
        PanelEvents.setupEddyEventHandlers();
    }

    static setCurrentEddy(eddy: Eddy, isNew: boolean = false) {
        PanelEvents.currentEddy = eddy;
        PanelEvents.isNewEddy = isNew;
        PanelEvents.hasUnsavedChanges = false;
        PanelEvents.updateTitle();
    }

    static setHasUnsavedChanges(hasChanges: boolean) {
        PanelEvents.hasUnsavedChanges = hasChanges;
    }

    // 添加公共方法检查下拉菜单状态
    static isDropdownOpenState(): boolean {
        return PanelEvents.isDropdownOpen;
    }

    // 添加公共方法刷新下拉菜单
    static async refreshDropdown(): Promise<void> {
        if (PanelEvents.isDropdownOpen) {
            await PanelEvents.openDropdown();
        }
    }

    private static setupEddyEventHandlers(): void {
        if (!PanelEvents.newEddyButton || !PanelEvents.dropdownButton || !PanelEvents.titleElement) {
            console.error('[PanelEvents] Required elements not found');
            return;
        }

        // 新建 Eddy 按钮事件
        PanelEvents.newEddyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (PanelEvents.onNewEddy) {
                await PanelEvents.onNewEddy();
            }
        });

        // 删除 Eddy 按钮事件
        if (PanelEvents.deleteButton) {
            PanelEvents.deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!PanelEvents.currentEddy || PanelEvents.currentEddy.id.startsWith('temp_')) return;

                const eddyName = PanelEvents.currentEddy.name;
                const confirmed = await showConfirmDialog({
                    icon: 'warning',
                    title: `Delete "${eddyName}"?`,
                    description: "This can't be undone.",
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                });
                if (confirmed) {
                    if (PanelEvents.onDeleteEddy) await PanelEvents.onDeleteEddy();
                }
            });
        }

        // 下拉按钮事件
        PanelEvents.dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            PanelEvents.toggleDropdown();
        });

        // 标题编辑事件
        PanelEvents.titleElement.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡
            // 只有不在编辑状态时才处理
            if (!PanelEvents.titleElement?.classList.contains('editing')) {
                console.log('[PanelEvents] Starting title edit mode');
                PanelEvents.titleElement?.focus();
                PanelEvents.titleElement?.classList.add('editing');
                PanelEvents.panel?.querySelector('.panel-header')?.classList.add('editing');
                // 将光标移到文本末尾
                const range = document.createRange();
                const selection = window.getSelection();
                if (PanelEvents.titleElement) {
                    range.selectNodeContents(PanelEvents.titleElement);
                    range.collapse(false); // 将光标移到末尾
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
            }
        });

        PanelEvents.titleElement.addEventListener('focus', () => {
            PanelEvents.titleElement?.classList.add('editing');
            PanelEvents.panel?.querySelector('.panel-header')?.classList.add('editing');
        });

        PanelEvents.titleElement.addEventListener('blur', async () => {
            PanelEvents.titleElement?.classList.remove('editing');
            PanelEvents.panel?.querySelector('.panel-header')?.classList.remove('editing');
            
            // 检查标题是否被修改
            if (PanelEvents.currentEddy) {
                const newName = PanelEvents.titleElement?.textContent?.trim() || '';
                
                // 验证标题不能为空（包括只包含空格的情况）
                if (!newName) {
                    // 如果标题为空，直接设置原名称而不调用updateTitle
                    if (PanelEvents.titleElement) {
                        PanelEvents.titleElement.textContent = PanelEvents.currentEddy.name;
                    }
                    return;
                }
                
                if (newName !== PanelEvents.currentEddy.name) {
                    console.log('[PanelEvents] Title changed from', PanelEvents.currentEddy.name, 'to', newName);
                    PanelEvents.hasUnsavedChanges = true;
                    // 同时设置 FloatingPanel 的状态
                    if (PanelEvents.floatingPanel && typeof PanelEvents.floatingPanel.setHasUnsavedChanges === 'function') {
                        PanelEvents.floatingPanel.setHasUnsavedChanges(true);
                    }
                    // 立即更新当前 Eddy 的名称
                    PanelEvents.currentEddy.name = newName;
                    if (PanelEvents.onSaveEddy) {
                        console.log('[PanelEvents] Calling onSaveEddy callback');
                        await PanelEvents.onSaveEddy();
                    }
                }
            }
        });

        // 处理中文输入法
        let isComposing = false;
        
        PanelEvents.titleElement.addEventListener('compositionstart', () => {
            isComposing = true;
        });
        
        PanelEvents.titleElement.addEventListener('compositionend', () => {
            isComposing = false;
        });

        PanelEvents.titleElement.addEventListener('keydown', async (e) => {
            // 如果正在使用中文输入法，不处理 Enter 键
            if (isComposing) {
                return;
            }
            
            if (e.key === 'Enter') {
                e.preventDefault();
                PanelEvents.titleElement?.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                PanelEvents.updateTitle(); // 恢复原名称
                PanelEvents.titleElement?.blur();
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (PanelEvents.dropdownMenu && !PanelEvents.dropdownMenu.contains(e.target as Node) && 
                PanelEvents.dropdownButton && !PanelEvents.dropdownButton.contains(e.target as Node)) {
                PanelEvents.closeDropdown();
            }
            
            // 如果标题正在编辑中，且点击的不是标题元素，则保存并退出编辑
            if (PanelEvents.titleElement?.classList.contains('editing') && 
                !PanelEvents.titleElement.contains(e.target as Node)) {
                console.log('[PanelEvents] Clicked outside title, saving and exiting edit mode');
                PanelEvents.titleElement.blur();
            }
        });
    }

    private static updateTitle(): void {
        if (PanelEvents.currentEddy && PanelEvents.titleElement) {
            PanelEvents.titleElement.textContent = PanelEvents.currentEddy.name;
        } else if (PanelEvents.titleElement) {
            PanelEvents.titleElement.textContent = 'PageEdit';
        }
    }

    // 下拉菜单相关方法
    private static async toggleDropdown(): Promise<void> {
        if (PanelEvents.isDropdownOpen) {
            PanelEvents.closeDropdown();
        } else {
            await PanelEvents.openDropdown();
        }
    }

    private static async openDropdown(): Promise<void> {
        if (!PanelEvents.dropdownMenu || !PanelEvents.dropdownButton) return;

        try {
            // 加载当前域名的所有 Eddy
            const currentDomain = window.location.hostname;
            const eddys = await StorageService.getEddysByDomain(currentDomain);
            
            console.log('[PanelEvents] Loading eddys for dropdown:', eddys.length, 'items');
            
            // 按照编辑时间倒序排序，最近编辑的在最上面
            const sortedEddys = eddys.sort((a, b) => b.updatedAt - a.updatedAt);
            
            // 清空下拉菜单
            PanelEvents.dropdownMenu.innerHTML = '';
            
            if (sortedEddys.length === 0) {
                // 如果没有 Eddy，显示提示
                const noEddyItem = document.createElement('div');
                noEddyItem.className = 'dropdown-item';
                noEddyItem.style.cursor = 'default';
                noEddyItem.style.color = 'rgb(156, 163, 175)';
                noEddyItem.textContent = 'No eddys found';
                PanelEvents.dropdownMenu.appendChild(noEddyItem);
            } else {
                // 添加所有 Eddy 到下拉菜单
                sortedEddys.forEach(eddy => {
                    const item = PanelEvents.createDropdownItem(eddy);
                    PanelEvents.dropdownMenu?.appendChild(item);
                });
            }
            
            // 显示下拉菜单
            PanelEvents.dropdownMenu.style.display = 'block';
            PanelEvents.dropdownButton.classList.add('open');
            PanelEvents.isDropdownOpen = true;
            
            console.log('[PanelEvents] Dropdown opened with', sortedEddys.length, 'eddys');
        } catch (error) {
            console.error('[PanelEvents] Error opening dropdown:', error);
        }
    }

    private static createDropdownItem(eddy: Eddy): HTMLDivElement {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // 如果是当前 Eddy，添加 current 类
        if (PanelEvents.currentEddy && PanelEvents.currentEddy.id === eddy.id) {
            item.classList.add('current');
        }
        
        // 创建名称元素
        const nameElement = document.createElement('span');
        nameElement.className = 'dropdown-item-name';
        nameElement.textContent = eddy.name;
        
        item.appendChild(nameElement);
        
        // 为下拉菜单项添加 tooltip，显示完整名称
        item.addEventListener('mouseenter', () => {
            PanelTooltip.showTooltip(item, eddy.name);
        });
        item.addEventListener('mouseleave', () => {
            PanelTooltip.hideTooltip();
        });
        
        // 添加点击事件
        item.addEventListener('click', async () => {
            if (PanelEvents.currentEddy && PanelEvents.currentEddy.id === eddy.id) {
                // 如果点击的是当前 Eddy，只关闭下拉菜单
                PanelEvents.closeDropdown();
                return;
            }
            
            console.log('[PanelEvents] Switching to eddy:', eddy.name, '(ID:', eddy.id, ')');
            
            if (PanelEvents.onSwitchEddy) {
                PanelEvents.onSwitchEddy(eddy);
            }
            
            // 关闭下拉菜单
            PanelEvents.closeDropdown();
        });
        
        return item;
    }

    private static closeDropdown(): void {
        if (PanelEvents.dropdownMenu && PanelEvents.dropdownButton) {
            PanelEvents.dropdownMenu.style.display = 'none';
            PanelEvents.dropdownButton.classList.remove('open');
            PanelEvents.isDropdownOpen = false;
        }
    }
} 