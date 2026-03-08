const seatsContainer = document.getElementById("seats-div");
const invoiceBody = document.querySelector(".invoice-table-body");
const totalElement = document.getElementById("total");
const registerBtn = document.querySelector(".registration");
const loader = document.getElementById("loader");
const bookingDiv = document.getElementById("table-details-checkout");
const passengersInfo = document.querySelector(".passengers-info-div");
const errorDiv = document.querySelector(".error");

let selectedSeats = [];
let currentTrain = null;
let totalPrice = 0;
const PRICE = 1200;

function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

const trainIdRaw = sessionStorage.getItem("selectedTrainId");
const trainId = parseInt(trainIdRaw);

const selectedDateRaw = sessionStorage.getItem("selectedDate");
const selectedDate = selectedDateRaw ? selectedDateRaw.split(':')[0] : null;

const tripId = sessionStorage.getItem("selectedTripId"); 

async function loadTrain() {
    if (!trainId || isNaN(trainId)) return;

    try {
        const response = await fetch(`/api/trains/${trainId}/?trip=${tripId}`);
        if (!response.ok) throw new Error(await response.text());

        currentTrain = await response.json();

        const trip = currentTrain.trips?.find(t => t.id == tripId) || {};

        bookingDiv.innerHTML = `
            <div>
              <p>#${currentTrain.number}</p>
              <p>${currentTrain.name}</p>
              <p>Source: ${trip.departure || 'N/A'} (${trip.source_name || 'N/A'})</p>
              <p>Destination: ${trip.destination_name || 'N/A'}</p>
            </div>
        `;

        const passengerCount = Number(sessionStorage.getItem("passengerCount")) || 1;
        passengersInfo.innerHTML = "";

        for (let i = 0; i < passengerCount; i++) {
            passengersInfo.innerHTML += `
            <div class="passenger">
                <h4>Passenger ${i + 1}</h4>
                <input type="text" placeholder="First Name" class="nameInput">
                <input type="text" placeholder="Last Name" class="lastNameInput">
                <input type="text" placeholder="Passport/ID" class="privateNum">
                <button onclick="chooseSeat()" class="chooseSeat">Choose Seat</button>
            </div>`;
        }

        renderWagons();

    } catch (err) {
        console.error("Train load error:", err);
        errorDiv.innerText = "Train data load error!";
    }
}

let popUp = document.querySelector('.added');

function chooseSeat() {
    popUp.innerHTML = `
        <div style="position:fixed; left:0; right:0; top:0; bottom:0; display:flex; align-items:center; justify-content:center; background-color: rgba(0,0,0,0.374);">
            <div style="display:flex; gap:20px; padding:20px; border-radius:6px; background-color:white;">
                <button onclick='getSeats(0)'>
                    <img src="${STATIC_URL}images/firstWagon.png" alt="First Vagon" style="width:200px; height:auto;" />
                </button>
                <button onclick='getSeats(1)'>
                    <img src="${STATIC_URL}images/midWagon.png" alt="Middle Vagon" style="width:200px; height:auto;" />
                </button>
                <button onclick='getSeats(2)'>
                    <img src="${STATIC_URL}images/lastWagon.png" alt="Last Vagon" style="width:200px; height:auto;" />
                </button>
            </div>
        </div>
    `;
}

function getSeats(vagonIndex) {
    
    popUp.innerHTML = "";

    const chooseTrainsVagon = currentTrain.vagons[vagonIndex];

    
    const seatGrid = document.createElement("div");
    seatGrid.classList.add("seat-popup-inner");

    chooseTrainsVagon.seats.forEach(seat => {
        const btn = document.createElement('button');
        btn.innerText = seat.seat_number || seat.number;

        if (seat.isOccupied) {
            btn.classList.add("occupied");
            btn.disabled = true;
        } else {
            btn.classList.add("available");
            btn.addEventListener('click', () => addSeatToInvoice(seat, btn));
        }

        seatGrid.appendChild(btn);
    });

   
    popUp.appendChild(seatGrid);
    
    
    popUp.classList.add("seat-popup");
}

popUp.addEventListener('click', (e) => {
    if (e.target === popUp) { 
        popUp.innerHTML = "";
        popUp.classList.remove("seat-popup");
    }
});popUp.addEventListener('click', (e) => {
    if (e.target === popUp) { 
        popUp.innerHTML = "";
        popUp.classList.remove("seat-popup");
    }
});
function renderWagons() {
    const wagonButtons = document.querySelectorAll(".vagonImg");
    if (!wagonButtons || wagonButtons.length === 0) return;

    wagonButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const wagon = currentTrain.vagons[index];
            if (!wagon || !wagon.seats) return;
            renderSeats(wagon);
        });
    });

    if (currentTrain.vagons.length) renderSeats(currentTrain.vagons[0]);
}

function renderSeats(wagon) {
    const rightLeft = document.querySelector(".left-left");
    const rightRight = document.querySelector(".left-right");
    const leftLeft = document.querySelector(".right-left");
    const leftRight = document.querySelector(".right-right");
    if (!rightLeft || !rightRight || !leftLeft || !leftRight) return;

    rightLeft.innerHTML = "";
    rightRight.innerHTML = "";
    leftLeft.innerHTML = "";
    leftRight.innerHTML = "";

    wagon.seats.forEach((seat, index) => {
        const seatBtn = document.createElement("button");
        seatBtn.innerText = seat.seat_number || seat.number;

        if (seat.tickets && seat.tickets.length > 0) {
            seatBtn.disabled = true;
            seatBtn.style.background = "#999";
        } else {
            seatBtn.addEventListener("click", () => addSeatToInvoice(seat));
        }

        if (index % 4 === 0) rightLeft.appendChild(seatBtn);
        else if (index % 4 === 1) rightRight.appendChild(seatBtn);
        else if (index % 4 === 2) leftLeft.appendChild(seatBtn);
        else leftRight.appendChild(seatBtn);
    });
}

function addSeatToInvoice(seat) {
    if (selectedSeats.find(s => s.id === seat.id)) return;

    selectedSeats.push(seat);
    const seatPrice = seat.price || PRICE;
    totalPrice += Number(seatPrice);

    const row = document.createElement("tr");
    row.innerHTML = `<td>${seat.seat_number || seat.number}</td><td>${seatPrice}</td>`;
    invoiceBody.appendChild(row);
    totalElement.innerText = totalPrice;
}

registerBtn.addEventListener("click", async () => {
    const nameInputs = document.getElementsByClassName("nameInput");
    const lastNameInputs = document.getElementsByClassName("lastNameInput");
    const privNums = document.getElementsByClassName("privateNum");

    let valid = true;
    for (let i = 0; i < nameInputs.length; i++) {
        if (!nameInputs[i].value || !lastNameInputs[i].value || !privNums[i].value) {
            valid = false;
            break;
        }
    }

    if (!valid) {
        alert("Please fill all forms for passengers!");
        return;
    }

    if (selectedSeats.length !== nameInputs.length) {
        alert("Please choose seats for passengers!");
        return;
    }

    const ticketsData = [];

    for (let i = 0; i < selectedSeats.length; i++) {
        ticketsData.push({
         trip: Number(tripId),
         seat: selectedSeats[i].id,
         first_name: nameInputs[i].value,
         last_name: lastNameInputs[i].value,
         personal_id: privNums[i].value,
         price: selectedSeats[i].price || PRICE
      });
    }

    
    sessionStorage.setItem("tickets", JSON.stringify(ticketsData));
    sessionStorage.setItem("date", selectedDate);
    window.location.href = "/payment/";
});

loadTrain();