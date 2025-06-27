# Feature Implementation Plan: Enable/Disable Eddy & View Original Style

## 1. Status: ✅ Completed with Refinements

This feature set has been fully implemented, tested, and refined. The initial plan was largely followed, but several critical bugs were discovered and fixed during the development process. These fixes led to significant improvements in the robustness of `ContentManager` and `StyleService`.

---

## 2. Key Implementation Details & Bug Fixes

This section documents the critical learnings and architectural adjustments made during implementation.

### Bug Fix: Data Loss on Refresh for Disabled Eddys
- **Problem**: If an Eddy was set to `isEnabled: false` and the page was refreshed, its style data would be permanently lost upon the next save.
- **Root Cause**: When loading a disabled Eddy, `ContentManager` would skip calling `StyleService.restoreFromEddy`. As a result, the `StyleService`'s internal state remained empty. The next save operation would then overwrite the stored Eddy data with this empty state.
- **Solution**: The logic was fundamentally changed.
    1.  `StyleService.restoreFromEddy` was refactored to accept an `options` object with an `applyToDOM: boolean` flag.
    2.  This separates the act of loading style data into memory from applying it to the DOM.
    3.  `ContentManager` now **always** calls `StyleService.restoreFromEddy` for every loaded Eddy to populate the service's memory, but it sets `applyToDOM: false` if `currentEddy.isEnabled` is false. This ensures the data is always in memory, preventing data loss, while respecting the enabled/disabled state.

### Bug Fix: Data Corruption When Deleting an Eddy
- **Problem**: After deleting one Eddy (e.g., `e1`), the next selected Eddy (e.g., `e2`) would have its style data wiped clean on the subsequent save.
- **Root Cause**: The `handleDeleteEddy` method in `ContentManager` contained a redundant `resetState()` call. The sequence was: Delete `e1` from storage -> `handleSwitchEddy` loads `e2`'s data into `StyleService` -> `resetState()` was called, which cleared out `e2`'s just-loaded data.
- **Solution**: The redundant `resetState()` call was removed from `handleDeleteEddy`, ensuring that the state of the newly selected Eddy is preserved.

### Bug Fix: Saving Temporary Eddy When Deleting the Last Eddy
- **Problem**: When the user deleted the very last Eddy, the new temporary "template" Eddy was incorrectly being saved to storage.
- **Root Cause**: `handleDeleteEddy` called `resetState()`, which at the time, would unconditionally save the current state (the new temporary Eddy) to storage.
- **Solution**: `resetState()` was refactored into two distinct methods:
    -   `resetState()`: Resets the state in memory **without** saving to storage.
    -   `resetStateAndSaveToStorage()`: Resets the state **and** saves to storage.
-   `handleDeleteEddy` was updated to use the non-saving `resetState()` when creating the new template Eddy.

### Refinement: Robust CSS Merging Logic
- **Problem**: The original `mergeCSSProperties` function in `StyleService` was not robust and could fail to update styles correctly, especially with complex existing `style` attributes.
- **Solution**: The function was rewritten with a more reliable "find and replace, or add if not found" algorithm. It now correctly parses existing CSS properties in a `style` attribute, updates them if they exist, or appends the new property if it doesn't. This makes style modifications more predictable and reliable.

---

## 3. Goal

Implement two new user-facing features based on the new, refactored content script architecture:
1.  A persistent "Enable/Disable" toggle for each Eddy, allowing users to turn an entire set of styles on or off.
2.  A temporary "View Original Style" button that, on hover, shows the page without the Eddy's styles.

## 4. Overall Strategy

The core of this implementation lies in enhancing `StyleService` with the ability to remove or re-apply styles without altering the underlying state (i.e., the undo/redo history). The `ContentManager` will then act as the orchestrator, invoking these new `StyleService` capabilities in response to different UI events from `FloatingPanel`.

This approach ensures a clean separation of concerns and high reusability of the core styling logic.

### Architecture Adherence
- **`FloatingPanel` (View)**: Remains a "dumb" component. It will only render the new UI elements (toggle switch, button) and emit corresponding user events (`toggle_eddy_enabled`, `view_original_style`, `restore_eddy_style`). It holds no business logic.
- **`ContentManager` (Controller)**: Acts as the central controller. It will handle the events from the panel, manage the persistent `isEnabled` state on the `currentEddy`, and decide when to call `StyleService` and whether to save the state.
- **`StyleService` (Engine)**: The powerhouse for DOM manipulation. It was enhanced with the atomic operations for clearing and reapplying styles, completely decoupled from the "why" behind those actions.
- **`Eddy` (Model)**: The data model was extended to support the new persistent state.

---

## 5. Part 1: "Enable/Disable Eddy" Feature

This feature introduces a persistent state for each Eddy.

### Step 1: Data Model Extension (`Eddy` Type) - ✅ Implemented

