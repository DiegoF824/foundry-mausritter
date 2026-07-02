export async function showCreateCharacterDialog(callback) {
    const template = 'systems/mausritter/templates/dialogs/create-character.html';
    const html = await foundry.applications.handlebars.renderTemplate(template)
    const options = await foundry.applications.api.DialogV2.input({
        window: { title: "What do you want to create?" },
        content: html,
        ok: { label: 'ok' },
        rejectClose: false
    });
    if (options) callback(options);
}
