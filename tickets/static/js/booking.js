// ==========================
// Получение выбранного поезда
// ==========================
const trainIdRaw = sessionStorage.getItem("selectedTrainId");
const trainId = parseInt(trainIdRaw);

if (!trainIdRaw || isNaN(trainId)) {
    alert("Не выбран или некорректный поезд! Пожалуйста, вернитесь на страницу со списком поездов.");
    window.location.href = "/"; 
}


const seatsContainer = document.getElementById("seats-div");
const invoiceBody = document.querySelector(".invoice-table-body");
const totalElement = document.getElementById("total");
const registerBtn = document.querySelector(".registration");
const loader = document.getElementById("loader");

let selectedSeats = [];
let currentTrain = null;
let totalPrice = 0;

const PRICE = 1200; 


function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}


async function loadTrain() {
    try {
        const response = await fetch(`/trains/${trainId}/`);

        if (!response.ok) {
            const text = await response.text();
            console.error("Ошибка загрузки поезда:", text);
            alert(`Не удалось загрузить поезд. Код ошибки: ${response.status}`);
            return;
        }

        currentTrain = await response.json();

        
        if (!currentTrain.wagons || currentTrain.wagons.length === 0) {
            alert("У этого поезда нет доступных вагонов.");
            return;
        }

        renderWagons();
    } catch (err) {
        console.error("Ошибка загрузки:", err);
        alert("Произошла ошибка при загрузке поезда. Попробуйте позже.");
    }
}


function renderWagons() {
    const wagonButtons = document.querySelectorAll(".vagonImg");

    wagonButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const wagon = currentTrain.wagons[index];
            if (!wagon || !wagon.seats || wagon.seats.length === 0) {
                alert("В этом вагоне нет доступных мест.");
                return;
            }
            renderSeats(wagon);
        });
    });
}


function renderSeats(wagon) {
    const rightLeft = document.querySelector(".left-left");
    const rightRight = document.querySelector(".left-right");
    const leftLeft = document.querySelector(".right-left");
    const leftRight = document.querySelector(".right-right");

    
    rightLeft.innerHTML = "";
    rightRight.innerHTML = "";
    leftLeft.innerHTML = "";
    leftRight.innerHTML = "";

    wagon.seats.forEach((seat, index) => {
        const seatBtn = document.createElement("button");
        seatBtn.innerText = seat.seat_number;

        if (seat.is_occupied) {
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
    totalPrice += seatPrice;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${seat.seat_number}</td>
        <td>${seatPrice}</td>
    `;

    invoiceBody.appendChild(row);
    totalElement.innerText = totalPrice;
}


registerBtn.addEventListener("click", async () => {
    if (selectedSeats.length === 0) {
        alert("Выберите место!");
        return;
    }

    loader.classList.remove("hidden");

    try {
        await Promise.all(selectedSeats.map(seat =>
            fetch("/tickets/", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({
                    user: 1, 
                    train: trainId,
                    seat: seat.id,
                    price: seat.price || PRICE
                })
            }).then(res => {
                if (!res.ok) throw new Error("Ошибка при покупке места");
            })
        ));

        alert("Билеты успешно куплены!");
        window.location.reload();
    } catch (err) {
        console.error(err);
        alert("Одно из мест уже занято или произошла ошибка!");
    } finally {
        loader.classList.add("hidden");
    }
});


 loadTrain();