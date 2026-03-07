const myForm = document.querySelector(".my-form");
const textInput = document.getElementById("textInput");
const container = document.querySelector(".container");
const ticketinfo = document.querySelector(".ticket-info");
const deleteTicketBtn = document.querySelector(".delete-ticket");
const errorDiv = document.querySelector(".error");

const printBtn = document.querySelector(".print");
const downloadBtn = document.querySelector(".download");
const ticketEl = document.querySelector(".ticket-info");


async function cancelTicket(ticketNumber) {
  try {
    const csrftoken = getCookie('csrftoken'); // функция для получения cookie

    const res = await fetch(`/api/tickets/${ticketNumber}/cancel/`, {
      method: "DELETE",
      headers: {
        'X-CSRFToken': csrftoken,
      },
    });

    if (!res.ok) throw new Error("Can't delete ticket");

    container.style.display = "none";
    errorDiv.style.display = "flex";
    errorDiv.innerHTML = "<p data-translate='ბილეთი წარმატებით წაიშალა!'>ბილეთი წარმატებით წაიშალა!</p>";
    console.log("Ticket deleted successfully");
  } catch (error) {
    errorDiv.style.display = "flex";
    errorDiv.innerHTML = `<p>Can't delete ticket</p>`;
    console.error(error);
  }
}

// Получение CSRF токена из cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

deleteTicketBtn.addEventListener("click", () => {
  const ticketNumber = sessionStorage.getItem("ticketId") || textInput.value.trim();
  if (!ticketNumber) return alert("Ticket number not found");
  cancelTicket(ticketNumber);
});


async function checkTicket(ticketNumber) {
  try {
    const res = await fetch(`/api/tickets/${ticketNumber}/`);
    if (!res.ok) throw new Error("Ticket not found");
    const data = await res.json();
    console.log(data);

    container.style.display = "flex";
    sessionStorage.setItem("ticketId", data.id);

    ticketinfo.innerHTML = `
      <div class="company-name">
        <p>Step Railway</p>
        <img src="${STATIC_URL}images/stepLogo.jpg" alt="Step Logo" />
      </div>

      <div class="ticket-id-date">
        <p><span data-translate="ბილეთის ნომერი:">Ticket №:</span> ${data.id}</p>
        <p><span data-translate="გაცემის თარიღი:">Date of issue:</span> ${data.date}</p>
      </div>

      <div class="train-info">
      <div>
          <p data-translate="გასვლა">Source:</p>
          <p>${data.train.source}</p>
        </div>
         <div>
          <p data-translate="გასვლა">Destination:</p>
          <p>${data.train.destination}</p>
        </div>
        <div>
          <p data-translate="გასვლა">Departure:</p>
          <p>${data.train.departure}</p>
        </div>
        <div>
          <p data-translate="ჩასვლა">Arrival:</p>
          <p>${data.train.arrival}</p>
        </div>
      </div>

      <div class="passengers-div">
        <p data-translate="მგზავრები">Passengers:</p>
        <div class='passengers-info'>
          ${data.persons.map(passenger => `
            <div class="pass-container">
              <div><p data-translate="სახელი:">Name:</p><p>${passenger.name}</p></div>
              <div><p data-translate="გვარი:">Surname:</p><p>${passenger.surname}</p></div>
              <div><p data-translate="პირადი ნომერი:">ID:</p><p>${passenger.idNumber}</p></div>
              <div><p data-translate="ადგილი:">Seat:</p><p>${passenger.seat.number}</p></div>
              <div><p data-translate="ვაგონის N:">Vagon №:</p><p>${passenger.seat.vagonId}</p></div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="payment-info">
        <div class='total'>
          <p data-translate="სულ გადახდილი:">Total Paid:</p>
          <p>${data.ticketPrice}₾</p>
        </div>
      </div>
    `;
  } catch (error) {
    container.style.display = "none";
    errorDiv.style.display = "flex";
    errorDiv.innerHTML = "<p data-translate='ასეთი ბილეთი არ მოიძებნა, შეამოწმეთ ბილეთის ნომერი'>Ticket not found</p>";
    console.error(error);
  }
}


myForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ticketNumber = textInput.value.trim();
  if (!ticketNumber) return alert("Please enter ticket number");
  checkTicket(ticketNumber);
});


window.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  let lastRenderedCanvas = null;

  async function renderTicketAsCanvas() {
    lastRenderedCanvas = await html2canvas(ticketEl, { scale: 2 });
    return lastRenderedCanvas;
  }

  downloadBtn.addEventListener("click", async () => {
    const canvas = await renderTicketAsCanvas();
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save("ticket.pdf");
  });

  printBtn.addEventListener("click", async () => {
    const canvas = lastRenderedCanvas || await renderTicketAsCanvas();
    const dataUrl = canvas.toDataURL();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Ticket</title>
          <style>
            body { margin:0; display:flex; justify-content:center; align-items:center; height:100vh; }
            img { max-width:100%; max-height:100%; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.onafterprint = () => window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  });
});