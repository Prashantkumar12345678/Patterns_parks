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

const INTRO_DURATION_MS = 1500;
const SUCCESS_ADVANCE_MS = 1500;
const WRONG_FEEDBACK_MS = 1000;
const HINT_WRONG_THRESHOLD = 2;
const HINT_STEP_MS = 920;
const HINT_RETURN_DELAY_MS = 1200;

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

function speakLightCount(count) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(`${count} lights`);
  utterance.rate = 0.88;
  utterance.pitch = 1.02;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}

function clearHintTimers() {
  hintTimers.forEach((timer) => window.clearTimeout(timer));
  hintTimers = [];

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
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

  instructionText.textContent = currentBulbs > 0 ? `Fixed ${getAnswerText()} lights.` : "Tap to add the bulbs";
}

function showIntro() {
  window.clearTimeout(introTimer);
  window.clearTimeout(successTimer);
  clearHintTimers();
  stage.classList.remove("is-intro", "is-final", "is-hint");
  currentBulbs = 0;
  isComplete = false;
  isFinalScreen = false;
  isHintScreen = false;
  wrongStreak = 0;
  renderBuildLamp("intro");
  void stage.offsetWidth;
  stage.classList.add("is-intro");

  introTimer = window.setTimeout(() => {
    stage.classList.remove("is-intro");
    renderBuildLamp();
  }, INTRO_DURATION_MS);
}

function addBulb() {
  window.clearTimeout(resetTimer);
  unlockAudio();

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
  stage.classList.remove("is-intro", "is-final", "is-hint");
  renderBuildLamp();
}

function scheduleNextPattern() {
  window.clearTimeout(successTimer);

  if (patternIndex < patterns.length - 1) {
    successTimer = window.setTimeout(advancePattern, SUCCESS_ADVANCE_MS);
    return;
  }

  successTimer = window.setTimeout(showFinalScreen, SUCCESS_ADVANCE_MS);
}

function showFinalScreen() {
  const finalBuildMeta = patternAssetMeta[finalSequence[3]];
  const finalExtraMeta = patternAssetMeta[finalSequence[4]];

  window.clearTimeout(introTimer);
  window.clearTimeout(resetTimer);
  clearHintTimers();
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

function showHintScreen() {
  unlockAudio();
  clearHintTimers();
  window.clearTimeout(resetTimer);
  stage.classList.remove("is-intro", "is-final", "is-hint");
  isHintScreen = true;

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

  finalSequence.forEach((count, index) => {
    const timer = window.setTimeout(() => {
      playHintStepSfx(index);
      speakLightCount(count);
    }, index * HINT_STEP_MS + 120);
    hintTimers.push(timer);
  });

  hintTimers.push(
    window.setTimeout(() => {
      wrongStreak = 0;
      isHintScreen = false;
      stage.classList.remove("is-hint");
      renderBuildLamp();
    }, finalSequence.length * HINT_STEP_MS + HINT_RETURN_DELAY_MS),
  );
}

function checkAnswer() {
  window.clearTimeout(resetTimer);
  unlockAudio();

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

  resetTimer = window.setTimeout(() => {
    if (currentBulbs > getPattern().answer) {
      resetToZeroPole();
      return;
    }

    renderBuildLamp();
  }, WRONG_FEEDBACK_MS);
}

preloadAssets();
addBulbButton.addEventListener("click", addBulb);
hintButton.addEventListener("click", showHintScreen);
checkButton.addEventListener("click", checkAnswer);
showIntro();
