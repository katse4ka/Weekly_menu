/* ---------- STATE ---------- */

let products = JSON.parse(localStorage.getItem("products")) || [];
let dishes = JSON.parse(localStorage.getItem("dishes")) || [];
let week = JSON.parse(localStorage.getItem("week")) || {};

const days = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const meals = ["Завтрак","Обед","Ужин"];

/* ---------- SAVE ---------- */

function save() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("dishes", JSON.stringify(dishes));
  localStorage.setItem("week", JSON.stringify(week));
}

/* ---------- NAV ---------- */

const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
const title = document.getElementById("title");

menuBtn.onclick = () => menu.classList.toggle("hidden");

menu.querySelectorAll("button").forEach(btn => {
  btn.onclick = () => {
    showScreen(btn.dataset.screen);
    menu.classList.add("hidden");
  };
});

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(name).classList.remove("hidden");
  title.textContent =
    name === "products" ? "Продукты" :
    name === "dishes" ? "Блюда" : "Меню недели";
}

/* ---------- PRODUCTS ---------- */

const productList = document.getElementById("product-list");

function renderProducts() {
  productList.innerHTML = "";
  products.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${p.name}</span>
      <div class="status">
        ${["have","low","none"].map(s => `
          <button class="${p.status===s?"active":""}"
            onclick="setStatus(${i},'${s}')">
            ${s==="have"?"🟢":s==="low"?"🟡":"🔴"}
          </button>`).join("")}
      </div>`;
    productList.appendChild(li);
  });
}

window.setStatus = (i,s) => {
  products[i].status = s;
  save(); renderProducts();
};

document.getElementById("add-product").onclick = () => {
  const input = document.getElementById("new-product");
  if (!input.value) return;
  products.push({ name: input.value, status: "have" });
  input.value = "";
  save(); renderProducts();
};

/* ---------- DISHES ---------- */

const dishList = document.getElementById("dish-list");

function renderDishes() {
  dishList.innerHTML = "";
  dishes.forEach((d, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${d.name}</strong>
      <small>${d.ingredients.join(", ")}</small>
      <button onclick="addIngredient(${i})">＋ продукт</button>
    `;
    dishList.appendChild(li);
  });
}

window.addIngredient = (i) => {
  if (products.length === 0) {
    alert("Сначала добавь продукты");
    return;
  }

  const productNames = products.map(p => p.name).join("\n");
  const name = prompt(
    "Выбери продукт (введи ТОЧНО как в списке):\n\n" + productNames
  );

  if (!name) return;
  if (!products.find(p => p.name === name)) return;

  dishes[i].ingredients.push(name);
  save();
  renderDishes();
};

document.getElementById("add-dish").onclick = () => {
  const input = document.getElementById("new-dish");
  if (!input.value) return;
  dishes.push({ name: input.value, ingredients: [] });
  input.value = "";
  save(); renderDishes();
};

/* ---------- WEEK MENU ---------- */

const table = document.getElementById("week-table");

function renderWeek() {
  table.innerHTML = `
    <tr>
      <th></th>
      ${days.map(d => `<th>${d}</th>`).join("")}
    </tr>
    ${meals.map(m => `
      <tr>
        <th>${m}</th>
        ${days.map(d => `
          <td class="cell" onclick="addToCell('${d}','${m}')">
            ${(week[d]?.[m]||[]).map(x=>`<span>${x}</span>`).join("")}
          </td>`).join("")}
      </tr>`).join("")}
  `;
}

window.addToCell = (day, meal) => {
  if (dishes.length === 0) {
    alert("Сначала добавь блюда");
    return;
  }

  const dishNames = dishes.map(d => d.name).join("\n");
  const name = prompt(
    "Выбери блюдо (введи ТОЧНО как в списке):\n\n" + dishNames
  );

  if (!name) return;
  if (!dishes.find(d => d.name === name)) return;

  week[day] ??= {};
  week[day][meal] ??= [];
  week[day][meal].push(name);

  save();
  renderWeek();
};

/* ---------- INIT ---------- */

renderProducts();
renderDishes();
renderWeek();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

