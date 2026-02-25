const myForm = document.querySelector(".my-form");
const textInput = document.getElementById("textInput");
const container = document.querySelector(".container");
const ticketinfo = document.querySelector(".ticket-info");
const deleteTicketBtn = document.querySelector(".delete-ticket");
const errorDiv = document.querySelector(".error");

const printBtn = document.querySelector(".print");
const downloadBtn = document.querySelector(".download");
const ticketEl = document.querySelector(".ticket-info");

async function cancelTicket(ticketId) {
  try {
    const res = await fetch(`/api/tickets/${ticketId}/cancel/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Can't delete");
    container.style.display = "none";
    errorDiv.style.display = "flex";
    errorDiv.innerHTML = "<p data-translate='ბილეთი წარმატებით წაიშალა!'>Билет успешно удалён!</p>";
    console.log("Ticket deleted successfully");
  } catch (error) {
    errorDiv.style.display = "flex";
    errorDiv.innerHTML = `<p>Can't delete</p>`;
    console.error(error);
  }
}

deleteTicketBtn.addEventListener("click", () => {
  const ticketId = sessionStorage.getItem("ticketId");
  if (!ticketId) return alert("Ticket ID not found");
  cancelTicket(ticketId);
});

async function checkTicket(ticketId) {
  try {
    const res = await fetch(`/api/tickets/${ticketId}/checkstatus/`);
    if (!res.ok) throw new Error("Not Found");
    const data = await res.json();

    container.style.display = "flex";
    sessionStorage.setItem("ticketId", data.id);

    
    ticketinfo.innerHTML = `
      <div class="company-name">
        <p>Step Railway</p>
        <img src="Images/stepLogo.jpg" alt="Step Logo" />
      </div>
      
      <div class="ticket-id-date">
        <p><span data-translate="ბილეთის ნომერი:">Ticker №:</span> ${data.id}</p>
        <p><span data-translate="გაცემის თარიღი:">Date of issue:</span> ${data.date}</p>
      </div>
      
      <div class="train-info">
        <div>
          <p data-translate="გასვლა">Departure:</p>
          <p>${data.train.departure}</p>
        </div>
        <div>
          <p data-translate="ჩასვლა">Ariving date:</p>
          <p>${data.train.arrival}</p>
        </div>
        <div>
          <p data-translate="გასვლის თარიღი:">Departure date:</p>
          <p>${data.date}</p>
        </div>
      </div>
      
      <div class="contact-info">
        <p data-translate="საკონტაქტო ინფორმაცია">Контакты:</p>
        <div>
          <p><span data-translate="იმეილი:">Email:</span> ${data.email}</p>
          <p><span data-translate="ნომერი">Телефон:</span> ${data.phone}</p>
        </div>
      </div>

      <div class="passengers-div">
        <p data-translate="მგზავრები">Пассажиры:</p>
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
          <p data-translate="სულ გადახდილი:">Итого:</p>
          <p>${data.ticketPrice}₾</p>
        </div>
      </div>

      <div class="invoice-copyright">
        <p data-translate="ინვოისი იქმნება კომპიუტერის მიერ და ვალიდურია ბეჭედის და ხელმოწერის გარეშე">
          
        </p>
        <p data-translate="გადმოწერეთ ბილეთი ან შეინახეთ ბილეთის ნომერი ადგილზე წარსადგენად.">
          
        </p>
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
  const ticketId = textInput.value.trim();
  if (!ticketId) return alert("Input ticket number");
  checkTicket(ticketId);
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
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

    pdf.addImage(imgData, "PNG", (pageWidth - imgWidth * ratio)/2, (pageHeight - imgHeight * ratio)/2, imgWidth * ratio, imgHeight * ratio);
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
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; }
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