function renderHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function buildLegacySheetContext(sheet, document) {
  const source = document.toObject(false);
  const items = Array.from(document.items?.values?.() ?? []);
  source.items = items;
  source.effects = Array.from(document.effects?.values?.() ?? []);
  source.actor = document;
  source.item = document;
  source.document = document;
  source.object = document;
  source.dtypes = ["String", "Number", "Boolean"];
  source.owner = document.isOwner;
  source.editable = sheet.isEditable;
  source.options = sheet.options;
  source.cssClass = sheet.isEditable ? "editable" : "locked";

  return {
    actor: source,
    item: source,
    document,
    object: document,
    data: source,
    system: document.system,
    items,
    effects: source.effects,
    dtypes: ["String", "Number", "Boolean"],
    owner: document.isOwner,
    editable: sheet.isEditable,
    options: sheet.options,
    cssClass: sheet.isEditable ? "editable" : "locked"
  };
}

function activateTabs(element, initial) {
  const root = element instanceof HTMLElement ? element : element[0];
  const nav = root.querySelector(".sheet-tabs");
  if (!nav) return;

  const tabs = Array.from(root.querySelectorAll(".tab[data-tab]"));
  const links = Array.from(nav.querySelectorAll("[data-tab]"));
  const showTab = tabName => {
    for (const link of links) link.classList.toggle("active", link.dataset.tab === tabName);
    for (const tab of tabs) tab.classList.toggle("active", tab.dataset.tab === tabName);
  };

  const active = nav.querySelector("[data-tab].active")?.dataset.tab
    ?? links.find(link => link.dataset.tab === initial)?.dataset.tab
    ?? links[0]?.dataset.tab;
  if (active) showTab(active);

  nav.addEventListener("click", event => {
    const link = event.target.closest("[data-tab]");
    if (!link) return;
    event.preventDefault();
    showTab(link.dataset.tab);
  });
}

function applyDocumentSheetTheme(sheet) {
  const root = sheet.element instanceof HTMLElement ? sheet.element : sheet.element[0];
  const frame = root.closest(".application") ?? root;
  const apiTheme = foundry.applications.apps.DocumentSheetConfig.getSheetThemeForDocument(sheet.document);
  const flagTheme = sheet.document.getFlag?.("core", "sheetTheme") ?? sheet.document.flags?.core?.sheetTheme;
  const normalized = String(apiTheme || flagTheme || "").toLowerCase();

  for (const element of new Set([root, frame])) {
    element.classList.remove("theme-light", "theme-dark", "maus-theme-light", "maus-theme-dark");
    delete element.dataset.applicationTheme;
    delete element.dataset.mausTheme;

    if (normalized === "light" || normalized === "dark") {
      element.classList.add(`theme-${normalized}`, `maus-theme-${normalized}`);
      element.dataset.applicationTheme = normalized;
      element.dataset.mausTheme = normalized;
    }
  }
}

function activateItemCardPositioning(sheet) {
  if (!sheet.isEditable) return;

  const root = sheet.element instanceof HTMLElement ? sheet.element : sheet.element[0];
  const cards = root.querySelectorAll(".item-card.dragItems.dropitem");
  for (const card of cards) {
    card.draggable = false;
    card.addEventListener("pointerdown", event => startItemCardPositioning(sheet, card, event));
  }
}

function startItemCardPositioning(sheet, card, event) {
  if (event.button !== 0) return;
  if (event.target.closest("a, button, input, textarea, select, .item-controls, .pip-button, .damage-swap, .item-roll")) {
    return;
  }

  const itemId = card.dataset.itemId;
  const dragArea = card.closest("#drag-area");
  if (!itemId || !dragArea) return;

  event.preventDefault();
  event.stopPropagation();
  card.setPointerCapture?.(event.pointerId);
  card.classList.add("dragging");

  const areaRect = dragArea.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const offset = {
    x: event.clientX - cardRect.left - cardRect.width / 2,
    y: event.clientY - cardRect.top - cardRect.height / 2
  };
  let position = getItemCardPosition(event, areaRect, offset);

  const onPointerMove = moveEvent => {
    moveEvent.preventDefault();
    position = getItemCardPosition(moveEvent, areaRect, offset);
    card.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    card.style.zIndex = position.x + position.y + 1000;
  };

  const onPointerUp = async moveEvent => {
    card.releasePointerCapture?.(event.pointerId);
    card.classList.remove("dragging");
    card.removeEventListener("pointermove", onPointerMove);
    card.removeEventListener("pointerup", onPointerUp);
    card.removeEventListener("pointercancel", onPointerUp);

    const item = sheet.actor.getEmbeddedDocument("Item", itemId);
    if (!item) return;

    const itemData = item.toObject();
    itemData.system.sheet = {
      currentX: position.x,
      currentY: position.y,
      initialX: position.x,
      initialY: position.y,
      xOffset: position.x,
      yOffset: position.y
    };
    await sheet.actor.updateEmbeddedDocuments("Item", [itemData]);
  };

  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerUp);
}

function getItemCardPosition(event, areaRect, offset) {
  const roundScale = 5;
  const x = event.clientX - areaRect.left - areaRect.width / 2 - offset.x;
  const y = event.clientY - areaRect.top - areaRect.height / 2 - offset.y;
  return {
    x: Math.round(x / roundScale) * roundScale,
    y: Math.round(y / roundScale) * roundScale
  };
}

export class MausritterActorSheetV2 extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    actions: {},
    classes: ["mausritter", "sheet", "actor"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: MausritterActorSheetV2.onSubmitActorForm
    },
    position: {
      width: 742,
      height: 800
    },
    window: {
      resizable: true
    }
  };

  static async onSubmitActorForm(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    return this.document.update(updateData, { diff: false });
  }

  get template() {
    return this.constructor.DEFAULT_OPTIONS.template;
  }

  async _prepareContext(options) {
    const context = buildLegacySheetContext(this, this.actor);
    const data = this.getData(context);
    if (Array.isArray(data.items) && data.gear) data.items.gear = data.gear;
    return data;
  }

  getData(data = buildLegacySheetContext(this, this.actor)) {
    return data;
  }

  async _renderHTML(context, options) {
    const html = await foundry.applications.handlebars.renderTemplate(this.template, context);
    return renderHtml(html);
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    applyDocumentSheetTheme(this);
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
    activateItemCardPositioning(this);
  }

  async _onDropItemCreate(itemData) {
    const items = Array.isArray(itemData) ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments("Item", items);
  }

  activateListeners(html) {}
}

export class MausritterItemSheetV2 extends foundry.applications.sheets.ItemSheetV2 {
  static DEFAULT_OPTIONS = {
    actions: {},
    classes: ["mausritter", "sheet", "item"],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: MausritterItemSheetV2.onSubmitItemForm
    },
    position: {
      width: 520,
      height: 480
    },
    window: {
      resizable: true
    }
  };

  static async onSubmitItemForm(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    return this.document.update(updateData, { diff: false });
  }

  async _prepareContext(options) {
    const context = buildLegacySheetContext(this, this.item);
    return this.getData(context);
  }

  getData(data = buildLegacySheetContext(this, this.item)) {
    return data;
  }

  async _renderHTML(context, options) {
    const html = await foundry.applications.handlebars.renderTemplate(this.template, context);
    return renderHtml(html);
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    applyDocumentSheetTheme(this);
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
  }

  activateListeners(html) {}
}
