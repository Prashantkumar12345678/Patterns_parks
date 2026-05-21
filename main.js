const addBulbButton = document.querySelector("#addBulbButton");
const buildLamp = document.querySelector("#buildLamp");
const instructionText = document.querySelector("#instructionText");

const buildStates = [
  {
    bulbs: 0,
    image: "assets/lamps/pole-0-off.png",
    label: "Empty lamp post",
  },
  {
    bulbs: 1,
    image: "assets/lamps/pole-1-pink.png",
    label: "Lamp post with one bulb",
  },
  {
    bulbs: 2,
    image: "assets/lamps/pole-2-pink.png",
    label: "Lamp post with two bulbs",
  },
  {
    bulbs: 3,
    image: "assets/lamps/pole-3-pink.png",
    label: "Lamp post with three bulbs",
  },
  {
    bulbs: 4,
    image: "assets/lamps/pole-4-on.png",
    label: "Lamp post with four bulbs",
  },
];

let currentBulbs = 0;

function preloadBuildStates() {
  buildStates.forEach((state) => {
    const image = new Image();
    image.src = state.image;
  });
}

function renderBuildLamp() {
  const state = buildStates[currentBulbs];
  buildLamp.src = state.image;
  buildLamp.alt = state.label;
  instructionText.textContent = currentBulbs === 4 ? "Pattern complete!" : "Tap to add the bulbs";
}

function addBulb() {
  currentBulbs = Math.min(currentBulbs + 1, buildStates.length - 1);
  renderBuildLamp();
}

preloadBuildStates();
addBulbButton.addEventListener("click", addBulb);
renderBuildLamp();
