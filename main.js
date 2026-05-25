const stage = document.querySelector(".stage");
const addBulbButton = document.querySelector("#addBulbButton");
const hintButton = document.querySelector("#hintButton");
const checkButton = document.querySelector("#checkButton");
const checkImage = checkButton.querySelector("img");
const buildLamp = document.querySelector("#buildLamp");
const finalLamp = document.querySelector("#introBlankLamp");
const instructionText = document.querySelector("#instructionText");
const hintCounts = Array.from(document.querySelectorAll(".hint-count"));
const patternLamps = [
  document.querySelector("#patternLampOne"),
  document.querySelector("#patternLampTwo"),
  document.querySelector("#patternLampThree"),
];
const hintLamps = [...patternLamps, buildLamp, finalLamp];

const HINT_WRONG_THRESHOLD = 2;
const SCREEN_AFTER_SPEECH_DELAY_MS = 450;
const HINT_RETURN_DELAY_MS = 900;

const checkAssets = {
  normal: "assets/ui/check-normal.png",
};

const lampAssets = {
  0: {
    image: "assets/lamps/pole-0-off.png",
    wrongImage: "assets/lamps/pole-0-off.png",
    correctImage: "assets/lamps/pole-0-off.png",
    label: "Empty lamp post",
    height: "30.6%",
    bottom: "17.85%",
  },
  1: {
    image: "assets/lamps/pole-1-off.png",
    wrongImage: "assets/lamps/pole-1-pink.png",
    correctImage: "assets/lamps/pole-1-off.png",
    label: "Lamp post with one bulb",
    height: "33.8%",
    bottom: "17.68%",
  },
  2: {
    image: "assets/lamps/pole-2-white.png",
    wrongImage: "assets/lamps/pole-2-pink.png",
    correctImage: "assets/lamps/pole-2-white.png",
    label: "Lamp post with two bulbs",
    height: "35.1%",
    bottom: "17.84%",
  },
  3: {
    image: "assets/lamps/pole-3-off.png",
    wrongImage: "assets/lamps/pole-3-pink.png",
    correctImage: "assets/lamps/pole-3-on.png",
    label: "Lamp post with three bulbs",
    height: "35.2%",
    bottom: "17.13%",
  },
  4: {
    image: "assets/lamps/pole-4-off.png",
    wrongImage: "assets/lamps/pole-4-pink.png",
    correctImage: "assets/lamps/pole-4-on.png",
    label: "Lamp post with four bulbs",
    height: "35.5%",
    bottom: "17.75%",
  },
  5: {
    image: "assets/lamps/pole-5-off.png",
    wrongImage: "assets/lamps/pole-5-on.png",
    correctImage: "assets/lamps/pole-5-off.png",
    label: "Lamp post with five bulbs",
    height: "35.8%",
    bottom: "17.97%",
  },
  6: {
    image: "assets/lamps/pole-6-off.png",
    wrongImage: "assets/lamps/pole-6-pink.png",
    correctImage: "assets/lamps/pole-6-off.png",
    label: "Lamp post with six bulbs",
    height: "36.2%",
    bottom: "19.08%",
  },
};

const patternAssetMeta = {
  3: {
    image: "assets/lamps/pole-3-on.png",
    label: "Lamp post with three lights",
    playHeight: "35.2%",
    playBottom: "17.13%",
    introHeight: "35.2%",
    introBottom: "17.13%",
  },
  4: {
    image: "assets/lamps/pole-4-on.png",
    label: "Lamp post with four lights",
    playHeight: "35.5%",
    playBottom: "17.75%",
    introHeight: "37.2%",
    introBottom: "17.75%",
  },
  5: {
    image: "assets/lamps/lamp-5-on.png",
    label: "Lamp post with five lights",
    playHeight: "31.5%",
    playBottom: "18.95%",
    introHeight: "34.8%",
    introBottom: "18.95%",
  },
  6: {
    image: "assets/lamps/lamp-6-on.png",
    label: "Lamp post with six lights",
    playHeight: "38.3%",
    playBottom: "18.95%",
    introHeight: "39%",
    introBottom: "18.95%",
  },
  7: {
    image: "assets/lamps/lamp-7-on.png",
    label: "Lamp post with seven lights",
    playHeight: "40.1%",
    playBottom: "17.4%",
    introHeight: "43.2%",
    introBottom: "17.2%",
  },
};

