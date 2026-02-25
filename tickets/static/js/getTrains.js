

const trainDiv = document.getElementById("trainTable");
let popularityData = {};


const from = sessionStorage.getItem("fromInputValue");
const to = sessionStorage.getItem("toInputValue");
const date = sessionStorage.getItem("selectedDate"); // YYYY-MM-DD


if (!from || !to || !date) {
    trainDiv.innerHTML = `<div class='error-div'>
        <h2 data-translate="გთხოვთ შეავსოთ ყველა ველი">Please fill all fields</h2>
        <a href='/' data-translate="უკან მთავარზე">Back to main</a>
    </div>`;
} else {
    
    console.log(`/api/departures/?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${date}`);

    fetch(`/api/departures/?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${date}`)
    .then(response => response.json())
    .then(trains => {
        let tr = "";

        if (trains.length > 0) {
            trains.forEach(train => {
                tr += `
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
                    <button class="btn" data-translate="დაჯავშნა">Book</button>
                  </td>
                  <td id="popularity-${train.id}">Loading...</td>
                </tr>`;
            });
        } else {
            tr = `<div class='error-div'>
                <h2 data-translate="სასურველი მატარებელი ვერ მოიძებნა">No trains found</h2>
                <a href='/' data-translate="დაბრუნდი უკან">Back</a>
            </div>`;
        }

        trainDiv.innerHTML = tr;

        
        const btns = document.querySelectorAll(".btn");
        btns.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                sessionStorage.setItem("indexOfBtn", index);
                sessionStorage.setItem("trainsArray", JSON.stringify(trains));
                window.location.href = "/booking/";
            });
        });

        
        trains.forEach(train => {
            fetch(`/api/trains/${train.id}/`) 
            .then(res => res.json())
            .then(trainDetail => {
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
                    <small style="font-size:15px; font-weight:500;">${percent}% <span data-translate="დაჯავშნილია">Occupied</span></small>
                    `;
                }
            });
        });

    })
    .catch(err => {
        trainDiv.innerHTML = `<div class='error-div'>
            <h2 data-translate="შეცდომა">Error</h2>
            <a href='/' data-translate="უკან მთავარზე">Back To Main</a>
        </div>`;
        console.error(err);
    });
}