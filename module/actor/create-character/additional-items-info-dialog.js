export async function showAdditionalItemsInfoDialog(items) {
    const template = 'systems/mausritter/templates/dialogs/additional-item-info.html';
    const html = await foundry.applications.handlebars.renderTemplate(template, {items: items})
    await foundry.applications.api.DialogV2.wait({
        window: { title: "Additional starting items" },
        content: html,
        buttons: [{
            action: "ok",
            label: 'ok',
            default: true
        }],
        rejectClose: false
    });
}
