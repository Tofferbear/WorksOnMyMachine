import ServerUtils from './toffsoft-ServerUtils.js';

export async function main(ns) {
    const serverUtils = new ServerUtils(ns);

    while (true) {
        const servers = await serverUtils.discoverServers('home', ['home', 'darkweb']);
        // serverUtils.purchaseHackingPrograms();

        for (let i = 0; i < servers.length; i++) {
            await serverUtils.getRootAccess(servers[i])
        }

        await ns.sleep(1000);
    }
}
