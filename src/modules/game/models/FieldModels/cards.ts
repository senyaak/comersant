import { GameEvent, EventItem, EventType } from './../events';

export interface Cards {
  [key: string]: GameEvent;
}

export function getCardsByType(type: 'post' | 'risk' | 'surpise'): Cards {
  switch (type) {
    case 'post':
      return Post;
    case 'risk':
      return Risk;
    case 'surpise':
      return Surprise;
    default:
      throw new Error(`Invalid card type: ${type}`);
  }
}

export const Post: Cards = {
  /* balance change events */
  grant: {
    msg: 'Вам предоставлен президентский гранд 25000',
    amount: 25000,
    type: EventType.BalanceChange,
  },
  waresSold: {
    msg: 'Вы выгодно сбыли товар 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  rentPayout: {
    msg: 'Доход аренды приносит 10000',
    amount: 10000,
    type: EventType.BalanceChange,
  },
  branchIncome: {
    msg: 'Доход региональных фелиалов 8000',
    amount: 8000,
    type: EventType.BalanceChange,
  },
  tax: {
    msg: 'Заплатите налог на экспорт 10000',
    amount: -10000,
    type: EventType.BalanceChange,
  },
  competitionLoss: {
    msg: 'Канкуренты нанесли вам убыток 18000',
    amount: -18000,
    type: EventType.BalanceChange,
  },
  airlineTickets: {
    msg: 'Оплатите авиаперелёт 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  carRepair: {
    msg: 'Оплатите ремонт служебного транспорта 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  bill: {
    msg: 'Оплатите счёт 11000',
    amount: -11000,
    type: EventType.BalanceChange,
  },
  bill2: {
    msg: 'Оплатите счёт 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  fine: {
    msg: 'Оплатите штраф гаи 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  year: {
    msg: 'Получите годовой % 10000',
    amount: 10000,
    type: EventType.BalanceChange,
  },
  year2: {
    msg: 'Получите годовой % 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  phoneBill: {
    msg: 'Оплатите телефонные переговоры 1000',
    amount: -1000,
    type: EventType.BalanceChange,
  },
  dividends: {
    msg: 'Получите дивиденты от прибыли 10000',
    amount: 10000,
    type: EventType.BalanceChange,
  },
  inheritance: {
    msg: 'Получите наследство 25000',
    amount: 25000,
    type: EventType.BalanceChange,
  },
  interestOnDeposits: {
    msg: 'Получите проценты по вкладам 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  prodModernization: {
    msg: 'Расходы на модернизаию производства 12000',
    amount: -12000,
    type: EventType.BalanceChange,
  },
  regestryEntry: {
    msg: 'Регистрация организаций обходиться вам в 15000',
    amount: -15000,
    type: EventType.BalanceChange,
  },
  repairs: {
    msg: 'Ремонт предприятий обходиться вам в 20000',
    amount: -20000,
    type: EventType.BalanceChange,
  },
  fireInspection: {
    msg: 'Пожарный инспектор выписал вам штраф 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  taxFine: {
    msg: 'Штраф за неуплату налогов 10000',
    amount: -10000,
    type: EventType.BalanceChange,
  },
  concealingIncome: {
    msg: 'Штраф за сокрытие доходов 24000',
    amount: -24000,
    type: EventType.BalanceChange,
  },
  /* move to events */
  moveToCenter: {
    msg: 'Вам разрешено встать в центральном круге',
    type: EventType.MoveToCenter,
  },
  moveToCenter2: {
    msg: 'Вам разрешено встать в центральном круге',
    type: EventType.MoveToCenter,
  },
  moveToTaxOffice: {
    msg: 'Вас вызывают в налоговую службу',
    type: EventType.TaxService,
  },
  moveToTaxOffice2: {
    msg: 'Вас вызывают в налоговую службу',
    type: EventType.TaxService,
  },
  YSTTickets: {
    msg: 'Вам купили билеты на спектакль в тюз',
    type: EventType.MoveTo,
    to: 'children_theater',
  },
  theaterTickets: {
    msg: 'Вам купили билеты в театр оперы и балета',
    type: EventType.MoveTo,
    to: 'ballet',
  },
  moveToRestoran: {
    msg: 'Посетите банкет в ресторане',
    type: EventType.MoveTo,
    to: 'restorant',
  },
  /* get events */
  getG: {
    msg: 'Тащите карту Сюоприз',
    item: EventItem.Mail,
    type: EventType.GetEvent,
  },
  getG2: {
    msg: 'Тащите карту Сюрприз',
    item: EventItem.Mail,
    type: EventType.GetEvent,
  },
  getTaxFree: {
    msg: 'Вы освобождены от посещения налоговой службы',
    item: EventItem.TaxFree,
    type: EventType.GetEvent,
  },
  getRisk: {
    msg: 'Тащите карту риск',
    item: EventItem.Risk,
    type: EventType.GetEvent,
  },
  getSurprise: {
    msg: 'Тащите карту сюрприз',
    item: EventItem.Surprise,
    type: EventType.GetEvent,
  },
};

