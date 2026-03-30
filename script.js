const STORAGE_KEY = "vehicleInventoryApp_v1";

let state = loadState();
let selectedVehicleId = state.vehicles[0]?.id || null;

const vehiclesList = document.getElementById("vehiclesList");
const selectedVehicleTitle = document.getElementById("selectedVehicleTitle");
const selectedVehicleMeta = document.getElementById("selectedVehicleMeta");
const locationsArea = document.getElementById("locationsArea");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const addLocationBtn = document.getElementById("addLocationBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");

const nameDialog = document.getElementById("nameDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogPrompt = document.getElementById("dialogPrompt");
const nameInput = document.getElementById("nameInput");
const nameForm = document.getElementById("nameForm");

let dialogResolver = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { vehicles: [] };
    const parsed = JSON.parse(raw);
    if (!parsed.vehicles || !Array.isArray(parsed.vehicles)) return { vehicles: [] };
    return parsed;
  } catch {
    return { vehicles: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getSelectedVehicle() {
  return state.vehicles.find(v => v.id === selectedVehicleId) || null;
}

function countItems(vehicle) {
  return vehicle.locations.reduce((sum, loc) => sum + loc.items.length, 0);
}

async function promptForName(title, prompt, value = "") {
  dialogTitle.textContent = title;
  dialogPrompt.textContent = prompt;
  nameInput.value = value;
  nameDialog.showModal();
  nameInput.focus();
  nameInput.select();

  return new Promise(resolve => {
    dialogResolver = resolve;
  });
}

nameDialog.addEventListener("close", () => {
  if (!dialogResolver) return;
  const formValue = nameDialog.returnValue === "cancel" ? null : nameInput.value.trim();
  dialogResolver(formValue || null);
  dialogResolver = null;
});

nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  nameDialog.close("save");
});

addVehicleBtn.addEventListener("click", async () => {
  const name = await promptForName("Add vehicle", "Enter the name of the vehicle");
  if (!name) return;

  const vehicle = {
    id: uid(),
    name,
    locations: []
  };

  state.vehicles.push(vehicle);
  selectedVehicleId = vehicle.id;
  saveState();
  render();
});

addLocationBtn.addEventListener("click", async () => {
  const vehicle = getSelectedVehicle();
  if (!vehicle) return;

  const name = await promptForName("Add location", `Enter a location for ${vehicle.name}`);
  if (!name) return;

  vehicle.locations.push({
    id: uid(),
    name,
    items: []
  });

  saveState();
  render();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vehicle-inventory-backup.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed.vehicles || !Array.isArray(parsed.vehicles)) {
      alert("That file does not look like a valid inventory backup.");
      return;
    }

    state = parsed;
    selectedVehicleId = state.vehicles[0]?.id || null;
    saveState();
    render();
  } catch {
    alert("Could not import that file.");
  } finally {
    importInput.value = "";
  }
});

function render() {
  renderVehicles();
  renderLocations();
}

function renderVehicles() {
  vehiclesList.innerHTML = "";

  if (!state.vehicles.length) {
    vehiclesList.innerHTML = `<div class="empty-state">No vehicles yet.<br>Add one to get started.</div>`;
    return;
  }

  state.vehicles.forEach(vehicle => {
    const row = document.createElement("div");
    row.className = "vehicle-row" + (vehicle.id === selectedVehicleId ? " active" : "");

    row.innerHTML = `
      <div class="vehicle-top">
        <div>
          <div class="vehicle-name" data-action="select">${escapeHtml(vehicle.name)}</div>
          <div class="vehicle-meta">${vehicle.locations.length} location${vehicle.locations.length === 1 ? "" : "s"} · ${countItems(vehicle)} item${countItems(vehicle) === 1 ? "" : "s"}</div>
        </div>
        <div class="vehicle-actions">
          <button class="secondary" data-action="rename">Rename</button>
          <button class="danger" data-action="delete">Delete</button>
        </div>
      </div>
    `;

    row.querySelector('[data-action="select"]').addEventListener("click", () => {
      selectedVehicleId = vehicle.id;
      render();
    });

    row.querySelector('[data-action="rename"]').addEventListener("click", async () => {
      const newName = await promptForName("Rename vehicle", "Enter the new vehicle name", vehicle.name);
      if (!newName) return;
      vehicle.name = newName;
      saveState();
      render();
    });

    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      const ok = confirm(`Delete "${vehicle.name}" and everything inside it?`);
      if (!ok) return;

      state.vehicles = state.vehicles.filter(v => v.id !== vehicle.id);
      if (selectedVehicleId === vehicle.id) {
        selectedVehicleId = state.vehicles[0]?.id || null;
      }
      saveState();
      render();
    });

    vehiclesList.appendChild(row);
  });
}

