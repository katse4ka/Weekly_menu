function showAddProductModal(dishIndex) {
  alert("showAddProductModal вызвана, index = " + dishIndex);

/* ---------- DATA VERSION ---------- */
const DATA_VERSION = '1.0.6';

// Сбрасываем старые данные при обновлении версии
if (localStorage.getItem('data_version') !== DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem('data_version', DATA_VERSION);
}

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
      </div>
      <button onclick="editProduct(${i})">✎</button>
      <button onclick="deleteProduct(${i})">🗑</button>
    `;
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
      <button onclick="showAddProductModal(${i})">＋ продукт</button>
      <button onclick="editDish(${i})">✎</button>
      <button onclick="deleteDish(${i})">🗑</button>
    `;
    dishList.appendChild(li);
  });
}

document.getElementById("add-dish").onclick = () => {
  const input = document.getElementById("new-dish");
  if (!input.value) return;

  dishes.push({
    name: input.value,
    ingredients: []
  });

  input.value = "";
  save();
  renderDishes();
};

/* ---------- MODAL PRODUCT ---------- */
let currentDishIndex = null;

function showAddProductModal(dishIndex) {
  if (products.length === 0) {
    alert("Сначала добавь продукты");
    return;
  }
  currentDishIndex = dishIndex;
  document.getElementById("modal-product-search").value = "";
  updateProductModalSelect();
  openModal("modal-product"); // ❌ вызывается только по клику
}

function updateProductModalSelect() {
  const filter = document.getElementById("modal-product-search").value.toLowerCase();
  const select = document.getElementById("modal-product-select");
  select.innerHTML = products
    .filter(p => p.name.toLowerCase().includes(filter))
    .map(p => `<option value="${p.name}">${p.name}</option>`)
    .join("");
}

document.getElementById("modal-product-search").oninput = updateProductModalSelect;

document.getElementById("modal-product-add").onclick = () => {
  const select = document.getElementById("modal-product-select");
  const name = select.value;
  if (name && currentDishIndex != null) {
    dishes[currentDishIndex].ingredients.push(name);
    save(); renderDishes(); closeModal("modal-product");
  }
};

/* ---------- MODAL DISH ---------- */
let currentDay = null;
let currentMeal = null;

function showAddDishModal(day, meal) {
  if (dishes.length === 0) {
    alert("Сначала добавь блюда");
    return;
  }
  currentDay = day;
  currentMeal = meal;
  document.getElementById("modal-dish-search").value = "";
  updateDishModalSelect();
  openModal("modal-dish"); // ✅ вызывается только по клику
}

function updateDishModalSelect() {
  const filter = document.getElementById("modal-dish-search").value.toLowerCase();
  const select = document.getElementById("modal-dish-select");
  select.innerHTML = dishes
    .filter(d => d.name.toLowerCase().includes(filter))
    .map(d => `<option value="${d.name}">${d.name}</option>`)
    .join("");
}

document.getElementById("modal-dish-search").oninput = updateDishModalSelect;

document.getElementById("modal-dish-add").onclick = () => {
  const select = document.getElementById("modal-dish-select");
  const name = select.value;
  if (!week[currentDay]) week[currentDay] = {};
  if (!week[currentDay][currentMeal]) week[currentDay][currentMeal] = [];
  week[currentDay][currentMeal].push(name);
  save(); renderWeek(); closeModal("modal-dish");
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
        ${days.map(d => `<td class="cell" data-day="${d}" data-meal="${m}"></td>`).join("")}
      </tr>`).join("")}
  `;

  document.querySelectorAll("#week-table td.cell").forEach(td => {
    const day = td.dataset.day;
    const meal = td.dataset.meal;

    td.onclick = () => showAddDishModal(day, meal); // ✅ по клику, не при старте

    td.innerHTML = "";
    const cellDishes = (week[day]?.[meal] || []);
    cellDishes.forEach((dish, i) => {
      const span = document.createElement("span");
      span.textContent = dish + " ";

      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.addEventListener("click", e => {
        e.stopPropagation();
        deleteDishFromCell(day, meal, i);
      });

      span.appendChild(btn);
      td.appendChild(span);
    });
  });
}

/* ---------- EDIT / DELETE ---------- */
function deleteProduct(i) { if(!confirm("Удалить продукт?")) return; products.splice(i,1); save(); renderProducts();}
function editProduct(i){ const newName = prompt("Новое имя продукта", products[i].name); if(!newName)return; products[i].name=newName; save(); renderProducts();}
function deleteDish(i){ if(!confirm("Удалить блюдо?")) return; dishes.splice(i,1); save(); renderDishes();}
function editDish(i){ const newName = prompt("Новое имя блюда", dishes[i].name); if(!newName)return; dishes[i].name=newName; save(); renderDishes();}
function deleteDishFromCell(day, meal, index){ week[day][meal].splice(index,1); save(); renderWeek();}

/* ---------- MODAL HELPERS ---------- */
function openModal(modalId){ document.getElementById(modalId).classList.remove("hidden");}
function closeModal(modalId){ document.getElementById(modalId).classList.add("hidden");}

/* ---------- INIT ---------- */
renderProducts();
renderDishes();
renderWeek();

/* ---------- SERVICE WORKER ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('[SW] Registered', reg))
    .catch(err => console.warn('[SW] Registration failed', err));
}