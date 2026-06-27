const tarotCards = [
  {
    title: "The Hermit",
    subtitle: "Inner Lantern",
    reader: "LYRA",
    message: "The Hermit asks you to pause before choosing. A quieter answer is forming beneath the surface.",
    image: cardSvg("IX", "THE HERMIT", "lantern", "#dec29c", "#79664f")
  },
  {
    title: "Ace of Pentacles",
    subtitle: "Ace of Pentacles",
    reader: "LYRA",
    message: "A grounded opportunity is present. Start with the smallest practical step and let the path become real.",
    image: cardSvg("A", "PENTACLES", "coin", "#e7d2ac", "#7f684d")
  },
  {
    title: "The Star",
    subtitle: "The Star",
    reader: "LYRA",
    message: "Hope returns through simplicity. Let the next decision be guided by what restores your inner clarity.",
    image: cardSvg("XVII", "THE STAR", "star", "#d9c29f", "#6f6252")
  },
  {
    title: "Two of Cups",
    subtitle: "Two of Cups",
    reader: "LYRA",
    message: "This card speaks of exchange. Look for mutual effort rather than promises or imagined potential.",
    image: cardSvg("II", "CUPS", "cups", "#e2c5b5", "#76534c")
  }
];

let currentCardIndex = 1;

const mainCard = document.querySelector("#mainCard");
const cardImage = document.querySelector("#cardImage");
const cardSubtitle = document.querySelector("#cardSubtitle");
const readingTitle = document.querySelector("#readingTitle");
const readerText = document.querySelector("#readerText");
const drawButton = document.querySelector("#drawButton");

function cardSvg(rank, title, symbol, paper, ink) {
  const symbols = {
    lantern: `<path d="M52 62h36l-5 54H57z" fill="none" stroke="${ink}" stroke-width="3"/><path d="M64 62c2-14 12-14 14 0" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="70" cy="89" r="13" fill="none" stroke="${ink}" stroke-width="3"/><path d="M70 76v26M57 89h26" stroke="${ink}" stroke-width="2"/>`,
    coin: `<circle cx="70" cy="88" r="25" fill="none" stroke="${ink}" stroke-width="4"/><path d="M70 60v56M43 88h54M52 70l36 36M88 70l-36 36" stroke="${ink}" stroke-width="2"/>`,
    star: `<path d="M70 45l7 27 27-7-20 20 20 20-27-7-7 27-7-27-27 7 20-20-20-20 27 7z" fill="none" stroke="${ink}" stroke-width="3"/>`,
    cups: `<path d="M45 66h25c-2 20-8 30-13 30S47 86 45 66zM95 66H70c2 20 8 30 13 30s10-10 12-30z" fill="none" stroke="${ink}" stroke-width="3"/><path d="M57 96v18h-13M83 96v18h13" stroke="${ink}" stroke-width="3"/>`
  };

  const svg = `
    <svg viewBox="0 0 140 210" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="210" rx="8" fill="${paper}"/>
      <rect x="8" y="8" width="124" height="194" rx="5" fill="none" stroke="${ink}" stroke-width="2" opacity=".7"/>
      <rect x="14" y="14" width="112" height="182" rx="3" fill="none" stroke="${ink}" stroke-width="1" opacity=".28"/>
      <text x="70" y="32" text-anchor="middle" font-family="Cinzel, serif" font-size="18" fill="${ink}">${rank}</text>
      ${symbols[symbol]}
      <path d="M28 160c20-12 55-10 84 0M20 176c28-8 68-8 100 0" fill="none" stroke="${ink}" stroke-width="2" opacity=".55"/>
      <text x="70" y="192" text-anchor="middle" font-family="Cinzel, serif" font-size="12" fill="${ink}">${title}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderCard(card) {
  cardImage.src = card.image;
  readingTitle.textContent = `${card.title.toUpperCase()}'S ANSWER`;
  cardSubtitle.textContent = card.subtitle;
  readerText.textContent = card.message;
}

function drawRandomCard() {
  let nextIndex = currentCardIndex;
  while (nextIndex === currentCardIndex && tarotCards.length > 1) {
    nextIndex = Math.floor(Math.random() * tarotCards.length);
  }
  currentCardIndex = nextIndex;
  mainCard.classList.remove("flip");
  void mainCard.offsetWidth;
  mainCard.classList.add("flip");
  window.setTimeout(() => renderCard(tarotCards[currentCardIndex]), 320);
}

document.querySelectorAll(".ritual-item").forEach((button) => {
  button.addEventListener("click", () => {
    console.log(`Open tarot mode: ${button.dataset.route}`);
  });
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    console.log(`Bottom tab: ${tab.dataset.tab}`);
  });
});

drawButton.addEventListener("click", drawRandomCard);
renderCard(tarotCards[currentCardIndex]);
