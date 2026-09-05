"use strict";
const groups = [
  {id:"proteins", title:"Choose your protein", included:0, extra:0, note:"Minimum 10 guests per protein type.", y:233, items:[
    ["lamb","Slow-Cooked Lamb",26,67], ["harissa","Harissa Honey Chicken Thighs",24,136], ["salmon","Seared Herbed Salmon",25,205], ["kofta","Spiced Lean Beef & Mushroom Kofta",24,273], ["monkfish","Curry Yogurt Monkfish Kebab",24,343], ["lemon","Pan-Seared Lemon Garlic Chicken",23,410], ["tofu","Gochujang Glazed Tofu",20,479,true]]},
  {id:"grains", title:"Choose your grain", included:1, extra:3, note:"1 included. Each additional choice is $3 per guest.", y:378, items:[
    ["basmati","White Basmati Rice",0,67], ["wild-rice","Wild Rice Grain Medley",0,136], ["bulgur","Bulgur Wheat",0,205], ["farro","Farro (Whole Grain Wheat)",0,273], ["quinoa","Tricolor Quinoa",0,342]]},
  {id:"greens", title:"Choose your greens & beans", included:2, extra:3, note:"2 included. Each additional choice is $3 per guest.", y:510, items:[
    ["kale","Sauteed Kale & Spinach Blend",0,67], ["broccoli","Broccoli Slaw",0,136], ["arugula","Arugula",0,205], ["cabbage","Tricolor Cabbage Slaw",0,273], ["romaine","Romaine",0,342], ["black-beans","Latin Inspired Black Beans",0,410], ["chickpeas","Moroccan Inspired Chickpeas",0,479], ["butter-beans","Creamy Leek Lemon Garlic Butter Beans",0,548]]},
  {id:"sauces", title:"Choose your sauces & accompaniments", included:3, extra:2, note:"3 included. Each additional choice is $2 per guest.", y:651, items:[
    ["tzatziki","Tzatziki",0,67], ["goddess","Green Goddess EVOO Aquafaba",0,136,true], ["muhummara","Walnut & Piquillo Muhummara",0,205,true], ["ranch","Kimchi Ranch EVOO Aquafaba",0,273,true], ["tahini","Whipped Roasted Beet Tahini",0,342,true], ["pineapple","Pineapple Salsa",0,410], ["shiraz","Pomegranate Shirazi Salad",0,479,true]]}
];
const storageKey = "rooted-menu-v1";
const selections = Object.fromEntries(groups.map(g => [g.id, new Set()]));
const quantities = {};
const money = value => new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(value);
const $ = id => document.getElementById(id);
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  for (const group of groups) for (const item of group.items) {
    if (Array.isArray(saved?.[group.id]) && saved[group.id].includes(item[0])) selections[group.id].add(item[0]);
    const value = saved?.quantities?.[item[0]];
    quantities[item[0]] = Number.isInteger(value) && value >= 10 && value <= 10000 ? value : 10;
  }
} catch { /* Draft storage is optional. */ }
for (const group of groups) {
  const section = document.createElement("section");
  section.className = "menu-section";
  section.id = group.id;
  section.setAttribute("aria-labelledby", `${group.id}-title`);
  section.innerHTML = `<div class="section-heading"><div><h2 id="${group.id}-title">${group.title}</h2><p>${group.note}</p></div><span class="count" id="${group.id}-count"></span></div><div class="choices"></div>`;
  for (const [id,name,price,x,vegan] of group.items) {
    const card = document.createElement("article");
    card.className = "choice";
    card.innerHTML = `<label class="choice-label" for="${id}"><input id="${id}" type="checkbox" data-group="${group.id}"><span class="food-photo" aria-hidden="true" style="background-position:${31-x}px ${31-group.y}px"></span><span class="choice-name">${name}${vegan ? '<span class="vegan">Vegan</span>' : ''}</span>${price ? `<span class="price">$${price} per guest</span>` : ''}</label>${price ? `<div class="quantity" id="${id}-quantity" hidden><label for="${id}-guests">Guests<input id="${id}-guests" type="number" min="10" max="10000" step="1" value="${quantities[id] || 10}" aria-label="Guests for ${name}"></label></div>` : ''}`;
    section.querySelector(".choices").append(card);
    card.querySelector("input[type=checkbox]").checked = selections[group.id].has(id);
    card.querySelector("input[type=checkbox]").addEventListener("change", event => {
      event.target.checked ? selections[group.id].add(id) : selections[group.id].delete(id);
      update();
    });
    if (price) card.querySelector("input[type=number]").addEventListener("input", event => {
      quantities[id] = Number(event.target.value);
      update();
    });
  }
  $("menu-sections").append(section);
}
function calculate() {
  let guests = 0, base = 0;
  const errors = [];
  if (!selections.proteins.size) errors.push("Choose at least one protein.");
  for (const [id,name,price] of groups[0].items) if (selections.proteins.has(id)) {
    const qty = quantities[id] || 0;
    if (!Number.isInteger(qty) || qty < 10 || qty > 10000) errors.push(`${name}: enter a whole number of guests, minimum 10 (maximum 10,000).`);
    else { guests += qty; base += qty * price; }
  }
  let extraPerGuest = 0;
  for (const group of groups.slice(1)) {
    const count = selections[group.id].size;
    if (count < group.included) errors.push(`Choose ${group.included - count} more ${group.id === "greens" ? "greens or beans" : group.id === "grains" ? "grain" : "sauces or accompaniments"}.`);
    extraPerGuest += Math.max(0, count - group.included) * group.extra;
  }
  return {guests, base, extra:extraPerGuest * guests, total:base + extraPerGuest * guests, errors};
}
function update() {
  const estimate = calculate();
  $("summary-items").replaceChildren();
  for (const group of groups) {
    const chosen = group.items.filter(i => selections[group.id].has(i[0]));
    $(`${group.id}-count`).textContent = `${chosen.length} selected${group.included ? ` / ${group.included} included` : ""}`;
    if (group.id === "proteins") for (const [id] of group.items) $(`${id}-quantity`).hidden = !selections.proteins.has(id);
    if (!chosen.length) continue;
    const summary = document.createElement("div");
    summary.className = "summary-group";
    const heading = document.createElement("h3");
    heading.textContent = group.title.replace("Choose your ", "");
    summary.append(heading);
    for (const [id,name,price] of chosen) {
      const line = document.createElement("p");
      line.textContent = price ? `${quantities[id] || 0} guests - ${name}` : name;
      summary.append(line);
    }
    $("summary-items").append(summary);
  }
  $("guest-total").textContent = `${estimate.guests} ${estimate.guests === 1 ? "guest" : "guests"}`;
  $("base-total").textContent = money(estimate.base);
  $("extra-total").textContent = money(estimate.extra);
  $("subtotal").textContent = money(estimate.total);
  $("requirements").replaceChildren(...estimate.errors.map(error => {const li=document.createElement("li");li.textContent=error;return li;}));
  $("action-message").textContent = "";
  try { localStorage.setItem(storageKey, JSON.stringify({...Object.fromEntries(groups.map(g=>[g.id,[...selections[g.id]]])),quantities})); } catch { /* The menu still works without storage. */ }
}
function menuText() {
  const estimate = calculate();
  const lines = ["Rooted by Reimagined Nutrition", "Catering inquiry - not a confirmed order", "", `Guests: ${estimate.guests}`];
  for (const group of groups) {
    lines.push("", group.title.replace("Choose your ", "").toUpperCase());
    for (const [id,name,price] of group.items) if (selections[group.id].has(id)) lines.push(price ? `${name}: ${quantities[id]} guests at ${money(price)} each` : name);
  }
  lines.push("", `Protein packages: ${money(estimate.base)}`, `Additional choices: ${money(estimate.extra)}`, `Estimated subtotal: ${money(estimate.total)} (before tax and delivery)`);
  for (const [id,label] of [["event-name","Event"],["event-date","Date"],["event-location","Delivery location"],["event-notes","Notes"]]) if ($(id).value.trim()) lines.push(`${label}: ${$(id).value.trim()}`);
  if (estimate.errors.length) lines.push("", "Still needed:", ...estimate.errors);
  lines.push("", "Final availability, dietary suitability, delivery, and pricing to be confirmed with Ali. Minimum 72 hours advance notice.");
  return lines.join("\n");
}
$("email-menu").addEventListener("click", () => {
  const errors = calculate().errors;
  if (errors.length) { $("action-message").textContent = "Please complete the choices listed above before emailing."; return; }
  const date = $("event-date").value;
  if (date && new Date(`${date}T00:00:00`).getTime() < Date.now() + 72*60*60*1000) { $("action-message").textContent="The requested date must allow at least 72 hours. Contact Ali directly about shorter notice."; $("event-date").focus(); return; }
  location.href = `mailto:ali@reimaginednutrition.com?subject=${encodeURIComponent("Rooted catering inquiry")}&body=${encodeURIComponent(menuText())}`;
  $("action-message").textContent = "Your email draft is ready to open. Nothing has been submitted here; send it from your email app. You can also copy or download your menu.";
});
$("copy-menu").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(menuText()); $("action-message").textContent="Menu copied."; }
  catch { $("copy-fallback").hidden=false; $("copy-text").value=menuText(); $("copy-text").focus(); $("copy-text").select(); $("action-message").textContent="Select and copy the menu below."; }
});
$("download-menu").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([menuText()], {type:"text/plain;charset=utf-8"}));
  const link = document.createElement("a");link.href=url;link.download="rooted-catering-menu.txt";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $("action-message").textContent="Menu download prepared.";
});
$("reset").addEventListener("click", () => {
  if (!confirm("Clear your menu selections and event details?")) return;
  for (const group of groups) {selections[group.id].clear();for (const [id] of group.items) {$(id).checked=false;quantities[id]=10;if ($(`${id}-guests`)) $(`${id}-guests`).value=10;}}
  for (const id of ["event-name","event-date","event-location","event-notes"]) $(id).value="";
  $("copy-fallback").hidden=true;update();$("action-message").textContent="Menu cleared.";
});
update();
