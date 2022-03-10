import { modal, closeBtn, messageEl } from './index.js';

function formatAcc(account) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(account);
}

function createEl(type, attr, ...content) {
    const element = document.createElement(type);

    for (let prop in attr) {
        element[prop] = attr[prop];
    }
    for (let item of content) {
        if (typeof item == 'string' || typeof item == 'number') {
            item = document.createTextNode(item);
        }
        element.appendChild(item);
    }

    return element;
}

function showModal(text) {
    messageEl.textContent = text;
    modal.style.display = 'block';

    closeBtn.onclick = () => {
        modal.style.display = 'none';
        messageEl.textContent = '';
    };

    setTimeout(() => {
        modal.style.display = 'none';
        messageEl.textContent = '';
    }, 3500);
}

export { formatAcc, createEl, showModal };