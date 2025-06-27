# Feature Implementation Plan: Enable/Disable Eddy & View Original Style

## 1. Goal

Implement two new user-facing features based on the new, refactored content script architecture:
1.  A persistent "Enable/Disable" toggle for each Eddy, allowing users to turn an entire set of styles on or off.
2.  A temporary "View Original Style" button that, on hover, shows the page without the Eddy's styles.

## 2. Overall Strategy

The core of this implementation lies in enhancing `StyleService` with the ability to remove or re-apply styles without altering the underlying state (i.e., the undo/redo history). The `ContentManager` will then act as the orchestrator, invoking these new `StyleService` capabilities in response to different UI events from `FloatingPanel`.

This approach ensures a clean separation of concerns and high reusability of the core styling logic.

### Architecture Adherence
- **`FloatingPanel` (View)**: Remains a "dumb" component. It will only render the new UI elements (toggle switch, button) and emit corresponding user events (`toggle_eddy_enabled`, `view_original_style`, `restore_eddy_style`). It holds no business logic.
- **`ContentManager` (Controller)**: Acts as the central controller. It will handle the events from the panel, manage the persistent `isEnabled` state on the `currentEddy`, and decide when to call `StyleService` and whether to save the state.
- **`StyleService` (Engine)**: The powerhouse for DOM manipulation. It will be enhanced with the atomic operations for clearing and reapplying styles, completely decoupled from the "why" behind those actions.
- **`Eddy` (Model)**: The data model will be extended to support the new persistent state.

---

## Part 1: "Enable/Disable Eddy" Feature

This feature introduces a persistent state for each Eddy.

### Step 1: Data Model Extension (`Eddy` Type)

-   **File**: `src/types/eddy.ts`
-   **Change**: Add a new boolean field `isEnabled` to the `Eddy` interface. This field will track whether the Eddy's styles should be active.
    ```typescript
    export interface Eddy {
        id: string;
        name: string;
        // ... other fields
        isEnabled: boolean; // New field
        draftContent?: string;
    }
    ```
-   **Default Behavior**: When creating a new Eddy or migrating an old one from storage that lacks this field, it should default to `true`. `StorageService` must be updated to correctly save and load this new field.

### Step 2: UI Implementation (`FloatingPanel`)

1.  **Add Toggle Switch**: Using `PanelRenderer`, create an iOS-style toggle switch UI element. This should be placed logically next to the Eddy title in the panel's header.
2.  **UI State Method**: `FloatingPanel` will expose a new method, `updateIsEnabled(isEnabled: boolean)`, which will be called by the `ContentManager` to visually update the toggle's on/off state.
3.  **Emit Event**: When the user clicks the toggle switch, `FloatingPanel` will use its `eventCallback` to send a single, clear event to the `ContentManager`:
    ```typescript
    this.eventCallback({ type: 'toggle_eddy_enabled' });
    ```

### Step 3: Core Logic (`ContentManager` & `StyleService`)

1.  **Enhance `StyleService`**:
    -   Create two crucial new public methods. These methods **must not** modify the `globalState` (the history stack for undo/redo).
        -   `clearAllAppliedStyles()`: This method iterates through the styles defined in the `currentSnapshot` of the `globalState` and removes them from the webpage, restoring the original element styles.
        -   `reapplyAllAppliedStyles()`: This method re-applies all styles from the `currentSnapshot` back onto the webpage.

2.  **Update `ContentManager`**:
    -   The `handlePanelEvent` method will be extended with a new `case` to handle the `'toggle_eddy_enabled'` event.
    -   **Processing Logic**:
        a.  Upon receiving the event, flip the boolean state on the current Eddy: `this.currentEddy.isEnabled = !this.currentEddy.isEnabled;`
        b.  Invoke the appropriate `StyleService` method based on the new state:
            -   If `isEnabled` is now `false`, call `StyleService.clearAllAppliedStyles()`.
            -   If `isEnabled` is now `true`, call `StyleService.reapplyAllAppliedStyles()`.
        c.  Persist the change by calling `this.saveCurrentEddyToStorage()`.
        d.  Update the UI by calling the panel's new method: `this.floatingBall.updateIsEnabled(this.currentEddy.isEnabled)`.

3.  **Auto-Enable Logic**:
    -   For a better user experience, any action that modifies the styles (`apply`, `undo`, `redo`) should automatically re-enable a disabled Eddy.
    -   In the `ContentManager` methods that handle these events, add a check at the beginning:
    ```typescript
    if (this.currentEddy && !this.currentEddy.isEnabled) {
        this.currentEddy.isEnabled = true;
        this.floatingBall.updateIsEnabled(true);
        // No need to call reapply, as the subsequent logic will handle the style update.
        // But we do need to save this implicit state change.
        await this.saveCurrentEddyToStorage(); 
    }
    // ... continue with existing apply/undo/redo logic
    ```

---

## Part 2: "View Original Style" Button

This feature is a temporary, view-only action that leverages the `StyleService` enhancements, with added intelligence to respect the Eddy's enabled state.

### Step 1: UI Implementation (`FloatingPanel`)

1.  **Add Icon Button**: Add a new button to the toolbar using an "eye" icon, representing "View Original".
2.  **Dynamic UI States**: The button's appearance and tooltip must dynamically update based on the Eddy's `isEnabled` state. `FloatingPanel` will need a method like `updateViewOriginalButtonState(isEnabled: boolean)` called by `ContentManager`.
    -   **When Enabled**: The button is at full opacity. The tooltip on hover should read "Hold to view original page".
    -   **When Disabled**: The button should be semi-transparent (e.g., `opacity: 0.5`) with `cursor: not-allowed`. Its tooltip should change to "Eddy is disabled" to inform the user why it's inactive.
3.  **Bind Hover Events**: Attach `mouseenter` and `mouseleave` event listeners. These will always fire, but the `ContentManager` will decide whether to act on them.
    -   On `mouseenter`, emit the event: `{ type: 'view_original_style' }`
    -   On `mouseleave`, emit the event: `{ type: 'restore_eddy_style' }`

### Step 2: Logic Implementation (`ContentManager`)

-   The logic in `handlePanelEvent` for these events must be conditional.
-   **`case 'view_original_style'`**:
    -   Add a guard clause at the beginning: `if (!this.currentEddy || !this.currentEddy.isEnabled) return;`
    -   If the guard clause passes (i.e., the Eddy is enabled), then call `StyleService.clearAllAppliedStyles()`.
-   **`case 'restore_eddy_style'`**:
    -   Add a similar guard clause: `if (!this.currentEddy || !this.currentEddy.isEnabled) return;`
    -   If the Eddy was enabled when the hover started, then call `StyleService.reapplyAllAppliedStyles()`.
-   **Crucial Distinction**: These actions remain purely cosmetic and temporary. They **do not** modify `currentEddy.isEnabled` and **do not** trigger a save to storage.

## Summary Table

| Feature             | `FloatingPanel` (View)                                     | `ContentManager` (Controller)                                         | `StyleService` (Engine)     | `Eddy` (Model)           |
|---------------------|------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------|--------------------------|
| **Enable/Disable**  | Add toggle, emit `toggle_eddy_enabled` event               | Handle event, toggle `isEnabled`, call `StyleService`, save, update UI | Implements `clear`/`reapply` methods     | Adds `isEnabled` field    |
| **View Original**   | Add "eye" button with dynamic state/tooltip, emit hover events | Conditionally handle events based on `isEnabled`, call `StyleService` (no save) | Reuses `clear`/`reapply` methods    | No change                |

</rewritten_file> 