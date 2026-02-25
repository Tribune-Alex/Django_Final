const chosenSeatIDs = JSON.parse(sessionStorage.getItem("chosenSeatIDs")) || [];
const ticketId = sessionStorage.getItem("ticketId") || "";
const cardOwner = sessionStorage.getItem("cardOwner") || "";
const cardNumber = sessionStorage.getItem("cardNum") || "";
const passengersCount = sessionStorage.getItem("passengerCount") || 0;
const theTrain = JSON.parse(sessionStorage.getItem("theTrain")) || {};
const passEmail = sessionStorage.getItem("passEmail") || "";
const passPhoneNum = sessionStorage.getItem("passPhoneNum") || "";
const ticket = JSON.parse(sessionStorage.getItem("ticket")) || {};
const passengersInfo = ticket.people || [];
const ticketinfo = document.querySelector(".ticket-info");
const total = sessionStorage.getItem("total") || "0";
const today = new Date();
const formattedDate = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`;
const georgianDayNumber = sessionStorage.getItem("georgianDayNumber") || "";
const georgianMonthName = sessionStorage.getItem("georgianMonthName") || "";
const georgianWeekDay = sessionStorage.getItem("georgianWeekDay") || "";


function maskCardNumberWithSpaces(cardNumber) {
  const digitsOnly = cardNumber.replace(/\s+/g, "");
  if (digitsOnly.length < 4) return cardNumber;
  const firstTwo = digitsOnly.slice(0, 2);
  const lastTwo = digitsOnly.slice(-2);
  const masked = firstTwo + "*".repeat(digitsOnly.length - 4) + lastTwo;
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

document.addEventListener("DOMContentLoaded", function () {
  if (!ticketId || !theTrain || Object.keys(theTrain).length === 0) {
    ticketinfo.innerHTML = `<p>Ticket not found</p>`;
    return;
  }

  
  ticketinfo.innerHTML = `
    <div class="company-name">
        <p>Step Railway</p>
        <img src="Images/stepLogo.jpg" alt="Step Logo" />
    </div>

    <div class="ticket-id-date">
        <p><span data-translate="ბილეთის ნომერი:">Ticket №:</span> ${ticketId}</p>
        <p><span data-translate="გაცემის თარიღი:">Date of issue:</span> ${formattedDate}</p>
    </div>

    <div class="train-info">
        <div>
            <p data-translate="გასვლა">Departure:</p>
            <p>${theTrain.departure || ""}</p>
        </div>
        <div>
            <p data-translate="ჩასვლა">Arrival:</p>
            <p>${theTrain.arrive || ""}</p>
        </div>
        <div>
            <p data-translate="გასვლის თარიღი:">Departure date:</p>
            <p><span data-translate="${georgianWeekDay}">${georgianWeekDay}</span> ${georgianDayNumber} <span data-translate="${georgianMonthName}">${georgianMonthName}</span></p>
        </div>
    </div>

    <div class="contact-info">
        <p data-translate="საკონტაქტო ინფორმაცია">Contacts:</p>
        <div>
            <p><span data-translate="იმეილი:">Email:</span> ${passEmail}</p>
            <p><span data-translate="ნომერი">Телефон:</span> ${passPhoneNum}</p>
        </div>
    </div>

    <div class="passengers-div">
      <p data-translate="მგზავრები">Пассажиры</p>
      <div class="passengers-info"></div>
    </div>

    <div class="payment-info">
      <div class="card-info">
        <div>
          <p>Владелец карты:</p>
          <p>${cardOwner}</p>
        </div>
        <div>
          <p>Номер карты:</p>
          <p>${maskCardNumberWithSpaces(cardNumber)}</p>
        </div>
      </div>
      <div class="total">
        <p data-translate="სულ გადახდილი:">Итого оплачено:</p>
        <p>${total}₾</p>
      </div>
    </div>

    <div class="invoice-copyright">
      <p data-translate="ინვოისი იქმნება კომპიუტერის მიერ და ვალიდურია ბეჭედის და ხელმოწერის გარეშე">Инвойс создается автоматически и действителен без печати и подписи</p>
      <p data-translate="გადმოწერეთ ბილეთი ან შეინახეთ ბილეთის ნომერი ადგილზე წარსადგენად.">Скачайте билет или сохраните номер для предъявления на месте.</p>
    </div>
  `;

  const passengersDiv = document.querySelector(".passengers-info");
  passengersDiv.innerHTML = "";

  passengersInfo.forEach((passenger) => {
    const seat = passenger.seat || {};
    passengersDiv.innerHTML += `
      <div class="pass-container">
        <div><p data-translate="სახელი:">Name:</p><p>${passenger.name}</p></div>
        <div><p data-translate="გვარი:">Surname:</p><p>${passenger.surname}</p></div>
        <div><p data-translate="პირადი ნომერი:">ID:</p><p>${passenger.idNumber}</p></div>
        <div><p data-translate="ადგილი:">Seat:</p><p>${seat.number || ""}</p></div>
        <div><p data-translate="ვაგონის N:">Vagon №:</p><p>${seat.vagonId || ""}</p></div>
      </div>
    `;
  });

  
  const printBtn = document.querySelector(".print");
  const downloadBtn = document.querySelector(".download");
  const ticketEl = document.querySelector(".ticket-info");
  const { jsPDF } = window.jspdf;
  let lastRenderedCanvas = null;

  function renderTicketAsCanvas() {
    return html2canvas(ticketEl, { scale: 2 }).then((canvas) => {
      lastRenderedCanvas = canvas;
      return canvas;
    });
  }

  downloadBtn.addEventListener("click", () => {
    renderTicketAsCanvas().then((canvas) => {
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
  });

  printBtn.addEventListener("click", () => {
    const renderAndPrint = () => {
      const dataUrl = lastRenderedCanvas.toDataURL();
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
    };

    if (lastRenderedCanvas) {
      renderAndPrint();
    } else {
      renderTicketAsCanvas().then(renderAndPrint);
    }
  });
});