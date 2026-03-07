const myForm = document.querySelector(".payment-info");
function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return "";
}
const cardOwner = document.getElementById("cardOwner");
const cardNum = document.getElementById("cardNum");
const cardCvv = document.getElementById("cardCvv");
const cardDate = document.getElementById("cardDate");

const tickets = JSON.parse(sessionStorage.getItem("tickets"));
const selectedDate = sessionStorage.getItem("date");

console.log("tickets:", tickets);
console.log("date:", selectedDate);


cardNum.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.match(/.{1,4}/g)?.join(" ") || "";
  e.target.value = value;
});


cardDate.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2, 6);
  e.target.value = value;
});


myForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;

  const cardNumber = cardNum.value.trim().replace(/\s+/g, "");
  const cardCVV = cardCvv.value.trim();
  const cardOwnerName = cardOwner.value.trim();
  const cardDateValue = cardDate.value.trim();

  if (
    cardNumber.length !== 16 ||
    isNaN(cardNumber) ||
    cardCVV.length !== 3 ||
    isNaN(cardCVV) ||
    cardOwnerName === "" ||
    !dateRegex.test(cardDateValue)
  ) {
    alert("ყველა ველი აუცილებლად სწორად უნდა შეივსოს!");
    return;
  }

  if (!tickets || !selectedDate) {
    alert("Ticket information missing!");
    return;
  }

  console.log("Tickets data to send:", tickets);

  try {
    const resp = await fetch("/api/tickets/", {
       method: "POST",
       headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify({
      tickets: tickets
     })
   });

    const data = await resp.json();
    console.log("Full server response:", JSON.stringify(data, null, 2));

if (!resp.ok) {
  throw new Error(data.error || "Ticket creation error");
}

console.log("Tickets created:", data);


const ticket = data[0]; 
if (ticket) {
  
  const passengersList = (ticket.persons || ticket.people || ticket.passengers || tickets).map(p => ({
    name: p.first_name || p.name,
    surname: p.last_name || p.surname,
    idNumber: p.personal_id || p.idNumber,
    seat: { number: p.seat, vagonId: p.vagon || 1 } 
  }));

  
  const trainInfo = ticket.train || ticket.trainInfo || { departure: "—", arrival: "—" };

  sessionStorage.setItem("ticket", JSON.stringify({
    id: ticket.id || ticket.ticket_number || Date.now(),
    people: passengersList,
    price: ticket.ticketPrice || tickets[0].price
  }));

  sessionStorage.setItem("theTrain", JSON.stringify(trainInfo));
  sessionStorage.setItem("total", ticket.ticketPrice || tickets.reduce((sum, t) => sum + parseFloat(t.price), 0));
}


sessionStorage.removeItem("tickets");
sessionStorage.removeItem("date");

window.location.href = "/payment_success/";

  } catch (err) {
    console.error(err);
    alert("Payment succeeded but ticket creation failed!");
  }
});


const total = document.getElementById("mustPay");
const totalFromInvoice = sessionStorage.getItem("total") || "0";
total.innerHTML = `${totalFromInvoice}.00₾`;