export class DLCreatureSettings extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
        id: "sheet-modifiers",
        classes: ["mausritter", "sheet", "actor", "hireling"],
        position: {
            width: 320,
            height: 150
        },
        window: {
            title: "Creature Settings"
        }
    };

    constructor(object, options = {}) {
        super(options);
        this.object = object;
    }

    get title() {
        return `${this.object.name}: Creature Settings`;
    }

    async _prepareContext(options) {
        const actor = this.object;
        return {
            actor,
            system: actor.system,
            cssClass: "editable"
        };
    }

    async _renderHTML(context, options) {
        const html = await foundry.applications.handlebars.renderTemplate(
            "systems/mausritter/templates/dialogs/creature-settings-dialog.html",
            context
        );
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    _replaceHTML(result, content, options) {
        content.replaceChildren(result);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        this.activateListeners($(this.element));
    }

    activateListeners(html) {
        const stats = ["combat", "instinct", "loyalty", "speed", "armor", "sanity"];

        for (const stat of stats) {
            const selector = `input[type=checkbox][id="system.stats.${stat}.enabled"]`;
            html.find(selector).on("click", ev => {
                this.object.update({
                    [`system.stats.${stat}.enabled`]: ev.currentTarget.checked
                });
            });
        }
    }

    async _onSubmitForm(formConfig, event) {
        const formData = new foundry.applications.ux.FormDataExtended(event.currentTarget);
        await this.object.update(foundry.utils.expandObject(formData.object));
        this.object.sheet.render({ force: true });
    }
}
