const addBulbButton = document.querySelector("#addBulbButton");
const checkButton = document.querySelector("#checkButton");
const checkImage = checkButton.querySelector("img");
const buildLamp = document.querySelector("#buildLamp");
const instructionText = document.querySelector("#instructionText");

const TARGET_BULBS = 4;
const MAX_TOLERANCE_BULBS = TARGET_BULBS + 2;
const checkAssets = {
  normal: "assets/ui/check-normal.png",
  wrong: "assets/ui/check-wrong.png",
};
let resetTimer;

const buildStates = [
  {
    bulbs: 0,
    image: "assets/lamps/pole-0-off.png",
    wrongImage: "assets/lamps/pole-0-off.png",
    correctImage: "assets/lamps/pole-0-off.png",
    label: "Empty lamp post",
  },
  {
    bulbs: 1,
    image: "assets/lamps/pole-1-off.png",
    wrongImage: "assets/lamps/pole-1-pink.png",
    correctImage: "assets/lamps/pole-1-off.png",
    label: "Lamp post with one bulb",
  },
  {
    bulbs: 2,
    image: "assets/lamps/pole-2-white.png",
    wrongImage: "assets/lamps/pole-2-pink.png",
    correctImage: "assets/lamps/pole-2-white.png",
    label: "Lamp post with two bulbs",
  },
  {
    bulbs: 3,
    image: "assets/lamps/pole-3-off.png",
    wrongImage: "assets/lamps/pole-3-pink.png",
    correctImage: "assets/lamps/pole-3-off.png",
    label: "Lamp post with three bulbs",
  },
  {
    bulbs: 4,
    image: "assets/lamps/pole-4-off.png",
    wrongImage: "assets/lamps/pole-4-off.png",
    correctImage: "assets/lamps/pole-4-on.png",
    label: "Lamp post with four bulbs",
  },
  {
    bulbs: 5,
    image: "assets/lamps/pole-5-off.png",
    wrongImage: "assets/lamps/pole-5-on.png",
    correctImage: "assets/lamps/pole-5-off.png",
    label: "Lamp post with five bulbs",
  },
  {
    bulbs: 6,
    image: "assets/lamps/pole-6-off.png",
    wrongImage: "assets/lamps/pole-6-pink.png",
    correctImage: "assets/lamps/pole-6-off.png",
    label: "Lamp post with six bulbs",
  },
];

let currentBulbs = 0;
let isComplete = false;

function preloadBuildStates() {
  Object.values(checkAssets).forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  buildStates.forEach((state) => {
    [state.image, state.wrongImage, state.correctImage].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  });
}

function renderBuildLamp(mode = "neutral") {
  const state = buildStates[currentBulbs];
  const isWrong = mode === "wrong";
  const isCorrect = mode === "correct";
  const isAtToleranceLimit = currentBulbs >= MAX_TOLERANCE_BULBS;

  buildLamp.src = isWrong ? state.wrongImage : isCorrect ? state.correctImage : state.image;
  buildLamp.alt = state.label;
  buildLamp.classList.toggle("is-wrong", isWrong);
  checkImage.src = isWrong ? checkAssets.wrong : checkAssets.normal;
  checkButton.classList.toggle("is-visible", currentBulbs > 0);
  checkButton.disabled = currentBulbs === 0;
  addBulbButton.classList.toggle("is-hidden", isAtToleranceLimit || isComplete);
  addBulbButton.disabled = isAtToleranceLimit || isComplete;

  if (isCorrect) {
    instructionText.textContent = "Fixed four lights.";
    return;
  }

  instructionText.textContent = currentBulbs > 0 ? "Fixed four lights." : "Tap to add the bulbs";
}

function addBulb() {
  window.clearTimeout(resetTimer);

  if (currentBulbs >= MAX_TOLERANCE_BULBS) {
    return;
  }

  isComplete = false;
  currentBulbs = Math.min(currentBulbs + 1, buildStates.length - 1);
  renderBuildLamp();
}

function checkAnswer() {
  if (currentBulbs === TARGET_BULBS) {
    isComplete = true;
    renderBuildLamp("correct");
    return;
  }

  isComplete = false;
  renderBuildLamp("wrong");

  if (currentBulbs > TARGET_BULBS) {
    resetTimer = window.setTimeout(() => {
      currentBulbs = 0;
      renderBuildLamp();
    }, 700);
  }
}

preloadBuildStates();
addBulbButton.addEventListener("click", addBulb);
checkButton.addEventListener("click", checkAnswer);
renderBuildLamp();
