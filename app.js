/* ===============================
   DATA VERSION
================================ */
const DATA_VERSION = "2.0.0";

if (localStorage.getItem("data_version") !== DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem("data_version", DATA_VERSION);
}

/* ===============================
   STATE
================================ */
let products = JSON.parse(localStorage.getItem("products")) || [];
let dishes = JSON.parse(localStorage.getItem("dishes")) || [];
let week = JSON.parse(localStorage.getItem("week")) || {};

const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const meals = ["Завтрак", "Обед", "Ужин"];

let currentDishIndex = null;
let currentDay = null;
let currentMeal = null;

/* ===============================
   SAVE
================================ */
function save() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("dishes", JSON.stringify(dishes));
  localStorage.setItem("week", JSON.stringify(week));
}

/* ===============================
   NAVIGATION
================================ */
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
const title = document.getElementById("title");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});

menu.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    showScreen(btn.dataset.screen);
    menu.classList.add("hidden");
  });
});

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(name).classList.remove("hidden");

  title.textContent =
    name === "products" ? "Продукты" :
    name === "dishes" ? "Блюда" :
    "Меню недели";
}

/* ===============================
   PRODUCTS
================================ */
const productList = document.getElementById("product-list");
const addProductBtn = document.getElementById("add-product");
const newProductInput = document.getElementById("new-product");

addProductBtn.addEventListener("click", () => {
  if (!newProductInput.value.trim()) return;

  products.push({
    name: newProductInput.value.trim(),
    status: "have"
  });

  newProductInput.value = "";
  save();
  renderProducts();
});

function renderProducts() {
  productList.innerHTML = "";

  products.forEach((p, i) => {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = p.name;

    const statusWrap = document.createElement("div");
    statusWrap.className = "status";

    ["have", "low", "none"].forEach(s => {
      const btn = document.createElement("button");
      btn.textContent = s === "have" ? "🟢" : s === "low" ? "🟡" : "🔴";
      if (p.status === s) btn.classList.add("active");

      btn.addEventListener("click", () => {
        p.status = s;
        save();
        renderProducts();
      });

      statusWrap.appendChild(btn);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => {
      const n = prompt("Новое имя продукта", p.name);
      if (!n) return;
      p.name = n;
      save();
      renderProducts();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", () => {
      if (!confirm("Удалить продукт?")) return;
      products.splice(i, 1);
      save();
      renderProducts();
    });

    li.append(name, statusWrap, editBtn, delBtn);
    productList.appendChild(li);
  });
}

/* ===============================
   DISHES
================================ */
const dishList = document.getElementById("dish-list");
const addDishBtn = document.getElementById("add-dish");
const newDishInput = document.getElementById("new-dish");

addDishBtn.addEventListener("click", () => {
  if (!newDishInput.value.trim()) return;

  dishes.push({
    name: newDishInput.value.trim(),
    ingredients: []
  });

  newDishInput.value = "";
  save();
  renderDishes();
});

function renderDishes() {
  dishList.innerHTML = "";

  dishes.forEach((d, i) => {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = d.name;

    const info = document.createElement("small");
    info.textContent = d.ingredients.join(", ");

    const addBtn = document.createElement("button");
    addBtn.textContent = "＋ продукт";
    addBtn.addEventListener("click", () => openProductModal(i));

    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => {
      const n = prompt("Новое имя блюда", d.name);
      if (!n) return;
      d.name = n;
      save();
      renderDishes();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", () => {
      if (!confirm("Удалить блюдо?")) return;
      dishes.splice(i, 1);
      save();
      renderDishes();
    });

    li.append(title, info, addBtn, editBtn, delBtn);
    dishList.appendChild(li);
  });
}

/* ===============================
   PRODUCT MODAL
================================ */
const productModal = document.getElementById("modal-product");
const productSearch = document.getElementById("modal-product-search");
const productSelect = document.getElementById("modal-product-select");
const productAddBtn = document.getElementById("modal-product-add");

function openProductModal(dishIndex) {
  if (products.length === 0) {
    alert("Сначала добавь продукты");
    return;
  }
  currentDishIndex = dishIndex;
  productSearch.value = "";
  updateProductSelect();
  openModal(productModal);
}

function updateProductSelect() {
  const f = productSearch.value.toLowerCase();
  productSelect.innerHTML = "";

  products
    .filter(p => p.name.toLowerCase().includes(f))
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      productSelect.appendChild(opt);
    });
}

productSearch.addEventListener("input", updateProductSelect);

productAddBtn.addEventListener("click", () => {
  const val = productSelect.value;
  if (!val) return;

  dishes[currentDishIndex].ingredients.push(val);
  save();
  renderDishes();
  closeModal(productModal);
});

/* ===============================
   WEEK MENU
================================ */
const weekTable = document.getElementById("week-table");

function renderWeek() {
  weekTable.innerHTML = `
    <tr>
      <th></th>
      ${days.map(d => `<th>${d}</th>`).join("")}
    </tr>
    ${meals.map(m => `
      <tr>
        <th>${m}</th>
        ${days.map(d => `<td class="cell" data-day="${d}" data-meal="${m}"></td>`).join("")}
      </tr>
    `).join("")}
  `;

  weekTable.querySelectorAll("td.cell").forEach(cell => {
    const day = cell.dataset.day;
    const meal = cell.dataset.meal;

    cell.addEventListener("click", () => openDishModal(day, meal));

    const list = week[day]?.[meal] || [];
    list.forEach((dish, i) => {
      const span = document.createElement("span");
      span.textContent = dish;

      const btn = document.createElement("button");
      btn.textContent = "✖";
      btn.addEventListener("click", e => {
        e.stopPropagation();
        list.splice(i, 1);
        save();
        renderWeek();
      });

      span.appendChild(btn);
      cell.appendChild(span);
    });
  });
}

/* ===============================
   DISH MODAL
================================ */
const dishModal = document.getElementById("modal-dish");
const dishSearch = document.getElementById("modal-dish-search");
const dishSelect = document.getElementById("modal-dish-select");
const dishAddBtn = document.getElementById("modal-dish-add");

function openDishModal(day, meal) {
  if (dishes.length === 0) {
    alert("Сначала добавь блюда");
    return;
  }
  currentDay = day;
  currentMeal = meal;
  dishSearch.value = "";
  updateDishSelect();
  openModal(dishModal);
}

function updateDishSelect() {
  const f = dishSearch.value.toLowerCase();
  dishSelect.innerHTML = "";

  dishes
    .filter(d => d.name.toLowerCase().includes(f))
    .forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.name;
      opt.textContent = d.name;
      dishSelect.appendChild(opt);
    });
}

dishSearch.addEventListener("input", updateDishSelect);

dishAddBtn.addEventListener("click", () => {
  const val = dishSelect.value;
  if (!val) return;

  week[currentDay] ??= {};
  week[currentDay][currentMeal] ??= [];
  week[currentDay][currentMeal].push(val);

  save();
  renderWeek();
  closeModal(dishModal);
});

/* ===============================
   MODAL HELPERS
================================ */
function openModal(el) {
  el.classList.remove("hidden");
}

function closeModal(el) {
  el.classList.add("hidden");
}

/* ===============================
   INIT
================================ */
renderProducts();
renderDishes();
renderWeek();