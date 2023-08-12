const INITIAL_DATA_PATH = 'data.json',
  container = document.querySelector('[data-main-container]'),
  buttonNext = document.querySelector('[data-next-button]'),
  buttonPrev = document.querySelector('[data-prev-button]'),
  cardCounter = document.querySelector('[data-card-counter]')

const getData = async() => {
  return await fetch(INITIAL_DATA_PATH)
  .then(res => res.json())
  .then(data => data)
  .catch(err => console.error(err));
};

const cardRotateHandler = (cards) => {
  if (!cards.length) return;

  cards.forEach(card =>
    card.addEventListener('click', () => card.classList.toggle('card__flipped')));
}

const initCardCounter = (counter, total) => {
  cardCounter.innerHTML = `${counter} / ${total}`
}

const buttonClickHandler = (cards) => {
  if (!cards.length) return;

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

const renderCards = async () => {
  const data = await getData();
  let html = '';

  data.forEach(card => {
    const singleCard = `
    <li class="card" data-single-card>
      <div class="card__inner">
        <div class="card__front">
          <h4>${card.english}</h4>
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
  cardRotateHandler(cards);
  buttonClickHandler(cards);
  initCardCounter(1, cards.length)
};

const init = () => {
  renderCards();
};

document.addEventListener("DOMContentLoaded", init);
