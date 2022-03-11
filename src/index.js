import { createEl, formatAcc, showModal } from './helpers.js';
import getData from './dataService.js';

document.addEventListener('DOMContentLoaded', start);

let hasLoan = false;
let payAcc = 0;
let bankAcc = 0;
let loanAcc = 0;

const modal = document.querySelector('#myModal');
const closeBtn = document.querySelector('#closeBtn');
const messageEl = document.querySelector('#message');

const loanBtn = document.querySelector('#get_loan');
const workBtn = document.querySelector('#work_btn');
const saveBtn = document.querySelector('#save_btn');

const currAmtPayEl = document.querySelector('#curr-amount-pay');
const currAmtBankEl = document.querySelector('#curr-amount-bank');
let currLoanBlnEl;
const selectEl = document.querySelector('#list');

let loanSection;
const dropdownSection = document.querySelector('#dropdown');
const detailsSection = document.querySelector('#details');
const mainSection = document.querySelector('#main_section');
const workSection = document.querySelector('#work_section');

async function start() {
    const data = await getData();
    renderData(data, selectEl);

    selectEl.addEventListener('change', renderInfo.bind(null, data));
}

workBtn.addEventListener('click', () => {
    payAcc += 100.0;
    currAmtPayEl.textContent = formatAcc(payAcc);
});

saveBtn.addEventListener('click', () => {
    if (hasLoan) {
        const afterPayment = payAcc * 0.9;
        const payment = loanAcc - (payAcc - afterPayment);

        loanAcc = payment;

        currLoanBlnEl.textContent = payment <= 0 ? formatAcc(0) : formatAcc(payment);

        payAcc = afterPayment;

        if (payment <= 0) {
            loanAcc = 0;
            hasLoan = false;
            bankAcc += Math.abs(payment);
            loanSection.remove();
        }
    }

    bankAcc = bankAcc + payAcc;
    currAmtBankEl.textContent = formatAcc(bankAcc);

    payAcc = 0;
    currAmtPayEl.textContent = formatAcc(payAcc);
});

loanBtn.addEventListener('click', () => {
    const reqAmt = Number(window.prompt('How much money do you want to loan'));

    if (!reqAmt || reqAmt > bankAcc * 2 || hasLoan) {
        showModal('You cannot get this loan!');
        return;
    }

    const loanSec = createEl('article', { className: 'box background', id: 'loan_section' },
        createEl('h1', {}, 'Loan Overview'),
        createEl('div', { className: 'balance-wrapper' },
            createEl('p', { id: 'loan_balance' }, 'Balance:'),
            createEl('p', { id: 'curr-amount-loan' }, formatAcc(reqAmt))
        ),
        createEl('button', { id: 'repay-btn' }, 'Repay Loan')
    );


    mainSection.insertBefore(loanSec, workSection);

    currLoanBlnEl = document.querySelector('#curr-amount-loan');
    loanSection = document.querySelector('#loan_section');

    loanAcc += reqAmt;
    bankAcc += reqAmt;
    hasLoan = true;

    currAmtBankEl.textContent = formatAcc(bankAcc);

    const repayBtn = document.querySelector('#repay-btn');

    repayBtn.addEventListener('click', repay);
});

async function renderData(data, selectEl) {
    for (const obj of data) {
        let optionEl = createEl('option', { value: obj['id'] }, obj['title']);
        selectEl.appendChild(optionEl);
    }
}

function renderInfo(data) {
    const el = dropdownSection.querySelector('h1');

    if (el != null) {
        el.remove();
        dropdownSection.querySelector('ul').remove();
        detailsSection.querySelector('h1').remove();
        detailsSection.replaceChildren();
    }

    const computerId = selectEl.value;
    const computer = data[computerId - 1];

    const h1El = createEl('h1', {}, 'Features:');
    const ulEl = createEl('ul', {}, '');

    for (const spec of computer.specs) {
        ulEl.appendChild(createEl('li', {}, spec));
    }

    const stockEl = createEl('li', { id: 'stock' }, 'Stock: ' + computer.stock);

    ulEl.appendChild(stockEl);

    dropdownSection.appendChild(h1El);
    dropdownSection.appendChild(ulEl);

    const divTtlImg = createEl('div', {},
        createEl('h1', {}, computer.title),
        createEl('img', { src: '/computer/' + computer.image }),
    );

    const divInfo = createEl('div', {},
        createEl('p', {}, computer.description),
        createEl('h1', {}, formatAcc(computer.price)),
        createEl('button', {
            id: 'buyBtn',
            price: computer.price.toFixed(2),
            articleId: computer.id,
        }, 'Buy', )
    );

    detailsSection.appendChild(divTtlImg);
    detailsSection.appendChild(divInfo);

    const buyBtn = document.querySelector('#buyBtn');

    buyBtn.addEventListener('click', buy.bind(null, data));
}

function buy(data, ev) {
    const btn = ev.target;
    const computerPrice = btn.price;
    const computerId = btn.articleId;
    const stock = Number(data[computerId - 1].stock);

    if (bankAcc < computerPrice) {
        showModal('You cannot afford this computer');
        return;
    } else if (stock <= 0) {
        showModal('This computer is out of stock');
        return;
    }

    bankAcc -= computerPrice;

    currAmtBankEl.textContent = formatAcc(bankAcc);
    data[computerId - 1].stock--;

    document.querySelector('#stock').textContent =
        'Stock: ' + data[computerId - 1].stock;

    showModal('You are now owner of a new laptop!');
}

function repay() {
    if (payAcc == 0) {
        showModal('You do not have money in your pay account!');
        return;
    }

    loanAcc -= payAcc;

    if (loanAcc <= 0) {
        currAmtPayEl.textContent = formatAcc(0);
        bankAcc += Math.abs(loanAcc);
        payAcc = 0;
        loanAcc = 0;

        currAmtBankEl.textContent = formatAcc(bankAcc);
        currLoanBlnEl.textContent = formatAcc(loanAcc);
        hasLoan = false;
        loanSection.remove();

        return;
    }

    payAcc = 0;

    currLoanBlnEl.textContent = formatAcc(loanAcc);
    currAmtPayEl.textContent = formatAcc(payAcc);
}

export { modal, closeBtn, messageEl };