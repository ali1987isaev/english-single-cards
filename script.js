let INITIAL_DATA_PATH = 'data.json',
  STORAGE_KEY;

const container = document.querySelector('[data-main-container]'),
  buttonNext = document.querySelector('[data-next-button]'),
  buttonPrev = document.querySelector('[data-prev-button]'),
  cardCounter = document.querySelector('[data-card-counter]'),
  buttonMenuOpen = document.querySelector('[data-menu-open]'),
  buttonMenuClose = document.querySelector('[data-menu-close]'),
  formAddWord = document.querySelector('[data-add-new-word]'),
  menu = document.querySelector('[data-menu]'),
  tagList = document.querySelector('[data-teg-list]');

const getData = async() => {
  if(!INITIAL_DATA_PATH) return;
  
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

const initFlipCardsHandler = (el, card) => {
  if (el.type === 'button' || el.nodeName === 'path' || el.nodeName === 'svg') return;
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
  console.log('initCardButtonEvents')
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

const initDeleteItems = () => {
  const deleteItemButtons = document.querySelectorAll('[data-delete-card]');
  deleteItemButtons.forEach(button => button.addEventListener('click', ()=> {
    const newArr = JSON.parse(localStorage.getItem(STORAGE_KEY)).filter(el => el.english !== button.dataset.deleteCard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newArr));
    generateWordCards();
  }));
}

async function generateWordCards(type = 'data') {
  let storedWords;
  let data;
  STORAGE_KEY = type;

  if (type) {
    INITIAL_DATA_PATH = `${type}.json`,
    storedWords = JSON.parse(localStorage.getItem(type)) || [];
    data = !storedWords.length ? await getData() : storedWords;
    !storedWords.length && localStorage.setItem(type, JSON.stringify(data));
  } else {
    storedWords = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    data = !storedWords.length ? await getData() : storedWords;
    !storedWords.length && localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  container.scrollLeft = 0;
  let html = '';

  const deleteButton = (card) => {
    return INITIAL_DATA_PATH === 'data.json'
     ? (`
      <button class="button button--icon" type="button" data-delete-card="${card.english}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
     `) : '';
  }

  data.forEach(card => {
    const singleCard = `
    <li class="card" data-single-card>
      <div class="card__inner">
        <div class="card__front">
          <h4>${card.english}</h4>
          <button class="button button--voice-output" type="button" data-generate-en-voice-output="${card.english}">say</button>
          ${deleteButton(card)}
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
  setTimeout(() => initCardButtonEvents(cards), 500);
  initCardCounter(1, cards.length);
  initDeleteItems();
};

const initFormAddWord = () => {
  formAddWord.addEventListener('submit', (e) => {
    e.preventDefault();
    const newWord = e.target.elements["add-word"].value || "";
    const translation = e.target.elements["add-translation"].value || "";

    if (newWord.trim() === "" || translation.trim() === "") return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      {
        "id": `${newWord.trim()}`,
        "english": `${newWord.trim()}`,
        "russian": `${translation.trim()}`
      },
      ...JSON.parse(localStorage.getItem(STORAGE_KEY))
    ]));

    e.target.elements["add-word"].value = "";
    e.target.elements["add-translation"].value = "";
    generateWordCards();
    closeMenu();
  })
}

const clearMenu = () => {
  setTimeout(() => {
    menu.classList.contains('menu--hidden') && menu.classList.remove('menu--hidden');
  }, 500);
};

const initTagList = () => {
  const tags = tagList.querySelectorAll('button');
  tags.forEach(tag => tag.addEventListener('click', () => {
    const type = tag.dataset.type;
    if(!type) return;

    generateWordCards(type);
  }))
}

const init = () => {
  clearMenu();
  generateWordCards();
  initMenu();
  initFormAddWord();
  initTagList();
};

document.addEventListener("DOMContentLoaded", init);
