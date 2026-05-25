# Patterns Park Progress

Last updated: 2026-05-25

## Current Goal

Match the lamp-pattern tutorial/game layout from the provided reference screens.

## Implemented

- Full 16:9 game stage using `assets/game-bg.png`.
- Top instruction banner using `assets/ui/instruction-panel-robot.png`.
- Reference screens saved under `assets/screens/`:
  - `layout-01-complete-pattern.png`
  - `layout-02-game-start.png`
  - `layout-03-one-white.png`
  - `layout-04-one-wrong.png`
  - `layout-05-two-wrong.png`
  - `layout-06-two-white.png`
  - `layout-07-three-wrong.png`
  - `layout-08-three-white.png`
  - `layout-09-success.png`
  - `layout-10-four-white.png`
  - `layout-11-five-wrong.png`
  - `layout-12-five-white.png`
  - `layout-13-six-wrong.png`
  - `layout-14-six-white.png`
  - `layout-15-final-complete.png`
  - `layout-16-hint.png`
- First intro state shows `Complete the pattern.` with five lamp positions and no controls.
- Game state shows `Tap to add the bulbs`, three completed pattern poles, one editable pole, plus button, and centered check button.
- Normal/add-bulb gameplay always keeps the banner at `Tap to add the bulbs`.
- Plus button adds bulbs from zero through six.
- Added bulbs use white/neutral states during normal adding.
- Intro poles animate in one by one before the game starts.
- Pattern 2 starts directly in gameplay without replaying the intro screen.
- Wrong check uses red/pink pole states and a red glow on the same check button art.
- After two continuous wrong checks, a pulsing round bulb hint button appears and the banner changes to `Check the hint`.
- Wrong feedback is the only gameplay state that shows `Fixed four lights.` or `Fixed three lights.`
- Hint screen shows `Check the hint`, reveals the `7, 6, 5, 4, 3` lit poles one by one, and shows number boxes above each pole.
- Hint sequence plays child-robot browser SFX and spoken count cues such as `7 lights`, `6 lights`, and so on.
- Screen transitions now wait for instruction narration to finish before moving forward, with fallback timing if browser speech is unavailable.
- Instruction narration is used for intro, gameplay prompt, wrong feedback, success, hint, and final completion screens.
- Correct check shows success text and a green glow on the same check button art.
- Pattern 1 is `7, 6, 5 -> 4`.
- Pattern 2 is `6, 5, 4 -> 3`.
- Intro screens stay visible until the instruction voice finishes.
- After Pattern 1 success, Pattern 2 gameplay starts after the success voice finishes.
- After Pattern 2 success, the final completed-patterns screen appears after the success voice finishes.
- Final screen shows the completed `7, 6, 5, 4, 3` pattern with five aligned lit poles, no controls, and one-by-one pole entrance animation.
- Tolerance supports answer `+ 2`, so Pattern 1 can add to six and Pattern 2 can add to five.
- At the tolerance limit, the plus button is hidden and only the check button remains.
- On success, the plus button remains visible but disabled.
- Wrong checks show the red/pink feedback screen for one second.
- Checking below the current answer returns to the same previous white-bulb state after feedback.
- Checking above the current answer resets the editable pole back to zero after feedback.
- Plus and check button dimensions do not change on click or feedback states.
- Pole bases are aligned with per-asset baseline offsets, because the PNGs have different transparent padding.

## Important Assets

- Background: `assets/game-bg.png`
- Banner: `assets/ui/instruction-panel-robot.png`
- Hint button: `assets/ui/hint-bulb-button.png`
- Plus button: `assets/ui/plus.png`
- Check normal: `assets/ui/check-normal.png`
- Wrong/correct check states use CSS glow on `assets/ui/check-normal.png`.
- Hint and instruction SFX use browser Web Audio tones plus high-pitch speech synthesis, because no standalone audio files are currently in the project.
- Generated neutral two-bulb pole: `assets/lamps/pole-2-white.png`
- Lit three-bulb final/correct pole: `assets/lamps/pole-3-on.png`
- Pink four-bulb wrong pole: `assets/lamps/pole-4-pink.png`

## Main Files

- `index.html`
- `styles.css`
- `main.js`

## Current Interaction Flow

1. Show intro layout and narrate: `Complete the pattern.`
2. Auto-start game layout after the intro narration finishes.
3. Player taps plus to add bulbs.
4. Check button appears after the first bulb.
5. If checked below the current answer, show red/pink wrong feedback, narrate the target count, then return to the same count.
6. After two continuous wrong checks, show the round bulb hint button and banner text `Check the hint`.
7. Tapping hint narrates `Check the hint`, then reveals and speaks each `7, 6, 5, 4, 3` step one by one before returning to gameplay.
8. If checked at the current answer, show success state.
9. After Pattern 1 success narration finishes, start Pattern 2 gameplay directly.
10. If player reaches the tolerance limit, hide plus and leave only check.
11. If checked above the current answer, show wrong feedback, narrate the target count, then reset to zero pole.
12. After Pattern 2 success narration finishes, show the final completion layout.

## Next Checks

- Visually compare spacing against the latest references in a browser.
- Fine tune per-state editable pole heights if any state is off by a few pixels.
- Decide whether the intro state should auto-advance or wait for a separate tutorial transition.
