export default class ServerUtils {
    constructor(ns) {
        this.ns = ns;
    }

    async discoverServers(startingServerName, serverNamesToIgnore) {
        const servers = [startingServerName];

        for (let i = 0; i < servers.length; i++) {
            const newServers = await this.ns.scan(servers[i]);

            for (let j = 0; j < newServers.length; j++) {
                if (!serverNamesToIgnore.includes(newServers[j]) &&
                    !servers.includes(newServers[j])) {
                    servers.push(newServers[j]);
                }
            }
        }

        return servers;
    }

    purchaseHackingPrograms() {
        const hackingApps = [ "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe" ];

        if (this.ns.singularity.purchaseTor()) {
            for (let i = 0; i < hackingApps.length; i++) {
                if (!this.ns.fileExists(hackingApps[i])) {
                    this.ns.singularity.purchaseProgram(hackingApps[i]);
                }
            }
        }
    }

    async getRootAccess(serverName) {
        if (!await this.ns.hasRootAccess(serverName)) {
            if (await this.ns.getHackingLevel() >= await this.ns.getServerRequiredHackingLevel(serverName)) {
                if (await this.ns.fileExists('BruteSSH.exe')) {
                    await this.ns.brutessh(serverName);
                }

                if (await this.ns.fileExists('FTPCrack.exe')) {
                    await this.ns.ftpcrack(serverName);
                }

                if (await this.ns.fileExists('relaySMTP.exe')) {
                    await this.ns.relaysmtp(serverName);
                }

                if (await this.ns.fileExists('HTTPWorm.exe')) {
                    await this.ns.httpworm(serverName);
                }

                if (await this.ns.fileExists('SQLInject.exe')) {
                    await this.ns.sqlinject(serverName);
                }

                try {
                    await this.ns.nuke(serverName);
                } catch (error) {
                    if (error.includes('Not enough ports opened to use NUKE.exe virus')) {
                        return false;
                    } else {
                        throw error;
                    }
                }
            } else {
                return false;
            }
        }

        return true;
    }

    async getPathToServer(serverName) {
        const currentServerName = this.ns.getHostname();
        const queue = [{ server: currentServerName, path: currentServerName }];
        const visited = { currentServerName: true };

        while (queue.length > 0) {
            const { server, path } = queue.shift();
            const neighbors = this.ns.scan(server);

            for (const neighbor of neighbors) {
                if (neighbor === serverName) {
                    return path + ' --> ' + neighbor;
                }

                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push({ server: neighbor, path: path + ' --> ' + neighbor });
                }
            }
        }

        return 'No path found';
    }
}
