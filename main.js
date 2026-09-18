const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = [
  { name: 'Hearts',   symbol: '♥', color: 'red' },
  { name: 'Diamonds', symbol: '♦', color: 'red' },
  { name: 'Clubs',    symbol: '♣', color: 'black' },
  { name: 'Spades',   symbol: '♠', color: 'black' }
];
 
const DEAL_DELAY_MS = 300; 

const gameState = {
  player1: { hand: [], score: 0 },
  player2: { hand: [], score: 0 },
  round: 0,
  isDealing: false
};

const player1CardEls = Array.from(document.querySelectorAll('#player1-cards .card'));
const player2CardEls = Array.from(document.querySelectorAll('#player2-cards .card'));
const player1ScoreEl = document.getElementById('player1-score');
const player2ScoreEl = document.getElementById('player2-score');
const resultEl = document.getElementById('result-message');
const drawButton = document.getElementById('draw-button');
 
function getRankValue(rank) {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return Number(rank);
}
 
function createCard(rank, suit) {
  return {
    rank: rank,
    suit: suit.name,
    symbol: suit.symbol,
    color: suit.color,
    value: getRankValue(rank),
    display: `${rank}${suit.symbol}`
  };
}
 
function cardsAreEqual(cardA, cardB) {
  return cardA.rank === cardB.rank && cardA.suit === cardB.suit;
}
 
function getRandomCard() {
  const randomRank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return createCard(randomRank, randomSuit);
}
 
function generateHand() {
  const hand = [];
  while (hand.length < 3) {
    const candidate = getRandomCard();
    const isDuplicate = hand.some(card => cardsAreEqual(card, candidate));
    if (!isDuplicate) {
      hand.push(candidate);
    }
  }
  return hand;
}
 
function calculateHandValue(hand) {
  return hand.reduce((total, card) => total + card.value, 0);
}
 
function determineWinner(hand1, hand2) {
  const total1 = calculateHandValue(hand1);
  const total2 = calculateHandValue(hand2);
  if (total1 > total2) return 'PLAYER_1';
  if (total2 > total1) return 'PLAYER_2';
  return 'DRAW';
}
 
function renderCard(cardElement, card) {
  const topLeft = cardElement.querySelector('.corner.top-left');
  const bottomRight = cardElement.querySelector('.corner.bottom-right');
  const center = cardElement.querySelector('.suit-center');
 
  cardElement.classList.remove('red', 'black', 'dealt');
 
  if (!card) {
    topLeft.textContent = '';
    bottomRight.textContent = '';
    center.textContent = '';
    return;
  }
 
  topLeft.textContent = card.display;
  bottomRight.textContent = card.display;
  center.textContent = card.symbol;
  cardElement.classList.add(card.color, 'dealt');
}

function renderHand(hand, cardElements) {
  cardElements.forEach((el, index) => renderCard(el, hand[index] || null));
}
 
function clearHandDisplay(cardElements) {
  renderHand([], cardElements);
}
 
function updateScoreDisplay() {
  player1ScoreEl.textContent = `Player 1: ${gameState.player1.score}`;
  player2ScoreEl.textContent = `Player 2: ${gameState.player2.score}`;
}

function dealCardsSequentially(onComplete) {
  const dealSteps = [
    () => renderCard(player1CardEls[0], gameState.player1.hand[0]),
    () => renderCard(player1CardEls[1], gameState.player1.hand[1]),
    () => renderCard(player1CardEls[2], gameState.player1.hand[2]),
    () => renderCard(player2CardEls[0], gameState.player2.hand[0]),
    () => renderCard(player2CardEls[1], gameState.player2.hand[1]),
    () => renderCard(player2CardEls[2], gameState.player2.hand[2])
  ];
 
  let stepIndex = 0;
  function dealNextCard() {
    if (stepIndex < dealSteps.length) {
      dealSteps[stepIndex]();
      stepIndex++;
      setTimeout(dealNextCard, DEAL_DELAY_MS);
    } else {
      onComplete();
    }
  }
  dealNextCard();
}

function startRound() {
  if (gameState.isDealing) return; 
  gameState.isDealing = true;
  drawButton.disabled = true;
  resultEl.textContent = '';
 
  clearHandDisplay(player1CardEls);
  clearHandDisplay(player2CardEls);
 
  gameState.round++;
  gameState.player1.hand = generateHand();
  gameState.player2.hand = generateHand();
 
  dealCardsSequentially(finishRound);
}
 
function finishRound() {
  const winner = determineWinner(gameState.player1.hand, gameState.player2.hand);
  const total1 = calculateHandValue(gameState.player1.hand);
  const total2 = calculateHandValue(gameState.player2.hand);
 
  if (winner === 'PLAYER_1') {
    gameState.player1.score++;
    resultEl.textContent = `Player 1 wins the round! (${total1} vs ${total2})`;
  } else if (winner === 'PLAYER_2') {
    gameState.player2.score++;
    resultEl.textContent = `Player 2 wins the round! (${total1} vs ${total2})`;
  } else {
    resultEl.textContent = `Draw! (${total1} vs ${total2})`;
  }
 
  updateScoreDisplay();
 
  gameState.isDealing = false;
  drawButton.disabled = false;
}
 
function triggerButtonBounce() {
  drawButton.classList.remove('bounce');
  void drawButton.offsetWidth;
  drawButton.classList.add('bounce');
}

drawButton.addEventListener('click', () => {
  triggerButtonBounce();
  startRound();
});
updateScoreDisplay();