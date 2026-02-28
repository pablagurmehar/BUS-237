const STORAGE_KEY = "abc_inventory_items";

const form = document.getElementById("item-form");
const nameInput = document.getElementById("item-name");
const qtyInput = document.getElementById("item-qty");
const message = document.getElementById("message");
const listEl = document.getElementById("inventory-list");
const clearBtn = document.getElementById("clear-all");
const toggleChartBtn = document.getElementById("toggle-chart");
const chartCanvas = document.getElementById("inventory-chart");

let items = loadItems();
let chartType = "bar";
let chartInstance = null;

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function showMessage(text = "") {
  message.textContent = text;
}

function validateInput(name, qtyRaw) {
  const cleanedName = name.trim();
  if (!cleanedName) return "Item name is required.";

  if (!/^\d+$/.test(qtyRaw)) return "Quantity must be a whole non-negative number.";

  const qty = Number(qtyRaw);
  if (qty < 0) return "Quantity cannot be negative.";

  const duplicate = items.some((item) => item.name.toLowerCase() === cleanedName.toLowerCase());
  if (duplicate) return "Item already exists. Please use a unique item name.";

  return "";
}

function renderList() {
  listEl.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No items in inventory yet.";
    listEl.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.name}</span><strong>${item.quantity}</strong>`;
    listEl.appendChild(li);
  });
}

function chartColors() {
  return items.map(() => "rgba(42, 157, 143, 0.8)");
}

function renderChart() {
  if (!chartCanvas) return;

  const labels = items.map((item) => item.name);
  const data = items.map((item) => item.quantity);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas, {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label: "Quantity",
          data,
          backgroundColor: chartType === "pie" ? data.map((_, i) => `hsl(${(i * 57) % 360}, 65%, 55%)`) : chartColors(),
          borderColor: "rgba(31, 78, 121, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: chartType === "bar" ? {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      } : {}
    }
  });
}

function refreshUI() {
  renderList();
  renderChart();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value;
  const qtyRaw = qtyInput.value.trim();

  const error = validateInput(name, qtyRaw);
  if (error) {
    showMessage(error);
    return;
  }

  items.push({ name: name.trim(), quantity: Number(qtyRaw) });
  saveItems();
  refreshUI();
  showMessage("Item added successfully.");
  form.reset();
  nameInput.focus();
});

clearBtn.addEventListener("click", () => {
  items = [];
  saveItems();
  refreshUI();
  showMessage("All items cleared.");
});

toggleChartBtn.addEventListener("click", () => {
  chartType = chartType === "bar" ? "pie" : "bar";
  toggleChartBtn.textContent = chartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart";
  renderChart();
});

refreshUI();
