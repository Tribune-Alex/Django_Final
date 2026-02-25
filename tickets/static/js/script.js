const fromInput = document.querySelector(".from"),
      fromList = document.querySelector(".from-ul"),
      fromListOption = document.querySelectorAll(".from-ul li"),
      toInput = document.querySelector(".to"),
      toList = document.querySelector(".to-ul"),
      toListOption = document.querySelectorAll(".to-ul li"),
      dateInput = document.querySelector(".date"),
      passengerCount = document.querySelector(".count"),
      searchTrainBtn = document.querySelector(".search-train"),
      myForm = document.getElementById("myForm");


fromInput.setAttribute("readonly", true);
toInput.setAttribute("readonly", true);


document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#dateInput", {
    dateFormat: "Y-m-d", 
    minDate: "today",
    allowInput: false,
    onChange: function(selectedDates, dateStr, instance) {
      
      console.log("Выбрана дата:", dateStr);
      document.getElementById("dateInput").value = dateStr;
    }
  });
});


fromInput.addEventListener("click", () => {
  fromInput.classList.add("active");
  document.querySelector(".input-from").classList.add("active");
});
window.addEventListener("click", function (event) {
  if (event.target !== fromInput) {
    fromInput.classList.remove("active");
    document.querySelector(".input-from").classList.remove("active");
  }
});
fromListOption.forEach((option) => {
  option.addEventListener("click", function () {
    fromInput.value = this.textContent;
    fromInput.setAttribute(
      "data-value",
      this.getAttribute("data-value") || this.textContent
    );
    fromInput.classList.remove("active");
  });
});


toInput.addEventListener("click", () => {
  toInput.classList.add("active");
  document.querySelector(".input-to").classList.add("active");
});
window.addEventListener("click", function (event) {
  if (event.target !== toInput) {
    toInput.classList.remove("active");
    document.querySelector(".input-to").classList.remove("active");
  }
});
toListOption.forEach((option) => {
  option.addEventListener("click", function () {
    toInput.value = this.textContent;
    toInput.setAttribute(
      "data-value",
      this.getAttribute("data-value") || this.textContent
    );
    toInput.classList.remove("active");
  });
});


myForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const from = fromInput.getAttribute("data-value");
    const to = toInput.getAttribute("data-value");

    
    const selectedDate = dateInput._flatpickr
        ? dateInput._flatpickr.selectedDates[0]?.toISOString().slice(0,10)
        : dateInput.value;

    const passenger = passengerCount.value;

    if (!from || !to || !selectedDate || !passenger || from === to) {
        alert("ყველა ველი სწორად შეავსეთ!");
        return;
    }

    sessionStorage.setItem("fromInputValue", from);
    sessionStorage.setItem("toInputValue", to);
    sessionStorage.setItem("selectedDate", selectedDate);
    sessionStorage.setItem("passengerCount", passenger);

    window.location.href = "/wanted-trains/";
});