const url = 'https://noroff-komputer-store-api.herokuapp.com/computers';

async function getData() {
    try {
        const data = await fetch(url, { method: 'get' });
        return data.json();
    } catch (e) {
        alert('Error while attempting to fetch resources');
        return;
    }
}

export default getData;