const patterns = [
  {
    sequence: [7, 6, 5],
    answer: 4,
  },
  {
    sequence: [6, 5, 4],
    answer: 3,
  },
];

const slotNames = ["one", "two", "three"];
const finalSequence = [7, 6, 5, 4, 3];
const numberWords = {
  3: "three",
  4: "four",
};
let patternIndex = 0;
let currentBulbs = 0;
let isComplete = false;
let isFinalScreen = false;
let isHintScreen = false;
let wrongStreak = 0;
let audioContext;
let narrationTimer;
let narrationToken = 0;
let screenFlowToken = 0;
let resetTimer;
let introTimer;
let successTimer;
let hintTimers = [];

function getPattern() {
  return patterns[patternIndex] ?? patterns[patterns.length - 1];
}

function getBuildState() {
  return lampAssets[currentBulbs] ?? lampAssets[0];
}

function getMaxToleranceBulbs() {
  return getPattern().answer + 2;
}

function getAnswerText() {
  return numberWords[getPattern().answer] ?? getPattern().answer;
}

function shouldShowHintPrompt() {
  return wrongStreak >= HINT_WRONG_THRESHOLD && !isComplete && !isFinalScreen && !isHintScreen;
}

function estimateSpeechMs(text) {
  return Math.max(1300, text.length * 72 + 650);
}

function getRobotVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => /child|kid|zira|samantha|female|google us english/i.test(voice.name)) ??
    voices.find((voice) => /^en/i.test(voice.lang)) ??
    voices[0] ??
    null
  );
}

function getAudioContext() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    audioContext = new AudioCtor();
  }

  return audioContext;
}

