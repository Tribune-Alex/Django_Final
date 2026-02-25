const trainDiv = document.getElementById("trainTable");
let popularityData = {};


const from = sessionStorage.getItem("fromInputValue");
const to = sessionStorage.getItem("toInputValue");
const date = sessionStorage.getItem("georgianWeekDay");

if (!from || !to || !date) {
    trainDiv.innerHTML = `<div class='error-div'>
        <h2>Error: Fill all forms</h2>
        <a href='/'>Back</a>
    </div>`;
} else {
    async function loadTrains() {
        try {
            
            const response = await fetch(`/api/departures/?source=${from}&destination=${to}&date=${date}`);
            const trains = await response.json();

            
            const trainList = trains.results ? trains.results : trains;

            if (trainList.length === 0) {
                trainDiv.innerHTML = `<div class='error-div'>
                    <h2 data-translate="სასურველი მატარებელი ვერ მოიძებნა">Сожалеем, подходящие поезда не найдены</h2>
                    <a href='/' data-translate="დაბრუნდი უკან">Вернуться назад</a>
                </div>`;
                return;
            }

            let trHTML = "";

            trainList.forEach(train => {
                trHTML += `
                    <tr>
                        <td>
                            <p>#${train.number}</p>
                            <p data-translate="${train.name}">${train.name} Express</p>
                        </td>
                        <td>
                            <p>${train.departure}</p>
                            <p data-translate="${train.source}">${train.source}</p>
                        </td>
                        <td>
                            <p>${train.arrival}</p>
                            <p data-translate="${train.destination}">${train.destination}</p>
                        </td>
                        <td>
                            <button class="btn" data-translate="დაჯავშნა">დაჯავშნა</button>
                        </td>
                        <td id="popularity-${train.id}">Loading...</td>
                    </tr>
                `;
            });

            trainDiv.innerHTML = trHTML;

            
            const btns = document.querySelectorAll(".btn");
            btns.forEach((btn, index) => {
                btn.addEventListener("click", () => {
                    sessionStorage.setItem("indexOfBtn", index);
                    sessionStorage.setItem("trainsArray", JSON.stringify(trainList));
                    window.location.href = "/booking/";
                });
            });

            
            for (let train of trainList) {
                const detailRes = await fetch(`/api/trains/${train.id}/`);
                const trainDetail = await detailRes.json();

                let booked = 0;
                let total = 0;

                trainDetail.vagons.forEach(vagon => {
                    vagon.seats.forEach(seat => {
                        total++;
                        if (seat.isOccupied) booked++;
                    });
                });

                const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
                popularityData[train.id] = { booked, total, percent };

                const percentCell = document.querySelector(`#popularity-${train.id}`);
                if (percentCell) {
                    percentCell.innerHTML = `
                        <div style="width: 100px; background: #eee; border-radius: 5px; overflow: hidden;">
                            <div style="width: ${percent}%; background: ${percent > 80 ? "#e74c3c" : percent > 50 ? "#f1c40f" : "#2ecc71"}; height: 12px;"></div>
                        </div>
                        <small style="font-size:15px; font-weight:500;">${percent}% <span data-translate="დაჯავშნილია">Занято</span></small>
                    `;
                }
            }

        } catch (error) {
            trainDiv.innerHTML = `<div class='error-div'>
                <h2>Error</h2>
                <a href='/'>Back</a>
            </div>`;
            console.error(error);
        }
    }

    loadTrains();
}