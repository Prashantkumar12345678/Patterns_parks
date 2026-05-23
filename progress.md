# Patterns Park Progress

Last updated: 2026-05-23

## Current Goal

Match the lamp-pattern tutorial/game layout from the provided reference screens.

## Implemented

- Full 16:9 game stage using `assets/game-bg.png`.
- Top instruction banner using `assets/ui/answer-panel.png`.
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
- Plus button adds bulbs from zero through six.
- Added bulbs use white/neutral states during normal adding.
- Intro poles animate in one by one before the game starts.
- Pattern 2 starts directly in gameplay without replaying the intro screen.
- Wrong check uses red/pink pole states and a red glow on the same check button art.
- After two continuous wrong checks, a hint button appears.
- Hint screen shows `Check the hint`, reveals the `7, 6, 5, 4, 3` lit poles one by one, and shows number boxes above each pole.
- Hint sequence plays browser SFX and spoken count cues such as `7 lights`, `6 lights`, and so on.
- Correct check shows success text and a green glow on the same check button art.
- Pattern 1 is `7, 6, 5 -> 4`.
- Pattern 2 is `6, 5, 4 -> 3`.
- Intro screens stay visible for 1.5 seconds.
- After Pattern 1 success, Pattern 2 gameplay starts automatically after 1.5 seconds.
- After Pattern 2 success, the final completed-patterns screen appears after 1.5 seconds.
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
- Banner: `assets/ui/answer-panel.png`
- Plus button: `assets/ui/plus.png`
- Check normal: `assets/ui/check-normal.png`
- Wrong/correct check states use CSS glow on `assets/ui/check-normal.png`.
- Hint SFX uses browser Web Audio tones and speech synthesis, because no standalone audio files are currently in the project.
- Generated neutral two-bulb pole: `assets/lamps/pole-2-white.png`
- Lit three-bulb final/correct pole: `assets/lamps/pole-3-on.png`
- Pink four-bulb wrong pole: `assets/lamps/pole-4-pink.png`

## Main Files

- `index.html`
- `styles.css`
- `main.js`

## Current Interaction Flow

1. Show intro layout: `Complete the pattern.`
2. Auto-start game layout after a short delay.
3. Player taps plus to add bulbs.
4. Check button appears after the first bulb.
5. If checked below the current answer, show red/pink wrong feedback for one second, then return to the same count.
6. After two continuous wrong checks, show the hint button.
7. Tapping hint plays the one-by-one `7, 6, 5, 4, 3` hint sequence, then returns to gameplay.
8. If checked at the current answer, show success state.
9. After Pattern 1 success, wait 1.5 seconds and start Pattern 2 gameplay directly.
10. If player reaches the tolerance limit, hide plus and leave only check.
11. If checked above the current answer, show wrong feedback for one second, then reset to zero pole.
12. After Pattern 2 success, wait 1.5 seconds and show the final completion layout.

## Next Checks

- Visually compare spacing against the latest references in a browser.
- Fine tune per-state editable pole heights if any state is off by a few pixels.
- Decide whether the intro state should auto-advance or wait for a separate tutorial transition.
