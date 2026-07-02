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
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
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
    activateTabs(this.element, this.constructor.DEFAULT_OPTIONS.initialTab);
    this.activateListeners($(this.element));
  }

  activateListeners(html) {}
}
