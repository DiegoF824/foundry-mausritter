export async function getItemFromFoundry(item_id) {
    return await Item.implementation.fromDropData({
        type: "Item",
        uuid: item_id
    });
}

export async function addItem(itemId, instant, slot) {
    const item = await getItemFromFoundry(itemId);
    const itemData = item.toObject();
    if (slot) {
        itemData.system.sheet = slot
    }
    await instant.sheet._onDropItemCreate(itemData)
}

export async function attrRoll() {
    const roll = await new Roll('3d6kh2').evaluate();
    return roll.total;
}

export async function drawFromTable(tableName) {
    const listCompendium = await game.packs.filter(p => p.documentName === 'RollTable');
    const compendiumTables = await listCompendium.filter(p => p.metadata.label === CONFIG.MAUSRITTER.tables.tables)
    if (compendiumTables.length===0) {
        ui.notifications.warn(`Table ${tableName} not found.`, {});
        return;
    }
    const inside = await compendiumTables[0].getDocuments();
    const table = await inside.filter(p => p.name === tableName)[0];

    if (!table) {
        ui.notifications.warn(`Table ${tableName} not found.`, {});
        return;
    }

    const buffer = await table.roll();

    return buffer.results[0].text;
}
