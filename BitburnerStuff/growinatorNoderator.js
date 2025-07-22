export async function main(ns) {
    let purchasedServerRootName = 'growinator';

    if (ns.args.length === 1) {
        purchasedServerRootName = ns.args[0];
    }

    let player = await ns.getPlayer();

    while (player.money > 0) {
        const servers = await ns.getPurchasedServers();

        const growinatorServers = servers
            .filter(item => item.startsWith(purchasedServerRootName))
            .sort();

        let newServerNeeded = true;

        for (let i = 0; i < growinatorServers.length; i++) {
            if (ns.getPurchasedServerLimit() > servers.length) {
                break;
            }

            let serverMaxRam = await ns.getServerMaxRam(growinatorServers[i]);

            if (serverMaxRam < 1048576) {
                serverMaxRam = serverMaxRam * 2

                if (await ns.upgradePurchasedServer(growinatorServers[i], serverMaxRam)) {
                    await ns.killall(growinatorServers[i]);
                    await renewThreads(growinatorServers[i], serverMaxRam, ns);
                }
            }

            const scriptInfo = await ns.getRunningScript('growinator.js', growinatorServers[i]);

            if (!scriptInfo || scriptInfo.threads === 0) {
                await renewThreads(growinatorServers[i], serverMaxRam, ns);
            }
        }

        if (newServerNeeded) {
            const purchasedServerName = await ns.purchaseServer(`growinator${growinatorServers.length + 1}`, 4);

            if (purchasedServerName !== '') {
                await renewThreads(purchasedServerName, 4, ns);
            }
        }

        player = await ns.getPlayer();
        await ns.sleep(61000);
    }
}

async function renewThreads(serverName, serverMaxRam, ns) {
    await ns.scp(['growinator.js'], serverName);

    const serverUsedRam = await ns.getServerUsedRam(serverName);
    const scriptRam = await ns.getScriptRam('growinator.js');
    const threads = Math.floor((serverMaxRam - serverUsedRam) / scriptRam);

    if (threads > 0) {
        await ns.exec('growinator.js', serverName, threads);
    }

    return threads;
}