-   **File**: `src/types/eddy.ts`
-   **Change**: Added a new boolean field `isEnabled` to the `Eddy` interface. This field tracks whether the Eddy's styles should be active.
    ```typescript
    export interface Eddy {
        id: string;
        name: string;
        // ... other fields
        isEnabled: boolean; // New field
        draftContent?: string;
    }
    ```
-   **Default Behavior**: ✅ Implemented. When creating a new Eddy or migrating an old one from storage that lacks this field, it now defaults to `true`. `StorageService` was updated to correctly save and load this new field.

### Step 2: UI Implementation (`FloatingPanel`) - ✅ Implemented

1.  **Add Toggle Switch**: ✅ Implemented. A toggle switch was added to the panel header.
2.  **UI State Method**: ✅ Implemented. `FloatingPanel` exposes `updateIsEnabled(isEnabled: boolean)` which is called by `ContentManager` to visually update the toggle's on/off state.
3.  **Emit Event**: ✅ Implemented. When the user clicks the toggle switch, `FloatingPanel` emits the `toggle_eddy_enabled` event.

### Step 3: Core Logic (`ContentManager` & `StyleService`) - ✅ Implemented

1.  **Enhance `StyleService`**: ✅ Implemented.
    -   Created two crucial new public methods. These methods do not modify the `globalState` (the history stack for undo/redo).
        -   `clearAllAppliedStyles()`: Iterates through the styles in the `currentSnapshot` and removes their effects from the DOM.
        -   `reapplyAllAppliedStyles()`: Re-applies all styles from the `currentSnapshot` back onto the webpage.

2.  **Update `ContentManager`**: ✅ Implemented.
    -   `handlePanelEvent` was extended with a `case` for `'toggle_eddy_enabled'`.
    -   **Processing Logic**:
        a.  Upon receiving the event, the state on the current Eddy is flipped: `this.currentEddy.isEnabled = !this.currentEddy.isEnabled;`
        b.  The UI is updated immediately: `this.floatingBall.updateIsEnabled(this.currentEddy.isEnabled)`.
        c.  The appropriate `StyleService` method is called based on the new state (`clearAllAppliedStyles` or `reapplyAllAppliedStyles`).
        d.  The change is persisted: `this.saveCurrentEddyToStorage()`.

3.  **Auto-Enable Logic**: ✅ Implemented as designed.
    -   Any action that modifies styles (`apply`, `undo`, `redo`) now automatically re-enables a disabled Eddy.
    -   The check was added to the relevant `ContentManager` methods.

---

## 6. Part 2: "View Original Style" Button

This feature is a temporary, view-only action that leverages the `StyleService` enhancements, with added intelligence to respect the Eddy's enabled state.

### Step 1: UI Implementation (`FloatingPanel`) - ✅ Implemented

1.  **Add Icon Button**: ✅ Implemented. An "eye" icon button was added to the toolbar.
2.  **Dynamic UI States**: ✅ Implemented. The button's appearance and tooltip dynamically update based on the Eddy's `isEnabled` state via the `updateViewOriginalButtonState(isEnabled: boolean)` method.
    -   **When Enabled**: The button is active. Tooltip: "Hold to view original page".
    -   **When Disabled**: The button is inactive (`opacity: 0.5`, `cursor: not-allowed`). Tooltip: "Eddy is disabled".
3.  **Bind Hover Events**: ✅ Implemented. `mouseenter` and `mouseleave` listeners were attached.
    -   On `mouseenter`, emits: `{ type: 'view_original_style' }`
    -   On `mouseleave`, emits: `{ type: 'restore_eddy_style' }`

### Step 2: Logic Implementation (`ContentManager`) - ✅ Implemented

-   The logic in `handlePanelEvent` for these events is conditional.
-   **`case 'view_original_style'`**:
    -   A guard clause was added: `if (!this.currentEddy || !this.currentEddy.isEnabled) return;`
    -   If the Eddy is enabled, it calls `StyleService.clearAllAppliedStyles()`.
-   **`case 'restore_eddy_style'`**:
    -   A similar guard clause was added: `if (!this.currentEddy || !this.currentEddy.isEnabled) return;`
    -   If the Eddy is enabled, it calls `StyleService.reapplyAllAppliedStyles()`.
-   **Crucial Distinction**: ✅ Correctly implemented. These actions are purely cosmetic and temporary. They **do not** modify `currentEddy.isEnabled` and **do not** trigger a save to storage.

## 7. Summary Table

| Feature             | `FloatingPanel` (View)                                     | `ContentManager` (Controller)                                         | `StyleService` (Engine)     | `Eddy` (Model)           |
|---------------------|------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------|--------------------------|
| **Enable/Disable**  | Added toggle, emits `toggle_eddy_enabled` event               | Handled event, toggled `isEnabled`, called `StyleService`, saved, updated UI | Implemented `clear`/`reapply` methods     | Added `isEnabled` field    |
| **View Original**   | Added "eye" button with dynamic state/tooltip, emits hover events | Conditionally handled events based on `isEnabled`, called `StyleService` (no save) | Reused `clear`/`reapply` methods    | No change                |

</rewritten_file> 