function unlockAudio() {
  const context = getAudioContext();

  if (context?.state === "suspended") {
    context.resume();
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}

function playTone(frequency, duration = 0.12, delay = 0, type = "sine", volume = 0.04) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playAddSfx() {
  playTone(660, 0.08, 0, "triangle", 0.035);
}

function playWrongSfx() {
  playTone(180, 0.1, 0, "sawtooth", 0.04);
  playTone(128, 0.16, 0.09, "sawtooth", 0.035);
}

function playCorrectSfx() {
  playTone(520, 0.09, 0, "triangle", 0.04);
  playTone(720, 0.11, 0.1, "triangle", 0.04);
  playTone(940, 0.14, 0.22, "triangle", 0.035);
}

function playHintStepSfx(index) {
  playTone(460 + index * 60, 0.09, 0, "triangle", 0.035);
  playTone(620 + index * 54, 0.12, 0.1, "sine", 0.028);
}

function playRobotCue() {
  playTone(920, 0.045, 0, "square", 0.018);
  playTone(1320, 0.045, 0.055, "square", 0.014);
}

function cancelNarration() {
  window.clearTimeout(narrationTimer);
  narrationTimer = undefined;
  narrationToken += 1;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakRobot(text, options = {}) {
  const { fallbackMs = estimateSpeechMs(text), afterMs = 0, cancelPrevious = true } = options;

  if (cancelPrevious) {
    cancelNarration();
  }

  const token = ++narrationToken;

  return new Promise((resolve) => {
    let isDone = false;

    const finish = () => {
      if (isDone || token !== narrationToken) {
        return;
      }

      isDone = true;
      window.clearTimeout(narrationTimer);
      narrationTimer = undefined;

      if (afterMs > 0) {
        window.setTimeout(resolve, afterMs);
        return;
      }

      resolve();
    };

    playRobotCue();
    narrationTimer = window.setTimeout(finish, fallbackMs);

    if (!("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getRobotVoice();

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.82;
    utterance.pitch = 1.75;
    utterance.volume = 0.95;
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

function playInstruction(text, options = {}) {
  speakRobot(text, {
    fallbackMs: estimateSpeechMs(text),
    afterMs: 0,
    ...options,
  });
}

function clearHintTimers() {
  hintTimers.forEach((timer) => window.clearTimeout(timer));
  hintTimers = [];
  cancelNarration();
}

function clearHintReveal() {
  hintLamps.forEach((lamp) => lamp.classList.remove("is-hint-revealed"));
  hintCounts.forEach((count) => count.classList.remove("is-hint-revealed"));
}

function wait(ms) {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    hintTimers.push(timer);
  });
}

function preloadAssets() {
  Object.values(checkAssets).forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  Object.values(lampAssets).forEach((state) => {
    [state.image, state.wrongImage, state.correctImage].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  });

  Object.values(patternAssetMeta).forEach((state) => {
    const image = new Image();
    image.src = state.image;
  });
}

function setBuildHeight(state) {
  buildLamp.style.setProperty("--build-height", state.height);
  buildLamp.style.setProperty("--build-height-mobile", state.height);
  buildLamp.style.setProperty("--build-bottom", state.bottom);
}

function setPatternLamps(sequence = getPattern().sequence) {
  sequence.slice(0, patternLamps.length).forEach((count, index) => {
    const image = patternLamps[index];
    const meta = patternAssetMeta[count];
    const slot = slotNames[index];

    image.src = meta.image;
    image.alt = meta.label;
    image.style.setProperty(`--slot-${slot}-height`, meta.playHeight);
    image.style.setProperty(`--slot-${slot}-bottom`, meta.playBottom);
    image.style.setProperty(`--slot-${slot}-intro-height`, meta.introHeight);
    image.style.setProperty(`--slot-${slot}-intro-bottom`, meta.introBottom);
  });
}

function setControls(mode) {
  const isIntro = mode === "intro";
  const isFinal = mode === "final";
  const isHint = mode === "hint";
  const isWrong = mode === "wrong";
  const isAtToleranceLimit = currentBulbs >= getMaxToleranceBulbs();
  const showCheck = currentBulbs > 0 && !isIntro && !isFinal && !isHint;
  const showHint = wrongStreak >= HINT_WRONG_THRESHOLD && !isIntro && !isFinal && !isHint && !isWrong && !isComplete;
  const canCheck = showCheck && !isWrong && !isComplete;
  const canAdd = !isIntro && !isFinal && !isHint && !isWrong && !isComplete && !isAtToleranceLimit;
  const hidePlus = isIntro || isFinal || isHint || isAtToleranceLimit;

  checkButton.classList.toggle("is-visible", showCheck);
  checkButton.disabled = !canCheck;
  hintButton.classList.toggle("is-visible", showHint);
  hintButton.disabled = !showHint;
  addBulbButton.classList.toggle("is-hidden", hidePlus);
  addBulbButton.disabled = !canAdd;
}

function renderBuildLamp(mode = "neutral") {
  const state = getBuildState();
  const isIntro = mode === "intro";
  const isWrong = mode === "wrong";
  const isCorrect = mode === "correct";

  setPatternLamps();
  finalLamp.src = lampAssets[0].image;
  finalLamp.alt = lampAssets[0].label;
  finalLamp.style.removeProperty("--final-extra-height");
  finalLamp.style.removeProperty("--final-extra-bottom");
  buildLamp.src = isWrong ? state.wrongImage : isCorrect ? state.correctImage : state.image;
  buildLamp.alt = state.label;
  buildLamp.classList.toggle("is-wrong", isWrong);
  checkButton.classList.toggle("is-correct", isCorrect);
  checkButton.classList.toggle("is-wrong", isWrong);
  checkImage.src = checkAssets.normal;
  setBuildHeight(state);
  setControls(mode);

  if (isIntro) {
    instructionText.textContent = "Complete the pattern.";
    return;
  }

  if (isCorrect) {
    instructionText.textContent = "Yay! You fixed the bulbs.";
    return;
  }

  if (isWrong) {
    instructionText.textContent = `Fixed ${getAnswerText()} lights.`;
    return;
  }

  instructionText.textContent = shouldShowHintPrompt() ? "Check the hint" : "Tap to add the bulbs";
}

function showIntro() {
  window.clearTimeout(introTimer);
  window.clearTimeout(successTimer);
  clearHintTimers();
  const flowToken = ++screenFlowToken;
  stage.classList.remove("is-intro", "is-final", "is-hint");
  currentBulbs = 0;
  isComplete = false;
  isFinalScreen = false;
  isHintScreen = false;
  wrongStreak = 0;
  renderBuildLamp("intro");
  void stage.offsetWidth;
  stage.classList.add("is-intro");

  speakRobot("Complete the pattern.", {
    fallbackMs: 2800,
    afterMs: SCREEN_AFTER_SPEECH_DELAY_MS,
  }).then(() => {
    if (flowToken !== screenFlowToken) {
      return;
    }

    stage.classList.remove("is-intro");
    renderBuildLamp();
    playInstruction("Tap to add the bulbs.", { fallbackMs: 2300 });
  });
}

function addBulb() {
  window.clearTimeout(resetTimer);
  unlockAudio();
  cancelNarration();

  if (currentBulbs >= getMaxToleranceBulbs() || isComplete || isFinalScreen || isHintScreen) {
    return;
  }

  currentBulbs += 1;
  playAddSfx();
  renderBuildLamp();
}

function resetToZeroPole() {
  currentBulbs = 0;
  isComplete = false;
  isFinalScreen = false;
  isHintScreen = false;
  renderBuildLamp();
  playInstruction("Tap to add the bulbs.", { fallbackMs: 2300 });
}

function advancePattern() {
  if (patternIndex >= patterns.length - 1) {
    return;
  }

  patternIndex += 1;
  currentBulbs = 0;
  isComplete = false;
  isFinalScreen = false;
  isHintScreen = false;
  wrongStreak = 0;
  clearHintTimers();
  ++screenFlowToken;
  stage.classList.remove("is-intro", "is-final", "is-hint");
  renderBuildLamp();
  playInstruction("Tap to add the bulbs.", { fallbackMs: 2300 });
}

function scheduleNextPattern() {
  window.clearTimeout(successTimer);
  const flowToken = ++screenFlowToken;

  speakRobot("Yay! You fixed the bulbs.", {
    fallbackMs: 3000,
    afterMs: SCREEN_AFTER_SPEECH_DELAY_MS,
  }).then(() => {
    if (flowToken !== screenFlowToken) {
      return;
    }

    if (patternIndex < patterns.length - 1) {
      advancePattern();
      return;
    }

    showFinalScreen();
  });
}

function showFinalScreen() {
  const finalBuildMeta = patternAssetMeta[finalSequence[3]];
  const finalExtraMeta = patternAssetMeta[finalSequence[4]];

  window.clearTimeout(introTimer);
  window.clearTimeout(resetTimer);
  clearHintTimers();
  clearHintReveal();
  ++screenFlowToken;
  stage.classList.remove("is-intro", "is-final", "is-hint");
  isComplete = true;
  isFinalScreen = true;
  isHintScreen = false;
  wrongStreak = 0;
  currentBulbs = 0;

  setPatternLamps(finalSequence);
  buildLamp.src = finalBuildMeta.image;
  buildLamp.alt = finalBuildMeta.label;
  buildLamp.classList.remove("is-wrong");
  buildLamp.style.setProperty("--build-height", finalBuildMeta.introHeight);
  buildLamp.style.setProperty("--build-height-mobile", finalBuildMeta.introHeight);
  buildLamp.style.setProperty("--build-bottom", finalBuildMeta.introBottom);
  finalLamp.src = finalExtraMeta.image;
  finalLamp.alt = finalExtraMeta.label;
  finalLamp.style.setProperty("--final-extra-height", finalExtraMeta.introHeight);
  finalLamp.style.setProperty("--final-extra-bottom", finalExtraMeta.introBottom);

  checkButton.classList.remove("is-correct", "is-wrong");
  checkImage.src = checkAssets.normal;
  instructionText.textContent = "Yay! You completed the patterns.";
  setControls("final");
  void stage.offsetWidth;
  stage.classList.add("is-final");
  playInstruction("Yay! You completed the patterns.", { fallbackMs: 3300 });
}

function setFiveLampSequence(sequence) {
  const finalBuildMeta = patternAssetMeta[sequence[3]];
  const finalExtraMeta = patternAssetMeta[sequence[4]];

  setPatternLamps(sequence);
  buildLamp.src = finalBuildMeta.image;
  buildLamp.alt = finalBuildMeta.label;
  buildLamp.classList.remove("is-wrong");
  buildLamp.style.setProperty("--build-height", finalBuildMeta.introHeight);
  buildLamp.style.setProperty("--build-height-mobile", finalBuildMeta.introHeight);
  buildLamp.style.setProperty("--build-bottom", finalBuildMeta.introBottom);
  finalLamp.src = finalExtraMeta.image;
  finalLamp.alt = finalExtraMeta.label;
  finalLamp.style.setProperty("--final-extra-height", finalExtraMeta.introHeight);
  finalLamp.style.setProperty("--final-extra-bottom", finalExtraMeta.introBottom);
}

async function showHintScreen() {
  unlockAudio();
  clearHintTimers();
  window.clearTimeout(resetTimer);
  const flowToken = ++screenFlowToken;
  stage.classList.remove("is-intro", "is-final", "is-hint");
  isHintScreen = true;
  clearHintReveal();

  setFiveLampSequence(finalSequence);
  finalSequence.forEach((count, index) => {
    if (hintCounts[index]) {
      hintCounts[index].textContent = count;
    }
  });

  checkButton.classList.remove("is-correct", "is-wrong");
  checkImage.src = checkAssets.normal;
  instructionText.textContent = "Check the hint";
  setControls("hint");
  void stage.offsetWidth;
  stage.classList.add("is-hint");

  await speakRobot("Check the hint.", {
    fallbackMs: 1900,
    afterMs: SCREEN_AFTER_SPEECH_DELAY_MS,
  });

  for (let index = 0; index < finalSequence.length; index += 1) {
    if (flowToken !== screenFlowToken) {
      return;
    }

    hintLamps[index].classList.add("is-hint-revealed");
    hintCounts[index].classList.add("is-hint-revealed");
    playHintStepSfx(index);

    await speakRobot(`${finalSequence[index]} lights`, {
      fallbackMs: 1550,
      afterMs: 180,
    });
  }

  await wait(HINT_RETURN_DELAY_MS);

  if (flowToken !== screenFlowToken) {
    return;
  }

  wrongStreak = 0;
  isHintScreen = false;
  stage.classList.remove("is-hint");
  clearHintReveal();
  renderBuildLamp();
  playInstruction("Now try again.", { fallbackMs: 1900 });
}

function checkAnswer() {
  window.clearTimeout(resetTimer);
  unlockAudio();
  cancelNarration();

  if (isFinalScreen || isHintScreen) {
    return;
  }

  if (currentBulbs === getPattern().answer) {
    isComplete = true;
    wrongStreak = 0;
    playCorrectSfx();
    renderBuildLamp("correct");
    scheduleNextPattern();
    return;
  }

  isComplete = false;
  wrongStreak += 1;
  playWrongSfx();
  renderBuildLamp("wrong");
  const shouldReset = currentBulbs > getPattern().answer;
  const flowToken = ++screenFlowToken;

  speakRobot(instructionText.textContent, {
    fallbackMs: 2600,
    afterMs: SCREEN_AFTER_SPEECH_DELAY_MS,
  }).then(() => {
    if (flowToken !== screenFlowToken) {
      return;
    }

    if (shouldReset) {
      resetToZeroPole();
      return;
    }

    renderBuildLamp();

    if (wrongStreak >= HINT_WRONG_THRESHOLD) {
      playInstruction("Check the hint.", { fallbackMs: 1900 });
    }
  });
}

preloadAssets();
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
addBulbButton.addEventListener("click", addBulb);
hintButton.addEventListener("click", showHintScreen);
checkButton.addEventListener("click", checkAnswer);
showIntro();