function renderLocations() {
  const vehicle = getSelectedVehicle();

  if (!vehicle) {
    selectedVehicleTitle.textContent = "Select a vehicle";
    selectedVehicleMeta.textContent = "Add a caravan, camper trailer, car, or boat and start building locations.";
    addLocationBtn.disabled = true;
    locationsArea.className = "locations-area empty-state";
    locationsArea.textContent = "Select or add a vehicle to begin.";
    return;
  }

  selectedVehicleTitle.textContent = vehicle.name;
  selectedVehicleMeta.textContent = `${vehicle.locations.length} location${vehicle.locations.length === 1 ? "" : "s"} · ${countItems(vehicle)} total item${countItems(vehicle) === 1 ? "" : "s"}`;
  addLocationBtn.disabled = false;
  locationsArea.className = "locations-area";
  locationsArea.innerHTML = "";

  if (!vehicle.locations.length) {
    locationsArea.className = "locations-area empty-state";
    locationsArea.textContent = `No locations yet in ${vehicle.name}. Add one to get started.`;
    return;
  }

  const locationTemplate = document.getElementById("locationTemplate");
  const itemTemplate = document.getElementById("itemTemplate");

  vehicle.locations.forEach(location => {
    const card = locationTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".location-name").textContent = location.name;
    card.querySelector(".item-count").textContent = `${location.items.length} item${location.items.length === 1 ? "" : "s"}`;

    card.querySelector(".rename-location").addEventListener("click", async () => {
      const newName = await promptForName("Rename location", "Enter the new location name", location.name);
      if (!newName) return;
      location.name = newName;
      saveState();
      render();
    });

    card.querySelector(".delete-location").addEventListener("click", () => {
      const ok = confirm(`Delete location "${location.name}" and all items in it?`);
      if (!ok) return;
      vehicle.locations = vehicle.locations.filter(l => l.id !== location.id);
      saveState();
      render();
    });

    const itemInput = card.querySelector(".item-input");
    const addItemBtn = card.querySelector(".add-item-btn");

    function addItem() {
      const name = itemInput.value.trim();
      if (!name) return;
      location.items.push({ id: uid(), name });
      itemInput.value = "";
      saveState();
      render();
    }

    addItemBtn.addEventListener("click", addItem);
    itemInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addItem();
    });

    const itemsList = card.querySelector(".items-list");

    if (!location.items.length) {
      itemsList.innerHTML = `<div class="empty-state">No items yet in this location.</div>`;
    } else {
      location.items.forEach(item => {
        const row = itemTemplate.content.firstElementChild.cloneNode(true);
        row.querySelector(".item-name").textContent = item.name;

        row.querySelector(".rename-item").addEventListener("click", async () => {
          const newName = await promptForName("Rename item", "Enter the new item name", item.name);
          if (!newName) return;
          item.name = newName;
          saveState();
          render();
        });

        row.querySelector(".delete-item").addEventListener("click", () => {
          location.items = location.items.filter(i => i.id !== item.id);
          saveState();
          render();
        });

        itemsList.appendChild(row);
      });
    }

    locationsArea.appendChild(card);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