export const Surprise: Cards = {
  /* balance change events */
  cardWin: {
    msg: 'Вам отдали карточный долг 5000',
    amount: 5000,
    type: EventType.BalanceChange,
  },
  transfer: {
    msg: 'Вам перевод 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  award: {
    msg: 'Вы примеруетесь на 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  award2: {
    msg: 'Вы примеруетесь на 25000',
    amount: 25000,
    type: EventType.BalanceChange,
  },
  antique: {
    msg: 'Вы удачно сбыли антиквариат 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  sprintWin: {
    msg: 'Вы выиграли в "Спринт" 10000',
    amount: 10000,
    type: EventType.BalanceChange,
  },
  tvWin: {
    msg: 'Вы выиграли приз в телевикторине 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  lotoWin: {
    msg: 'Вы выиграли в "Спортлото" 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  fine: {
    msg: 'Заплатите штраф 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  fine2: {
    msg: 'Заплатите штраф 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  investmentFail: {
    msg: 'Неудачные инвестиции, убыток 10000',
    amount: -10000,
    type: EventType.BalanceChange,
  },
  robbery: {
    msg: 'Ограблена касса на сумму 40000',
    amount: -40000,
    type: EventType.BalanceChange,
  },
  rent: {
    msg: 'Оплатите аренду 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  newOffice: {
    msg: 'Переезд в новый офис обходится в 12000',
    amount: -12000,
    type: EventType.BalanceChange,
  },
  unknownBenefactor: {
    msg: 'Помощь от неизвестного доброжелателя 20000',
    amount: 20000,
    type: EventType.BalanceChange,
  },
  bestEmployee: {
    msg: 'Премируйте лучших сотрудников 12000',
    amount: -12000,
    type: EventType.BalanceChange,
  },
  auction: {
    msg: 'Прибыль с участия в аукционе 8000',
    amount: 8000,
    type: EventType.BalanceChange,
  },
  event: {
    msg: 'Расходы на корпоратив 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  stockPrices: {
    msg: 'Скачок курса акций приносит 10000',
    amount: 10000,
    type: EventType.BalanceChange,
  },
  currency: {
    msg: 'Упал курс доллара. Убытки 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  /* moneyTransfer */
  doughter: {
    msg: 'У вас родилась дочь. Все игроки дарят по 8000',
    amount: 8000,
    type: EventType.MoneyTransfer,
  },
  anniversary: {
    msg: 'У вас юбилей. Все игроки дарят по 10000',
    amount: 10000,
    type: EventType.MoneyTransfer,
  },
  /* move to events */
  moveToConcert: {
    msg: 'Вам подарили билет в концертный зал',
    type: EventType.MoveTo,
    to: 'concerthall',
  },
  moveToTaxOffice: {
    msg: 'Вас вызывают в налоговую службу',
    type: EventType.TaxService,
  },
  moveToTaxOffice2: {
    msg: 'Вас вызывают в налоговую службу',
    type: EventType.TaxService,
  },
  moveToLuzhniki: {
    msg: 'Вы приглашены на концерт в Лужниках',
    type: EventType.MoveTo,
    to: 'luzhniki',
  },
  moveToCafe: {
    msg: 'Партнёры предложили вам встречу в кафе',
    type: EventType.MoveTo,
    to: 'cafe',
  },
  moveToCulturInst: {
    msg: 'Посетите семинар в институте культуры',
    type: EventType.MoveTo,
    to: 'culture',
  },
  /* move events */
  back5: {
    msg: 'Вернитесь на 5 клеток назад',
    amount: -5,
    type: EventType.Move,
  },
  back10: {
    msg: 'Вернитесь на 10 клеток назад',
    amount: -10,
    type: EventType.Move,
  },
  forward5: {
    msg: 'Подвиньтесь на 5 клеток вперёд',
    amount: 5,
    type: EventType.Move,
  },
  forward10: {
    msg: 'Подвиньтесь на 10 клеток вперёд',
    amount: 10,
    type: EventType.Move,
  },
  /* skip turn */
  treatment: {
    msg: 'Вы отправляетесь на лечение в санаторий',
    type: EventType.SkipTurn,
  },
  vacation: {
    msg: 'Вы отправляетесь в отпуск',
    type: EventType.SkipTurn,
  },
  /* move player */
  leftPlayer: {
    msg: 'Определите место, куда поставить фишку слева сидящему',
    type: EventType.MovePlayer,
  },
  rightPlayer: {
    msg: 'Определите клетку, куда должен встать игрок, который справа',
    type: EventType.MovePlayer,
  },
};

export const Risk: Cards = {
  /* balance change events */
  bankError: {
    msg: 'Банк ошибся в вашу пользу 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  hushUp: {
    msg: 'Вас уличили в мошенничестве, замять дело 20000',
    amount: -20000,
    type: EventType.BalanceChange,
  },
  win: {
    msg: 'Ваш выйгрыш на скачках составил 8000',
    amount: 8000,
    type: EventType.BalanceChange,
  },
  comercial: {
    msg: 'Вложения в рекламу принесли доход 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  bribe: {
    msg: 'Вы подкупаете арбитражного судью 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  bribe2: {
    msg: 'Вы получили взятку 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  riskFail: {
    msg: 'К сожалению вы рисковали и проиграли 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  fire: {
    msg: 'Пожар на територии предприятия, убытки 25000',
    amount: -25000,
    type: EventType.BalanceChange,
  },
  profit: {
    msg: 'Прибыль 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  profit2: {
    msg: 'Прибыль 5000',
    amount: 5000,
    type: EventType.BalanceChange,
  },
  carRepair: {
    msg: 'Ремонт автомобиля после ДТП 5000',
    amount: -5000,
    type: EventType.BalanceChange,
  },
  import: {
    msg: 'Серый импорт приносит доход 12000',
    amount: 12000,
    type: EventType.BalanceChange,
  },
  shadowBusiness: {
    msg: 'Теневой бизнес приносит прибыль 15000',
    amount: 15000,
    type: EventType.BalanceChange,
  },
  warehouse: {
    msg: 'У вас затопило склад убытки 8000',
    amount: -8000,
    type: EventType.BalanceChange,
  },
  fine: {
    msg: 'Штраф 10000',
    amount: -10000,
    type: EventType.BalanceChange,
  },
  /* get events */
  security: {
    msg: 'Ваше предприятие взято под охрану милиции',
    item: EventItem.Security,
    type: EventType.GetEvent,
  },
  security2: {
    msg: 'Ваше предприятие взято под охрану милиции',
    item: EventItem.Security,
    type: EventType.GetEvent,
  },
  security3: {
    msg: 'Ваше предприятие взято под охрану милиции',
    item: EventItem.Security,
    type: EventType.GetEvent,
  },
  security4: {
    msg: 'Ваше предприятие взято под охрану милиции',
    item: EventItem.Security,
    type: EventType.GetEvent,
  },
  /* skip turn */
  vacation: {
    msg: 'Вы переутомились, пора в отпуск',
    type: EventType.SkipTurn,
  },
  treatment: {
    msg: 'Необходимо срочное лечение в следствии стресса',
    type: EventType.SkipTurn,
  },
  /* move to */
  moveTo: {
    msg: 'Идите на старт',
    type: EventType.MoveTo,
    to: 'Start',
  },
  moveToStatefarm: {
    msg: 'На утро после юбилея вы очнулись в совхозе',
    type: EventType.MoveTo,
    to: 'statefarm',
  },
  moveToMarkt: {
    msg: 'Посетите рынок',
    type: EventType.MoveTo,
    to: 'market',
  },
  /* property loss */
  lostProp: {
    msg: 'Одна из ваших организаций признана банкротом',
    type: EventType.PropertyLoss,
  },
  lostProp2: {
    msg: 'Сгорел один из ваших фелиалов',
    type: EventType.PropertyLoss,
  },
};
