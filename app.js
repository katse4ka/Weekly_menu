const listEl = document.getElementById("product-list");
const inputEl = document.getElementById("new-product");
const addBtn = document.getElementById("add-btn");

let products = JSON.parse(localStorage.getItem("products")) || [];

function save() {
  localStorage.setItem("products", JSON.stringify(products));
}

function render() {
  listEl.innerHTML = "";

  products.forEach((product, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${product.name}</span>
      <div class="status">
        ${["have", "low", "none"].map(status => `
          <button class="${product.status === status ? "active" : ""}"
                  onclick="setStatus(${index}, '${status}')">
            ${status === "have" ? "🟢" : status === "low" ? "🟡" : "🔴"}
          </button>
        `).join("")}
      </div>
    `;

    listEl.appendChild(li);
  });
}

window.setStatus = (index, status) => {
  products[index].status = status;
  save();
  render();
};

addBtn.onclick = () => {
  const name = inputEl.value.trim();
  if (!name) return;

  products.push({ name, status: "have" });
  inputEl.value = "";
  save();
  render();
};

render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
