export async function main(ns) {
    while (true) {
        const servers = ['home'];

        for (let i = 0; i < servers.length; i++) {
            const newServers = await ns.scan(servers[i]);

            for (let j = 0; j < newServers.length; j++) {
                if (newServers[j] !== 'home' &&
                    newServers[j] !== 'darkweb' &&
                    !servers.includes(newServers[j])) {
                    servers.push(newServers[j]);
                }
            }
        }

        for (let i = 0; i < servers.length; i++) {
            const server = ns.getServer(servers[i]);

            if (servers[i] !== 'home' &&
                !server.purchasedByPlayer &&
                server.hasAdminRights &&
                (server.hackDifficulty <= server.minDifficulty) &&
                (server.moneyAvailable === server.moneyMax)) {
                await ns.hack(servers[i]);
            }
        }

        await ns.sleep(1000);
    }
}
