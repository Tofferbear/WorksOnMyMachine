export async function main(ns) {
    let player = await ns.getPlayer();

    while (player.money > 0) {
        const upgradeMap = {
            newNode: {
                cost: await ns.hacknet.getPurchaseNodeCost()
            },
            upgradeNodeLevel: {
                cost: -1,
                index: -1
            },
            upgradeNodeRam: {
                cost: -1,
                index: -1
            },
            upgradeNodeCore: {
                cost: -1,
                index: -1
            }
        };

        for (let i = 0; i < await ns.hacknet.numNodes(); i++) {
            const levelUpgradeCost = await ns.hacknet.getLevelUpgradeCost(i);
            const ramUpgradeCost = await ns.hacknet.getRamUpgradeCost(i);
            const coreUpgradeCost = await ns.hacknet.getCoreUpgradeCost(i);

            if (upgradeMap['upgradeNodeLevel']['cost'] === -1 ||
                upgradeMap['upgradeNodeLevel']['cost'] > levelUpgradeCost) {
                upgradeMap['upgradeNodeLevel']['cost'] = levelUpgradeCost;
                upgradeMap['upgradeNodeLevel']['index'] = i;
            }

            if (upgradeMap['upgradeNodeRam']['cost'] === -1 ||
                upgradeMap['upgradeNodeRam']['cost'] > ramUpgradeCost) {
                upgradeMap['upgradeNodeRam']['cost'] = ramUpgradeCost;
                upgradeMap['upgradeNodeRam']['index'] = i;
            }

            if (upgradeMap['upgradeNodeCore']['cost'] === -1 ||
                upgradeMap['upgradeNodeCore']['cost'] > coreUpgradeCost) {
                upgradeMap['upgradeNodeCore']['cost'] = coreUpgradeCost;
                upgradeMap['upgradeNodeCore']['index'] = i;
            }
        }

        if ((upgradeMap['newNode']['cost'] < upgradeMap['upgradeNodeLevel']['cost'] &&
            upgradeMap['newNode']['cost'] < upgradeMap['upgradeNodeRam']['cost'] &&
            upgradeMap['newNode']['cost'] < upgradeMap['upgradeNodeCore']['cost']) ||
            (upgradeMap['newNode']['cost'] > 0 &&
                upgradeMap['upgradeNodeLevel']['cost'] === -1 &&
                upgradeMap['upgradeNodeRam']['cost'] === -1 &&
                upgradeMap['upgradeNodeCore']['cost'] === -1)) {
            if (player.money > upgradeMap['newNode']['cost']) {
                await ns.hacknet.purchaseNode();
            }
        }

        if (upgradeMap['upgradeNodeLevel']['cost'] < upgradeMap['newNode']['cost'] &&
            upgradeMap['upgradeNodeLevel']['cost'] < upgradeMap['upgradeNodeRam']['cost'] &&
            upgradeMap['upgradeNodeLevel']['cost'] < upgradeMap['upgradeNodeCore']['cost']) {
            if (player.money > upgradeMap['upgradeNodeLevel']['cost']) {
                await ns.hacknet.upgradeLevel(upgradeMap['upgradeNodeLevel']['index']);
            }
        }

        if (upgradeMap['upgradeNodeRam']['cost'] < upgradeMap['upgradeNodeLevel']['cost'] &&
            upgradeMap['upgradeNodeRam']['cost'] < upgradeMap['newNode']['cost'] &&
            upgradeMap['upgradeNodeRam']['cost'] < upgradeMap['upgradeNodeCore']['cost']) {
            if (player.money > upgradeMap['upgradeNodeRam']['cost']) {
                await ns.hacknet.upgradeRam(upgradeMap['upgradeNodeRam']['index']);
            }
        }

        if (upgradeMap['upgradeNodeCore']['cost'] < upgradeMap['upgradeNodeLevel']['cost'] &&
            upgradeMap['upgradeNodeCore']['cost'] < upgradeMap['upgradeNodeRam']['cost'] &&
            upgradeMap['upgradeNodeCore']['cost'] < upgradeMap['newNode']['cost']) {
            if (player.money > upgradeMap['upgradeNodeCore']['cost']) {
                await ns.hacknet.upgradeCore(upgradeMap['upgradeNodeCore']['index']);
            }
        }

        player = await ns.getPlayer();
        await ns.sleep(10000);
    }

    ns.tprint('All money has been spent.');
}
