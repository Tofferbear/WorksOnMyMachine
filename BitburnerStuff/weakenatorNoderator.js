export async function main(ns) {
    let purchasedServerRootName = 'weakenator';

    if (ns.args.length === 1) {
        purchasedServerRootName = ns.args[0];
    }

    let player = await ns.getPlayer();

    while (player.money > 0) {
        const servers = await ns.getPurchasedServers();

        const weakenatorServers = servers
            .filter(item => item.startsWith(purchasedServerRootName))
            .sort();

        let newServerNeeded = true;

        for (let i = 0; i < weakenatorServers.length; i++) {
            if (ns.getPurchasedServerLimit() > servers.length) {
                break;
            }

            let serverMaxRam = await ns.getServerMaxRam(weakenatorServers[i]);

            if (serverMaxRam < 1048576) {
                serverMaxRam = serverMaxRam * 2

                if (await ns.upgradePurchasedServer(weakenatorServers[i], serverMaxRam)) {
                    await ns.killall(weakenatorServers[i]);
                    await renewThreads(weakenatorServers[i], serverMaxRam, ns);
                }
            }

            const scriptInfo = await ns.getRunningScript('weakenator.js', weakenatorServers[i]);

            if (!scriptInfo || scriptInfo.threads === 0) {
                await renewThreads(weakenatorServers[i], serverMaxRam, ns);
            }
        }

        if (newServerNeeded) {
            const purchasedServerName = await ns.purchaseServer(`weakenator${weakenatorServers.length + 1}`, 4);

            if (purchasedServerName !== '') {
                await renewThreads(purchasedServerName, 4, ns);
            }
        }

        player = await ns.getPlayer();
        await ns.sleep(60000);
    }
}

async function renewThreads(serverName, serverMaxRam, ns) {
    await ns.scp(['weakenator.js'], serverName);

    const serverUsedRam = await ns.getServerUsedRam(serverName);
    const scriptRam = await ns.getScriptRam('weakenator.js');
    const threads = Math.floor((serverMaxRam - serverUsedRam) / scriptRam);

    if (threads > 0) {
        await ns.exec('weakenator.js', serverName, threads);
    }

    return threads;
}
