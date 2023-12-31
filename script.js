let INITIAL_DATA_PATH = 'data.json',
  STORAGE_KEY;

const container = document.querySelector('[data-main-container]'),
  buttonNext = document.querySelector('[data-next-button]'),
  buttonPrev = document.querySelector('[data-prev-button]'),
  cardCounter = document.querySelector('[data-card-counter]'),
  buttonMenuOpen = document.querySelector('[data-menu-open]'),
  buttonMenuClose = document.querySelector('[data-menu-close]'),
  buttonMenuListOpen = document.querySelector('[data-menu-list-open]'),
  buttonMenuListClose = document.querySelector('[data-menu-list-close]'),
  buttonMenuCollectExpressionOpen = document.querySelector('[data-menu-collect-expression-open]'),
  buttonMenuCollectExpressionClose = document.querySelector('[data-menu-collect-expression-close]'),
  formAddWord = document.querySelector('[data-add-new-word]'),
  menu = document.querySelector('[data-menu]'),
  menuList = document.querySelector('[data-menu-list]'),
  menuCollectExpression = document.querySelector('[data-menu-collect-expression]'),
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
      !card.disabled && generateVoiceOutput(e.target.dataset.generateEnVoiceOutput)
      card.disabled = true;
      setTimeout(() => card.disabled = false, 1000);
    });
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
const openMenuList = () => !document.body.classList.contains('menu-list--open') && document.body.classList.add('menu-list--open');
const closeMenuList = () => document.body.classList.contains('menu-list--open') && document.body.classList.remove('menu-list--open');

const initMenu = () => { 
  buttonMenuOpen.addEventListener('click', openMenu);
  buttonMenuClose.addEventListener('click', closeMenu);
};

const initListItemEventHandler = (container) => {
  container.addEventListener('click', (e) => {
    console.log('e.target', e.target)
    e.target.parentElement.classList.toggle('items-list__item--active')
  })
};

const renderMenuList = (container, list) => {
  let html = '';

  const renderItemList = (list) => {
    let html = '';

    list.forEach(item => html += `
      <li class="">
        <span class="items-list__item-english">
          ${item?.word ? `<span>${item.word}</span>` : ""}
          ${item?.expression ? `<span>${item.expression}</span>` : ""}
        </span>
        ${item?.icon ? `<span  class="items-list__item-icon">${item.icon}</span>` : ""}
        <span class="items-list__item-translation">
          ${item?.word_translation ? `<span>${item.word_translation}</span>` : ""}
          ${item?.expression_translation ? `<span>${item.expression_translation}</span>` : ""}
        </span>
      </li>
    `)

    return html;
  }

  list.forEach(item => {
    html += `
      <li class="items-list__item" data-list-item>
       <p class="items-list__item-topic">${item.topic}</p>
       <div class="items-list__item-content">
        <audio controls>
          <source src="${item.audio_path}" type="audio/mpeg">
        Your browser does not support the audio element.
        </audio>
        <ul>
          ${renderItemList(item.list)}
        </ul>
       </div>
      </li>
    `
  })

  container.innerHTML = html;

  initListItemEventHandler(container);
};

const getMenuListData = async () => {
  const container = document.querySelector('[data-menu-list-container]') || null;
  if (!container) return;

  await fetch("./source.json")
  .then(res => res.json())
  .then(data => renderMenuList(container, data))
  .catch(err => console.error(err));
};

