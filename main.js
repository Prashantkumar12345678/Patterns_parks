const stage = document.querySelector(".stage");
const targetLamp = document.querySelector("#targetLamp");
const buildLamp = document.querySelector("#buildLamp");
const bonusLamp = document.querySelector("#bonusLamp");
const choiceStrip = document.querySelector("#choiceStrip");
const nextButton = document.querySelector("#nextButton");
const checkButton = document.querySelector("#checkButton");
const plusImage = document.querySelector("#plusImage");
const checkImage = document.querySelector("#checkImage");
const resultBadge = document.querySelector("#resultBadge");
const roundValue = document.querySelector("#roundValue");
const targetValue = document.querySelector("#targetValue");
const scoreValue = document.querySelector("#scoreValue");
const buildPreview = document.querySelector(".build-preview");

const uiAssets = {
  plus: "assets/ui/plus.png",
  plusGlow: "assets/ui/plus-glow.png",
  check: "assets/ui/check-cyan.png",
  checkGlow: "assets/ui/check-glow.png",
};

const lamps = [
  {
    count: 0,
    off: "assets/lamps/pole-0-off.png",
    active: "assets/lamps/pole-0-off.png",
    reward: "assets/lamps/pole-0-off.png",
  },
  {
    count: 1,
    off: "assets/lamps/pole-1-off.png",
    active: "assets/lamps/pole-1-pink.png",
    reward: "assets/lamps/pole-1-pink.png",
  },
  {
    count: 2,
    off: "assets/lamps/pole-2-off.png",
    active: "assets/lamps/pole-2-pink.png",
    reward: "assets/lamps/pole-2-pink.png",
  },
  {
    count: 3,
    off: "assets/lamps/pole-3-off.png",
    active: "assets/lamps/pole-3-pink.png",
    reward: "assets/lamps/pole-3-pink.png",
  },
  {
    count: 4,
    off: "assets/lamps/pole-4-off.png",
    active: "assets/lamps/pole-4-on.png",
    reward: "assets/lamps/pole-4-on.png",
  },
  {
    count: 5,
    off: "assets/lamps/pole-5-off.png",
    active: "assets/lamps/pole-5-on.png",
    reward: "assets/lamps/lamp-5-on.png",
  },
  {
    count: 6,
    off: "assets/lamps/pole-6-off.png",
    active: "assets/lamps/pole-6-pink.png",
    reward: "assets/lamps/lamp-6-on.png",
  },
];

const targetSequence = [1, 3, 2, 5, 4, 6];
let selectedCount = 0;
let targetIndex = 0;
let score = 0;
let feedbackTimer;

function preloadAssets() {
  [
    "assets/lamps/lamp-7-on.png",
    "assets/ui/answer-panel.png",
    ...Object.values(uiAssets),
    ...lamps.flatMap((lamp) => [lamp.off, lamp.active, lamp.reward]),
  ].forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function getLamp(count) {
  return lamps.find((lamp) => lamp.count === count) ?? lamps[0];
}

function getTargetCount() {
  return targetSequence[targetIndex % targetSequence.length];
}

function updateHud() {
  roundValue.textContent = String((targetIndex % targetSequence.length) + 1).padStart(2, "0");
  targetValue.textContent = String(getTargetCount());
  scoreValue.textContent = String(score).padStart(3, "0");
}

function renderChoices() {
  [...choiceStrip.children].forEach((button) => {
    const count = Number(button.dataset.count);
    const lamp = getLamp(count);
    const image = button.querySelector("img");
    image.src = count === selectedCount ? lamp.active : lamp.off;
    button.classList.toggle("is-selected", count === selectedCount);
    button.setAttribute("aria-pressed", String(count === selectedCount));
  });
}

function setFeedback(label, kind) {
  resultBadge.textContent = label;
  buildPreview.classList.toggle("is-correct", kind === "correct");
  buildPreview.classList.toggle("is-wrong", kind === "wrong");
  checkImage.src = kind === "correct" ? uiAssets.checkGlow : uiAssets.check;
  plusImage.src = kind === "correct" ? uiAssets.plusGlow : uiAssets.plus;
}

function renderScene() {
  const selectedLamp = getLamp(selectedCount);
  const targetLampData = getLamp(getTargetCount());

  targetLamp.src = targetLampData.reward;
  targetLamp.alt = `Target lamp with ${targetLampData.count} lights`;
  buildLamp.src = selectedLamp.active;
  buildLamp.alt = `Selected lamp with ${selectedLamp.count} lights`;

  setFeedback("Ready", "idle");
  updateHud();
  renderChoices();
}

function selectCount(count) {
  selectedCount = count;
  renderScene();
}

function nextCount() {
  selectedCount = (selectedCount + 1) % lamps.length;
  renderScene();
}

function advanceTarget() {
  targetIndex += 1;
  selectedCount = 0;

  if (targetIndex % targetSequence.length === 0) {
    stage.classList.add("is-perfect");
    bonusLamp.removeAttribute("aria-hidden");
    window.setTimeout(() => {
      stage.classList.remove("is-perfect");
      bonusLamp.setAttribute("aria-hidden", "true");
    }, 1200);
  }

  renderScene();
}

function checkAnswer() {
  window.clearTimeout(feedbackTimer);

  const selectedLamp = getLamp(selectedCount);
  const isCorrect = selectedCount === getTargetCount();

  if (isCorrect) {
    score += 25;
    buildLamp.src = selectedLamp.reward;
    setFeedback("Match", "correct");
    updateHud();
    feedbackTimer = window.setTimeout(advanceTarget, 850);
    return;
  }

  score = Math.max(0, score - 5);
  setFeedback("Try", "wrong");
  updateHud();
  feedbackTimer = window.setTimeout(() => {
    buildPreview.classList.remove("is-wrong");
    setFeedback("Ready", "idle");
  }, 520);
}

function createChoiceButtons() {
  lamps.forEach((lamp) => {
    const button = document.createElement("button");
    const image = document.createElement("img");
    const badge = document.createElement("span");

    button.className = "choice-button";
    button.type = "button";
    button.dataset.count = String(lamp.count);
    button.setAttribute("aria-label", `Choose ${lamp.count} lights`);
    button.addEventListener("click", () => selectCount(lamp.count));

    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    badge.textContent = String(lamp.count);

    button.append(image, badge);
    choiceStrip.append(button);
  });
}

function handleKeyboard(event) {
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    nextCount();
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    selectedCount = (selectedCount - 1 + lamps.length) % lamps.length;
    renderScene();
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    checkAnswer();
  }
}

preloadAssets();
createChoiceButtons();
nextButton.addEventListener("click", nextCount);
checkButton.addEventListener("click", checkAnswer);
window.addEventListener("keydown", handleKeyboard);
renderScene();
