Implementation Plan - Change Purple Borders to White

1.  **Modify `index.html`**:
    *   Update `.neo-btn-primary` class styles.
    *   Change `border-color` from `#8b5cf6` to `#ffffff`.
    *   Change `box-shadow` rgba values from purple (`139, 92, 246`) to white (`255, 255, 255`).

2.  **Modify `components/MinerControls.tsx`**:
    *   Change container border color: `border-purple-500/40` -> `border-white/40`.
    *   Change container shadow: `rgba(139,92,246,0.1)` -> `rgba(255,255,255,0.1)`.
    *   Update other purple elements (pulse effects, gradients, text highlights) to white to maintain consistency.

3.  **Modify `components/CaptchaChallenge.tsx`**:
    *   Update canvas stroke styles in `useEffect` (lines generation) to use white rgba.
    *   Update `group-hover:border-purple-500/30` to `group-hover:border-white/30`.
    *   Update `focus:ring-purple-500/50` to `focus:ring-white/50`.

4.  **Modify `App.tsx`**:
    *   Update specific Tailwind classes (e.g., selection color, loading spinner) from `purple-500` to `white` or `zinc-200`.
