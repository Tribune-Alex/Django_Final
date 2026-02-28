document.addEventListener("DOMContentLoaded", () => {
  const fromInput = document.querySelector(".from");
  const toInput = document.querySelector(".to");
  const fromUl = document.querySelector(".from-ul");
  const toUl = document.querySelector(".to-ul");
  const form = document.getElementById("myForm");

  flatpickr("#dateInput", { dateFormat: "Y-m-d" });

  fetch("/api/city/")
    .then(res => {
      if (!res.ok) {
        throw new Error("Error in LAN");
      }
      return res.json();
    })
    .then(cities => {
      cities.forEach(city => {
        const liFrom = document.createElement("li");
        liFrom.textContent = city.name;
        liFrom.dataset.value = city.id;
        fromUl.appendChild(liFrom);

        const liTo = document.createElement("li");
        liTo.textContent = city.name;
        liTo.dataset.value = city.id;
        toUl.appendChild(liTo);
      });

      setupSelect(fromInput, fromUl, "fromInputValue");
      setupSelect(toInput, toUl, "toInputValue");
    })
    .catch(err => console.error("Cities not found", err));

  function setupSelect(input, ul, storageKey) {
    input.addEventListener("click", () => {
      ul.classList.toggle("show");
    });

    ul.addEventListener("click", e => {
      if (e.target.tagName === "LI") {
        input.value = e.target.textContent;
        sessionStorage.setItem(storageKey, e.target.dataset.value);
        ul.classList.remove("show");
      }
    });

    document.addEventListener("click", e => {
      if (!ul.contains(e.target) && e.target !== input) {
        ul.classList.remove("show");
      }
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const date = document.querySelector("#dateInput").value;

    if (
      !sessionStorage.getItem("fromInputValue") ||
      !sessionStorage.getItem("toInputValue") ||
      !date
    ) {
      alert("შეავსეთ ყველა ველი");
      return;
    }

    sessionStorage.setItem("selectedDate", date);
    window.location.href = "/wanted-trains/";
  });
});