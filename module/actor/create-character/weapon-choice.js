export async function showWeaponChoiceDialog(callback) {
    const template = 'systems/mausritter/templates/dialogs/weapon-choice.html';
    const html = await foundry.applications.handlebars.renderTemplate(template)
    const formData = await foundry.applications.api.DialogV2.input({
        window: { title: "What weapon do you want?" },
        content: html,
        ok: { label: 'ok' },
        rejectClose: false
    });
    if (formData) callback(formData.weapons);
}
