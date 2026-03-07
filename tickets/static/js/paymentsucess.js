
const ticket = JSON.parse(sessionStorage.getItem("ticket")) || {};
const ticketId = ticket.id || "";
const passengersInfo = ticket.people || [];
const theTrain = JSON.parse(sessionStorage.getItem("theTrain")) || {};
const total = sessionStorage.getItem("total") || "0";
const cardOwner = sessionStorage.getItem("cardOwner") || "";
const cardNumber = sessionStorage.getItem("cardNum") || "";
const passEmail = sessionStorage.getItem("passEmail") || "";
const passPhoneNum = sessionStorage.getItem("passPhoneNum") || "";
const today = new Date();
const formattedDate = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
const georgianDayNumber = sessionStorage.getItem("georgianDayNumber") || "";
const georgianMonthName = sessionStorage.getItem("georgianMonthName") || "";
const georgianWeekDay = sessionStorage.getItem("georgianWeekDay") || "";


function maskCardNumberWithSpaces(number) {
  const digitsOnly = number.replace(/\D/g, "");
  if (digitsOnly.length < 4) return number;
  const firstTwo = digitsOnly.slice(0, 2);
  const lastTwo = digitsOnly.slice(-2);
  const masked = firstTwo + "*".repeat(digitsOnly.length - 4) + lastTwo;
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const ticketinfo = document.querySelector(".ticket-info");
  if (!ticketId || Object.keys(theTrain).length === 0) {
    ticketinfo.innerHTML = `<p>Ticket not found</p>`;
    return;
  }

  
  ticketinfo.innerHTML = `
    <div class="company-name">
      <p>Step Railway</p>
      <img src="Images/stepLogo.jpg" alt="Step Logo" />
    </div>

    <div class="ticket-id-date">
      <p>Ticket №: ${ticketId}</p>
      <p>Date of issue: ${formattedDate}</p>
    </div>

    <div class="train-info">
      <div><p>Departure:</p><p>${theTrain.departure || ""}</p></div>
      <div><p>Arrival:</p><p>${theTrain.arrive || ""}</p></div>
      <div><p>Departure date:</p><p>${georgianWeekDay} ${georgianDayNumber} ${georgianMonthName}</p></div>
    </div>

    <div class="contact-info">
      <p>Contacts:</p>
      <div>
        <p>Email: ${passEmail}</p>
        <p>Phone: ${passPhoneNum}</p>
      </div>
    </div>

    <div class="passengers-div">
      <p>Passengers:</p>
      <div class="passengers-info"></div>
    </div>

    <div class="payment-info">
      <div class="card-info">
        <div><p>Card Owner:</p><p>${cardOwner}</p></div>
        <div><p>Card Number:</p><p>${maskCardNumberWithSpaces(cardNumber)}</p></div>
      </div>
      <div class="total">
        <p>Total Paid:</p>
        <p>${total}₾</p>
      </div>
    </div>

    <div class="invoice-copyright">
      <p>Invoice is generated automatically and valid without stamp/signature</p>
      <p>Download or save the ticket number for verification on site.</p>
    </div>
  `;

  
  const passengersDiv = document.querySelector(".passengers-info");
  passengersDiv.innerHTML = "";
  passengersInfo.forEach(p => {
    const seat = p.seat || {};
    passengersDiv.innerHTML += `
      <div class="pass-container">
        <div><p>Name:</p><p>${p.name || ""}</p></div>
        <div><p>Surname:</p><p>${p.surname || ""}</p></div>
        <div><p>ID:</p><p>${p.idNumber || ""}</p></div>
        <div><p>Seat:</p><p>${seat.number || ""}</p></div>
        <div><p>Vagon №:</p><p>${seat.vagonId || ""}</p></div>
      </div>
    `;
  });

  
  const printBtn = document.querySelector(".print");
  const downloadBtn = document.querySelector(".download");
  const ticketEl = document.querySelector(".ticket-info");
  const { jsPDF } = window.jspdf;
  let lastCanvas = null;

  function renderTicketCanvas() {
    return html2canvas(ticketEl, { scale: 2 }).then(canvas => {
      lastCanvas = canvas;
      return canvas;
    });
  }

  downloadBtn.addEventListener("click", () => {
    renderTicketCanvas().then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      pdf.addImage(imgData, "PNG", (pageWidth - canvas.width * ratio) / 2, (pageHeight - canvas.height * ratio) / 2, canvas.width * ratio, canvas.height * ratio);
      pdf.save("ticket.pdf");
    });
  });

  printBtn.addEventListener("click", () => {
    const printCanvas = () => {
      const dataUrl = lastCanvas.toDataURL();
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html><head><title>Print Ticket</title>
        <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100%;}</style>
        </head><body><img src="${dataUrl}" onload="window.print();window.onafterprint=()=>window.close();" /></body></html>
      `);
      printWindow.document.close();
    };

    if (lastCanvas) printCanvas();
    else renderTicketCanvas().then(printCanvas);
  });
});