// ==========================
// /booking/ JS — рабочий вариант
// ==========================

const seatsContainer = document.getElementById("seats-div");
const invoiceBody = document.querySelector(".invoice-table-body");
const totalElement = document.getElementById("total");
const registerBtn = document.querySelector(".registration");
const loader = document.getElementById("loader");

let selectedSeats = [];
let currentTrain = null;
let totalPrice = 0;
const PRICE = 1200; // цена по умолчанию

// ===== CSRF =====
function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

// ===== Получаем trainId =====
const trainIdRaw = sessionStorage.getItem("selectedTrainId");
const trainId = parseInt(trainIdRaw);
console.log("selectedTrainId:", trainIdRaw);

// ===== Отключаем редирект для отладки =====
// if (!trainIdRaw || isNaN(trainId)) {
//     console.warn("Не выбран или некорректный поезд! trainId =", trainIdRaw);
//     // alert("Не выбран или некорректный поезд!");
//     // window.location.href = "/";
// }

// ===== Загрузка поезда =====
async function loadTrain() {
    if (!trainId || isNaN(trainId)) return;

    try {
        const response = await fetch(`/trains/${trainId}/`);

        if (!response.ok) {
            const text = await response.text();
            console.error("Ошибка загрузки поезда:", response.status, text);
            return;
        }

        currentTrain = await response.json();
        console.log("Данные поезда:", currentTrain);

        if (!currentTrain.vagons || currentTrain.vagons.length === 0) {
            console.warn("У этого поезда нет доступных вагонов:", currentTrain);
            return;
        }

        renderWagons();
    } catch (err) {
        console.error("Ошибка при fetch поезда:", err);
    }
}

// ===== Отображение вагонов =====
function renderWagons() {
    const wagonButtons = document.querySelectorAll(".vagonImg");

    if (!wagonButtons || wagonButtons.length === 0) {
        console.warn("Кнопки вагонов не найдены на странице");
        return;
    }

    wagonButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const wagon = currentTrain.vagons[index];
            if (!wagon || !wagon.seats || wagon.seats.length === 0) {
                console.warn("В этом вагоне нет доступных мест:", wagon);
                return;
            }
            renderSeats(wagon);
        });
    });

    // Автопоказ первого вагона
    renderSeats(currentTrain.vagons[0]);
}

// ===== Отображение мест =====
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

// ===== Добавление места в счет =====
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

// ===== Покупка билетов =====
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
                    user: 1, // замените на реального пользователя
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
        console.error("Ошибка при покупке мест:", err);
        alert("Одно из мест уже занято или произошла ошибка!");
    } finally {
        loader.classList.add("hidden");
    }
});

// ===== Запуск =====
loadTrain();