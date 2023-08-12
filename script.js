const INITIAL_DATA_PATH = 'data.json',
  container = document.querySelector('[data-main-container]'),
  buttonNext = document.querySelector('[data-next-button]'),
  buttonPrev = document.querySelector('[data-prev-button]'),
  cardCounter = document.querySelector('[data-card-counter]'),
  buttonMenuOpen = document.querySelector('[data-menu-open]'),
  buttonMenuClose = document.querySelector('[data-menu-close]')

const getData = async() => {
  return await fetch(INITIAL_DATA_PATH)
  .then(res => res.json())
  .then(data => data)
  .catch(err => console.error(err));
};

const generateVoiceOutput = (message) => {
  const synth = window.speechSynthesis;
  const utterThis = new SpeechSynthesisUtterance(`${message}`);
  utterThis.lang = "en-US";
  utterThis.rate = 0.8;
  synth.speak(utterThis);
}

const initVoiceOutput = (cards) => {

};

const initFlipCardsHandler = (el, card) => {
  if (el.type === 'button') return;
  card.classList.toggle('card__flipped');
};

const initCardEvents = (cards) => {
  cards.forEach(card => {
    // init flip cards event
    card.addEventListener('click', (e) => initFlipCardsHandler(e.target, card));
    // generate voice output for english words
    card.querySelector('[data-generate-en-voice-output]').addEventListener('click', (e) => {
      generateVoiceOutput(e.target.dataset.generateEnVoiceOutput)
    })
  });
}

const initCardCounter = (counter, total) => {
  cardCounter.innerHTML = `${counter} / ${total}`
}

const initCardButtonEvents = (cards) => {
  let counter = 1;
  const width = cards[0].clientWidth;

  buttonNext.addEventListener('click', () => {
    container.scrollLeft += width;
    buttonNext.disabled = true;
    counter < cards.length ? counter++ : counter = cards.length;
    initCardCounter(counter, cards.length)
    setTimeout(() => buttonNext.disabled = false, 400); // todo: redo to MutationObserver
  });

  buttonPrev.addEventListener('click', () => {
    container.scrollLeft -= width;
    buttonPrev.disabled = true;
    counter <= 1 ? counter = 1 : counter--;
    initCardCounter(counter, cards.length);
    setTimeout(() => buttonPrev.disabled = false, 400); // todo: redo to MutationObserver
  });
};

const openMenu = () => !document.body.classList.contains('menu--open') && document.body.classList.add('menu--open');
const closeMenu = () => document.body.classList.contains('menu--open') && document.body.classList.remove('menu--open');

const initMenu = () => { 
  buttonMenuOpen.addEventListener('click', openMenu);
  buttonMenuClose.addEventListener('click', closeMenu);
};

const generateWordCards = async () => {
  const data = await getData();
  let html = '';

  data.forEach(card => {
    const singleCard = `
    <li class="card" data-single-card>
      <div class="card__inner">
        <div class="card__front">
          <h4>${card.english}</h4>
          <button class="button button--voice-output" type="button" data-generate-en-voice-output=${card.english}>say</button>
        </div>
        <div class="card__back">
          <h4>${card.russian}</h4>
        </div>
      </div>
    </li>
    `;

    html += singleCard;
  });

  container.innerHTML = html;

  const cards = document.querySelectorAll('[data-single-card]');
   
  if (!cards.length) return;

  initCardEvents(cards);
  initCardButtonEvents(cards);
  initCardCounter(1, cards.length)
};

const init = () => {
  generateWordCards();
  initMenu();
};

document.addEventListener("DOMContentLoaded", init);
