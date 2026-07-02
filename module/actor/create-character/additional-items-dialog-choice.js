export async function showAdditionalItemsChoiceDialog(items, callback) {
    const template = 'systems/mausritter/templates/dialogs/additional-item-choice.html';
    const html = await foundry.applications.handlebars.renderTemplate(template, {items: items})
    const selectedIndex = await foundry.applications.api.DialogV2.wait({
        window: { title: "Additional starting items" },
        content: html,
        buttons: [{
            action: "ok",
            label: 'ok',
            default: true,
            callback: (event, button) => button.form.elements.items.selectedIndex
        }],
        rejectClose: false
    });
    if (selectedIndex !== null) callback(selectedIndex);
}
