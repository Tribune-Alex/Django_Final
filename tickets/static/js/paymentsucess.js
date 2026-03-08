const ticketinfo = document.querySelector(".ticket-info");
const printBtn = document.querySelector(".print");
const downloadBtn = document.querySelector(".download");
const ticketEl = document.querySelector(".ticket-info");
const { jsPDF } = window.jspdf;

function maskCardNumberWithSpaces(number) {
  const digitsOnly = number.replace(/\D/g, "");
  if (digitsOnly.length < 4) return number;
  const firstTwo = digitsOnly.slice(0, 2);
  const lastTwo = digitsOnly.slice(-2);
  const masked = firstTwo + "*".repeat(digitsOnly.length - 4) + lastTwo;
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

async function renderTicketCanvas() {
  return html2canvas(ticketEl, { scale: 2 });
}

async function fetchAndRenderTicket() {
  const ticketNumber = sessionStorage.getItem("ticketId");
  if (!ticketNumber) {
    ticketinfo.innerHTML = `<p>Ticket not found</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/tickets/${ticketNumber}/`);
    if (!res.ok) throw new Error("Ticket not found");

    const data = await res.json();

    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;

    ticketinfo.innerHTML = `
      <div class="company-name">
        <p>Step Railway</p>
        <img src="${STATIC_URL}images/stepLogo.jpg" alt="Step Logo" />
      </div>

      <div class="ticket-id-date">
        <p>Ticket №: ${data.id}</p>
        <p>Date of issue: ${formattedDate}</p>
      </div>

      <div class="train-info">
        <div><p>Source:</p><p>${data.train.source}</p></div>
        <div><p>Destination:</p><p>${data.train.destination}</p></div>
        <div><p>Departure:</p><p>${data.train.departure}</p></div>
        <div><p>Arrival:</p><p>${data.train.arrival}</p></div>
      </div>

      <div class="passengers-div">
        <p>Passengers:</p>
        <div class="passengers-info">
          ${data.persons.map(p => `
            <div class="pass-container">
              <div><p>Name:</p><p>${p.name}</p></div>
              <div><p>Surname:</p><p>${p.surname}</p></div>
              <div><p>ID:</p><p>${p.idNumber}</p></div>
              <div><p>Seat:</p><p>${p.seat.number}</p></div>
              <div><p>Vagon №:</p><p>${p.seat.vagonId}</p></div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="payment-info">
        <div class="total">
          <p>Total Paid:</p>
          <p>${data.ticketPrice}₾</p>
        </div>
      </div>

      <div class="invoice-copyright">
        <p>Invoice is generated automatically and valid without stamp/signature</p>
        <p>Download or save the ticket number for verification on site.</p>
      </div>
    `;
  } catch (error) {
    ticketinfo.innerHTML = `<p>Ticket not found</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderTicket();

  let lastCanvas = null;

  downloadBtn?.addEventListener("click", async () => {
    lastCanvas = await renderTicketCanvas();
    const imgData = lastCanvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / lastCanvas.width, pageHeight / lastCanvas.height);
    pdf.addImage(imgData, "PNG", (pageWidth - lastCanvas.width * ratio) / 2, (pageHeight - lastCanvas.height * ratio) / 2, lastCanvas.width * ratio, lastCanvas.height * ratio);
    pdf.save("ticket.pdf");
  });

  printBtn?.addEventListener("click", async () => {
    if (!lastCanvas) lastCanvas = await renderTicketCanvas();
    const dataUrl = lastCanvas.toDataURL();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>Print Ticket</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100%;}</style>
      </head><body><img src="${dataUrl}" onload="window.print();window.onafterprint=()=>window.close();" /></body></html>
    `);
    printWindow.document.close();
  });
});