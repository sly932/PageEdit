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
    private static isDropdownOpen: boolean = false;
    
    // 回调函数
    private static onNewEddy: (() => Promise<void>) | null = null;
    private static onSaveEddy: (() => Promise<void>) | null = null;
    private static onSwitchEddy: ((eddyId: string) => void) | null = null;
    private static onDeleteEddy: (() => Promise<void>) | null = null;
    private static onTitleUpdate: ((newTitle: string) => Promise<void>) | null = null;

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
            onSwitchEddy: (eddyId: string) => void;
            onDeleteEddy: () => Promise<void>;
            onTitleUpdate: (newTitle: string) => Promise<void>;
        }
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
        PanelEvents.onTitleUpdate = callbacks.onTitleUpdate;
        
        PanelEvents.setupEddyEventHandlers();
    }

    static updateTitle(name: string): void {
        if (PanelEvents.titleElement) {
            PanelEvents.titleElement.textContent = name;
        }
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

                const eddyName = PanelEvents.titleElement?.textContent || 'this Eddy';
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
            
            const newName = PanelEvents.titleElement?.textContent?.trim() || '';
            
            if (!newName) {
                // Title cannot be empty, revert logic should be handled by ContentManager
                console.warn("[PanelEvents] Title cannot be empty.");
                // Potentially call a callback to revert the title
                return;
            }
            
            if (PanelEvents.onTitleUpdate) {
                await PanelEvents.onTitleUpdate(newName);
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
                if (PanelEvents.titleElement) {
                    // Revert to original title logic to be handled by ContentManager
                    PanelEvents.titleElement.blur();
                }
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
        item.dataset.eddyId = eddy.id;

        const icon = document.createElement('span');
        icon.className = 'dropdown-item-icon';
        if (eddy.lastUsed) {
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            `;
        }
        item.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'dropdown-item-text';
        text.textContent = eddy.name;
        item.appendChild(text);

        item.addEventListener('click', () => {
            if (PanelEvents.onSwitchEddy) {
                PanelEvents.onSwitchEddy(eddy.id);
                PanelEvents.closeDropdown();
            }
        });
        
        return item;
    }

    private static closeDropdown(): void {
        if (!PanelEvents.dropdownMenu || !PanelEvents.dropdownButton) return;
        PanelEvents.dropdownMenu.style.display = 'none';
        PanelEvents.dropdownButton.classList.remove('open');
        PanelEvents.isDropdownOpen = false;
    }

    static updateDropdown(eddys: Eddy[], onSwitch: (eddyId: string) => void, activeEddyId?: string): void {
        if (!PanelEvents.dropdownMenu) return;

        PanelEvents.dropdownMenu.innerHTML = ''; // 清空

        if (eddys.length === 0) {
            const noEddyItem = document.createElement('div');
            noEddyItem.className = 'dropdown-item no-select';
            noEddyItem.textContent = 'No eddys for this domain';
            PanelEvents.dropdownMenu.appendChild(noEddyItem);
            return;
        }
        
        const sortedEddys = [...eddys].sort((a, b) => b.updatedAt - a.updatedAt);

        sortedEddys.forEach(eddy => {
            const item = PanelEvents.createDropdownItem(eddy);
            item.onclick = () => {
                onSwitch(eddy.id);
                PanelEvents.closeDropdown();
            };
            if (eddy.id === activeEddyId) {
                item.classList.add('active');
            }
            PanelEvents.dropdownMenu?.appendChild(item);
        });
    }
} 