const initMenuList = () => {
  buttonMenuListOpen.addEventListener('click', openMenuList);
  buttonMenuListClose.addEventListener('click', closeMenuList);
  getMenuListData();
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
  STORAGE_KEY = type; 

  INITIAL_DATA_PATH = `${type}.json`;
  const storedWords = JSON.parse(localStorage.getItem(type)) || [];
  const data = !storedWords.length ? await getData() : storedWords;
  !storedWords.length && type === 'data' && localStorage.setItem(type, JSON.stringify(data));

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
    const say = card.word && card.expression ? card.expression : card.english;

    const singleCard = `
    <li class="card" data-single-card>
      <div class="card__inner">
        <div class="card__front">
          ${card?.english ? `<h4>${card.english}</h4>` : ''}
          ${card?.word ? `<h4>${card.word}</h4>` : ''}
          ${card?.expression ? `<h6>${card.expression}</h6>` : ''}
          <button class="button button--voice-output" type="button" data-generate-en-voice-output="${say}">say</button>
          ${deleteButton(card)}
        </div>
        <div class="card__back">
          ${card?.russian ? `<h4>${card.russian}</h4>` : ''}
          ${card?.word_translation ? `<h4>${card.word_translation}</h4>` : ''}
          ${card?.expression_translation ? `<h6>${card.expression_translation}</h6>` : ''}
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
    menu.classList.contains('hidden') && menu.classList.remove('hidden');
    menuList.classList.contains('hidden') && menuList.classList.remove('hidden');
    menuCollectExpression.classList.contains('hidden') && menuCollectExpression.classList.remove('hidden');
  }, 500);
};

const initTagList = () => {
  const tags = tagList.querySelectorAll('button');
  const addActive = () => {
    tags.forEach(tag => {
      tag.classList.contains('button--active') && tag.classList.remove('button--active');
      tag.dataset.type === STORAGE_KEY && tag.classList.add('button--active');
    });
  };

  addActive();

  tags.forEach(tag => tag.addEventListener('click', () => {
    const type = tag.dataset.type;
    if(!type) return;

    generateWordCards(type);
    addActive();
  }))
}

// Collect Expression
let expressionsIndex = 0
let allExpressions = [];
let expressionObject = {};
const expressioncContainer = document.querySelector('[data-menu-collect-expression-container]') || null;

const openCollectExpression = () => !document.body.classList.contains('collect-expression--open') && document.body.classList.add('collect-expression--open');
const closeCollectExpression = () => {
  if (document.body.classList.contains('collect-expression--open')) {
    document.body.classList.remove('collect-expression--open');
    setTimeout(() => getCollectExpressionData(), 500);
  };
};

const clearWrongResult = () => {
  const checkResultButton = document.querySelector('[data-collect-expression-check-result]');
  const resultExpression = document.querySelector('[data-expression-result-container]');
  const rightResultContainer = document.querySelector('[data-expression-right-result-container]');
  
  if (!checkResultButton) return;
  checkResultButton.remove();
  resultExpression.classList.contains('expression-wrong') && resultExpression.classList.remove('expression-wrong');
  rightResultContainer.innerHTML = '';
};

const successResultHandler = () => {
  const checkResultButton = document.querySelector('[data-collect-expression-check-result]');
  checkResultButton.remove();

  document.querySelector('.expression-words-container').innerHTML = `
    <div class="right-answer">
      <h1>That's correct!</h1>
      <div>🎉</div>
    </div>
  `;

  setTimeout(() => {
    expressionsIndex++
    renderCollectExpressionData(allExpressions[expressionsIndex])
  }, 2000);
};

const checkResultHandler = () => {
  const checkResultButton = document.querySelector('[data-collect-expression-check-result]');
  const resultExpression = document.querySelector('[data-expression-result-container]');
  const rightResultContainer = document.querySelector('[data-expression-right-result-container]');

  checkResultButton.addEventListener('click', () => {
    if (expressionObject.expression === resultExpression.innerText) {
      // success expresstion
      resultExpression.classList.add('expression-success');
      // rightResultContainer.innerHTML = expressionObject.expression;
      successResultHandler();
    } else {
      // wrong expresstion
      resultExpression.classList.add('expression-wrong');
      rightResultContainer.innerHTML = `<p>Correct result:</p> ${expressionObject.expression}`;
    }
  });
};

const checkProgress = (words) => {
  const readyWords = []
  words.forEach(word => {
    word.classList.contains('button--selected') ? readyWords.push(true) : readyWords.push(false);
  });

  if (!readyWords.includes(false)) {
    const button = document.createElement("button");
    button.classList.add("button", "button--primary");
    button.textContent = "Check Result";
    button.setAttribute("data-collect-expression-check-result", "");
    expressioncContainer.appendChild(button);
    checkResultHandler();
  } else clearWrongResult();
};

const addExpressionWordHandler = () => {
  const expressionResultCotainer = document.querySelector('[data-expression-result-container]');
  const words = document.querySelectorAll('[data-expression-word]');

  let html = '';

  words.forEach(word => word.addEventListener('click', (e) => {
    const currentWord = e.target.dataset.expressionWord;

    if (!e.target.classList.contains('button--selected')) {
      e.target.classList.add('button--selected');
      html += html === '' ? currentWord : ` ${currentWord}`;
    } else if (e.target.classList.contains('button--selected')) {
      e.target.classList.remove('button--selected');
      html = html.split(' ').filter(word => word != currentWord).join(' ');
    };

    expressionResultCotainer.innerHTML = html;
    checkProgress(words);
  }));
};

const getSplitedExpression = (expression) => {
  const wordsArr =  expression.split(' ').reverse();
  let indicesArr = [];
  let html = '';

  for (let index = 0; index < wordsArr.length; index++) {
    index % 2 ? indicesArr.push(index) : indicesArr.unshift(index);
  };

  indicesArr.forEach(index => {
    html += `
      <button class="button button--primary" type="button" data-expression-word=${wordsArr[index]}>
        ${wordsArr[index]}
      </button>
    `
  });

  return html;
};

const renderCollectExpressionData = (data) => {
  if (!!data) {
    expressionObject = data;

    const html = `
      <div class="collect-expression-content">
        <div>${data.translation}</div>
        <div data-expression-result-container></div>
        <div data-expression-right-result-container></div>
      </div>
      <div class="expression-words-container">${getSplitedExpression(data.expression)}</div>
    `;
  
    expressioncContainer.innerHTML = html;
    addExpressionWordHandler();
  } else {
    expressioncContainer.innerHTML = '<div class="winner-end"><h1>You won!</h1><div class="right-answer"><div>🎉</div></div></div>'
  }
};

async function getCollectExpressionData() {
  await fetch("./collect-expression.json")
  .then(res => res.json())
  .then(data => {
    allExpressions = data;
    expressionsIndex = 0;
    renderCollectExpressionData(data[0])
  })
  .catch(err => console.error(err));
};

const initMenuCollectExpression = () => {
  buttonMenuCollectExpressionOpen.addEventListener('click', openCollectExpression);
  buttonMenuCollectExpressionClose.addEventListener('click', closeCollectExpression);

  getCollectExpressionData();
};

const init = () => {
  clearMenu();
  generateWordCards();
  initMenu();
  initMenuList();
  initFormAddWord();
  initTagList();
  initMenuCollectExpression();
};

document.addEventListener("DOMContentLoaded", init);
