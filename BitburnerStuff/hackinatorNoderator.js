export async function main(ns) {
    let purchasedServerRootName = 'hackinator';

    if (ns.args.length === 1) {
        purchasedServerRootName = ns.args[0];
    }

    let player = await ns.getPlayer();

    while (player.money > 0) {
        const servers = await ns.getPurchasedServers();

        const hackinatorServers = servers
            .filter(item => item.startsWith(purchasedServerRootName))
            .sort();

        let newServerNeeded = true;

        for (let i = 0; i < hackinatorServers.length; i++) {
            if (ns.getPurchasedServerLimit() > servers.length) {
                break;
            }

            let serverMaxRam = await ns.getServerMaxRam(hackinatorServers[i]);

            if (serverMaxRam < 1048576) {
                serverMaxRam = serverMaxRam * 2

                if (await ns.upgradePurchasedServer(hackinatorServers[i], serverMaxRam)) {
                    await ns.killall(hackinatorServers[i]);
                    await renewThreads(hackinatorServers[i], serverMaxRam, ns);
                }
            }

            const scriptInfo = await ns.getRunningScript('hackinator.js', hackinatorServers[i]);

            if (!scriptInfo || scriptInfo.threads === 0) {
                await renewThreads(hackinatorServers[i], serverMaxRam, ns);
            }
        }

        if (newServerNeeded) {
            const purchasedServerName = await ns.purchaseServer(`hackinator${hackinatorServers.length + 1}`, 4);

            if (purchasedServerName !== '') {
                await renewThreads(purchasedServerName, 4, ns);
            }
        }

        player = await ns.getPlayer();
        await ns.sleep(62000);
    }
}

async function renewThreads(serverName, serverMaxRam, ns) {
    await ns.scp(['hackinator.js'], serverName);

    const serverUsedRam = await ns.getServerUsedRam(serverName);
    const scriptRam = await ns.getScriptRam('hackinator.js');
    const threads = Math.floor((serverMaxRam - serverUsedRam) / scriptRam);

    if (threads > 0) {
        await ns.exec('hackinator.js', serverName, threads);
    }

    return threads;
}
