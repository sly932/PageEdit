import { Modification } from '../../types';

/**
 * 历史记录管理工具类
 * 管理修改历史记录
 */
export class HistoryManager {
  private static readonly STORAGE_KEY = 'modificationHistory';
  private static readonly MAX_HISTORY_LENGTH = 50;

  /**
   * 保存修改记录
   * @param modification 修改记录
   * @returns 是否保存成功
   */
  static async saveModification(modification: Modification): Promise<boolean> {
    try {
      // 获取现有历史记录
      const history = await this.getHistory();
      
      // 添加新记录
      history.push(modification);
      
      // 如果超过最大长度，移除最旧的记录
      if (history.length > this.MAX_HISTORY_LENGTH) {
        history.shift();
      }
      
      // 保存到存储
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      
      return true;
    } catch (error) {
      console.error('Failed to save modification:', error);
      return false;
    }
  }

  /**
   * 获取修改历史
   * @returns 修改历史记录数组
   */
  static async getHistory(): Promise<Modification[]> {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY]);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * 获取最后一次修改
   * @returns 最后一次修改记录
   */
  static async getLastModification(): Promise<Modification | null> {
    try {
      const history = await this.getHistory();
      return history.length > 0 ? history[history.length - 1] : null;
    } catch (error) {
      console.error('Failed to get last modification:', error);
      return null;
    }
  }

  /**
   * 清除历史记录
   * @returns 是否清除成功
   */
  static async clearHistory(): Promise<boolean> {
    try {
      await chrome.storage.local.remove([this.STORAGE_KEY]);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  /**
   * 撤销最后一次修改
   * @returns 被撤销的修改记录
   */
  static async undoLastModification(): Promise<Modification | null> {
    try {
      const history = await this.getHistory();
      if (history.length === 0) {
        return null;
      }

      // 移除最后一次修改
      const lastModification = history.pop();
      
      // 更新存储
      await chrome.storage.local.set({ [this.STORAGE_KEY]: history });
      
      return lastModification;
    } catch (error) {
      console.error('Failed to undo last modification:', error);
      return null;
    }
  }
} 