const trainDiv = document.getElementById("trainTable");


const from = sessionStorage.getItem("fromInputValue");
const to = sessionStorage.getItem("toInputValue");
const date = sessionStorage.getItem("selectedDate");


if (!from || !to || !date) {
    trainDiv.innerHTML = `
        <div class='error-div'>
            <h2 data-translate="გთხოვთ შეავსოთ ყველა ველი">Please fill all fields</h2>
            <a href='/' data-translate="უკან მთავარზე">Back to main</a>
        </div>
    `;
} else {
    
    const cleanDate = date.split(':')[0];

    
    fetch(`/api/departures/?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${encodeURIComponent(cleanDate)}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(trains => {
            if (!trains.length) {
                trainDiv.innerHTML = `
                    <div class='error-div'>
                        <h2 data-translate="სასურველი მატარებელი ვერ მოიძებნა">No trains found</h2>
                        <a href='/' data-translate="დაბრუნდი უკან">Back</a>
                    </div>
                `;
                return;
            }

            let tr = "";
            trains.forEach(train => {
                const trip = train.trips[0] || {};
                let totalSeats = 0;
                let bookedSeats = 0;

                
                train.vagons.forEach(vagon => {
                    vagon.seats.forEach(seat => {
                     totalSeats++;
                    if (seat.isOccupied) bookedSeats++;
                    });
                });

                const percent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

                tr += `
                    <tr>
                        <td>
                            <p>#${train.number}</p>
                            <p data-translate="${train.name}">${train.name} Express</p>
                        </td>
                        <td>
                            <p>${trip.departure || 'N/A'}</p>
                        </td>
                        <td>
                            <p>${trip.source_name || 'N/A'} → ${trip.destination_name || 'N/A'}</p>
                        </td>
                        <td>
                            <button class="btn">Book</button>
                        </td>
                        <td id="popularity-${train.id}">
                            <div style="width: 100px; background: #eee; border-radius: 5px; overflow: hidden;">
                                <div style="width: ${percent}%; background: ${percent > 80 ? "#e74c3c" : percent > 50 ? "#f1c40f" : "#2ecc71"}; height: 12px;"></div>
                            </div>
                            <small style="font-size:15px; font-weight:500;">${percent}% <span data-translate="დაჯავშნილია">Occupied</span></small>
                        </td>
                    </tr>
                `;
            });

            trainDiv.innerHTML = tr;

            
            const btns = document.querySelectorAll(".btn");

            btns.forEach((btn, index) => {
            btn.addEventListener("click", () => {
            const train = trains[index];
            const trip = train.trips[0];

            sessionStorage.setItem("selectedTrainId", train.id);
            sessionStorage.setItem("selectedTripId", trip.id); 
            sessionStorage.setItem("selectedDate", cleanDate);

             window.location.href = "/booking/";
            });
           });
        })
        .catch(err => {
            console.error("Error fetching departures:", err);
            trainDiv.innerHTML = `
                <div class='error-div'>
                    <h2 data-translate="შეცდომა">Error fetching trains</h2>
                    <a href='/' data-translate="უკან მთავარზე">Back To Main</a>
                </div>
            `;
        });
}