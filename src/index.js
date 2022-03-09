import { createEl, getCurrAmount } from './helpers.js';
import getData from './dataService.js';

document.onload = await start();

let hasLoan = false;

async function start() {
    const data = await getData();

    const loanBtnEl = document.querySelector('#get_loan');
    const workBtnEl = document.querySelector('#work_btn');
    const saveBtnEl = document.querySelector('#save_btn');

    const currAmtPayEl = document.querySelector('#curr-amount-pay');
    const currAmtBankEl = document.querySelector('#curr-amount-bank');
    const currLoanBlnEl = document.querySelector('#curr-amount-loan');
    const selectEl = document.querySelector('#list');

    const loanSection = document.querySelector('#loan_section');
    const dropdownSection = document.querySelector('#dropdown');
    const detailsSection = document.querySelector('#details');

    renderData(data, selectEl);

    const elements = {
        selectEl,
        dropdownSection,
        detailsSection,
        currAmtBankEl
    };

    selectEl.addEventListener(
        'change',
        renderInfo.bind(null, data, elements),
    );

    workBtnEl.addEventListener('click', () => {
        let currAmount = getCurrAmount(currAmtPayEl);
        currAmount += 100.0;
        currAmtPayEl.textContent = currAmount.toFixed(2) + ' €';
    });

    saveBtnEl.addEventListener('click', () => {
        let currAmtFromBank = getCurrAmount(currAmtBankEl);
        let currAmtFromPay = getCurrAmount(currAmtPayEl);

        if (hasLoan) {
            const afterLoan = currAmtFromPay * 0.9;
            const currLoanAmt = getCurrAmount(currLoanBlnEl);
            const calc = currLoanAmt - (currAmtFromPay - afterLoan);

            currLoanBlnEl.textContent =
                calc <= 0 ? '0.00 €' : calc.toFixed(2) + ' €';

            currAmtFromPay = afterLoan;

            if (calc <= 0) {
                hasLoan = false;
                currAmtFromBank += Math.abs(calc);
                const repayBtn = document.querySelector('#repay-btn');
                repayBtn ? repayBtn.remove() : null;
            }
        }

        currAmtBankEl.textContent = (currAmtFromBank + currAmtFromPay).toFixed(2) + ' €';
        currAmtPayEl.textContent = '0.00 €';
    });

    loanBtnEl.addEventListener('click', () => {
        const reqAmt = Number(
            window.prompt('How much money do you want to loan'),
        );
        let currBankAmt = getCurrAmount(currAmtBankEl);

        if (!reqAmt || reqAmt > currBankAmt * 2 || hasLoan) {
            alert('You cannot get this loan!');
            return;
        }

        currLoanBlnEl.textContent = reqAmt.toFixed(2) + ' €';
        currBankAmt += reqAmt;
        currAmtBankEl.textContent = currBankAmt.toFixed(2) + ' €';

        hasLoan = true;

        const loanBtn = createEl('button', { id: 'repay-btn' }, 'Repay Loan');
        loanSection.appendChild(loanBtn);

        const repayBtnEl = document.querySelector('#repay-btn');

        repayBtnEl.addEventListener(
            'click',
            repay.bind(null, currAmtPayEl, currLoanBlnEl, hasLoan),
        );
    });
}

async function renderData(data, selectEl) {
    for (const obj of data) {
        let optionEl = createEl('option', { value: obj['id'] }, obj['title']);
        selectEl.appendChild(optionEl);
    }
}

function renderInfo(data, elements) {
    const el = elements.dropdownSection.querySelector('h1');

    if (el != null) {
        el.remove();
        elements.dropdownSection.querySelector('ul').remove();
        elements.detailsSection.querySelector('h1').remove();
        elements.detailsSection.replaceChildren();
    }

    const computerId = elements.selectEl.value;
    const computer = data[computerId - 1];

    const h1El = createEl('h1', {}, 'Features:');
    const ulEl = createEl('ul', {}, '');

    for (const spec of computer.specs) {
        ulEl.appendChild(createEl('li', {}, spec));
    }

    const stockEl = createEl('li', { id: 'stock' }, 'Stock: ' + computer.stock);

    ulEl.appendChild(stockEl);

    elements.dropdownSection.appendChild(h1El);
    elements.dropdownSection.appendChild(ulEl);

    const divTtlImg = createEl('div', {},
        createEl('h1', {}, computer.title),
        createEl('img', { src: '/computer' + computer.image })
    );

    const divInfo = createEl('div', {},
        createEl('p', {}, computer.description),
        createEl('h1', {}, computer.price.toFixed(2) + ' €'),
        createEl('button', { id: 'buyBtn', price: computer.price.toFixed(2), articleId: computer.id }, 'Buy')
    );

    elements.detailsSection.appendChild(divTtlImg);
    elements.detailsSection.appendChild(divInfo);

    const buyBtn = document.querySelector('#buyBtn');

    buyBtn.addEventListener('click', buy.bind(null, data, elements));
}

function buy(data, elements, ev) {
    const btn = ev.target;
    const computerPrice = btn.price;
    const computerId = btn.articleId;

    let bankAmt = getCurrAmount(elements.currAmtBankEl);

    const stock = Number(data[computerId - 1].stock);

    if (bankAmt < computerPrice) {
        alert('You can not afford this computer');
        return;
    } else if (stock <= 0) {
        alert('This computer is out of stock');
        return;
    }

    bankAmt -= computerPrice;

    elements.currAmtBankEl.textContent = bankAmt.toFixed(2) + ' €';
    data[computerId - 1].stock--;

    document.querySelector('#stock').textContent = 'Stock: ' + data[computerId - 1].stock;

    alert('You are now the owner of the new laptop!');
}

function repay(currAmtPayEl, currLoanBlnEl) {
    const payAmt = getCurrAmount(currAmtPayEl);

    if (payAmt == 0) {
        alert('You do not have money in your pay account!');
        return;
    }

    let loanAmt = getCurrAmount(currLoanBlnEl);

    loanAmt -= payAmt;

    if (loanAmt <= 0) {
        currAmtPayEl.textContent = Math.abs(loanAmt).toFixed(2) + ' €';
        currLoanBlnEl.textContent = '0.00 €';
        hasLoan = false;

        document.querySelector('#repay-btn').remove();
        return;
    }

    currLoanBlnEl.textContent = loanAmt.toFixed(2) + ' €';
    currAmtPayEl.textContent = '0.00 €';
}