function linkAddress() {
    const addressInput = document.getElementById("addressInput");
    const address = addressInput.value.trim();
    const outputDiv = document.getElementById("output");

    if (address === "") {
        outputDiv.innerHTML = "<p class='error-message'>Please enter an address.</p>"; //Added class for styling
        return;
    }

    const link = document.createElement("a");
    link.href = "https://www.google.com/maps/place/" + encodeURIComponent(address);
    link.textContent = address;
    link.target = "_blank";

    outputDiv.innerHTML = "";
    outputDiv.appendChild(link);

    addToHistory(address);
    displayHistory();
}

function addToHistory(address) {
    let history = getHistory();
    if (!history.includes(address)) {
        history.push(address);
    }
    localStorage.setItem("addressHistory", JSON.stringify(history));
}

function getHistory() {
    const historyJSON = localStorage.getItem("addressHistory");
    return historyJSON ? JSON.parse(historyJSON) : [];
}

function displayHistory() {
    const historyDiv = document.getElementById("history");
    const history = getHistory();

    historyDiv.innerHTML = "";

    if (history.length === 0) {
        historyDiv.innerHTML = "<p>No previous addresses.</p>";
        return;
    }

    const ul = document.createElement("ul");
    history.forEach(address => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "https://www.google.com/maps/place/" + encodeURIComponent(address);
        link.textContent = address;
        link.target = "_blank";
        li.appendChild(link);
        ul.appendChild(li);
    });
    historyDiv.appendChild(ul);
}

const addressInput = document.getElementById("addressInput");
addressInput.addEventListener('input', linkAddress);

displayHistory();
