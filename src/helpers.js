function getCurrAmount(currAmountEl) {
    return Number(currAmountEl.textContent.split(/\s+/)[0]);
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

export { getCurrAmount, createEl };