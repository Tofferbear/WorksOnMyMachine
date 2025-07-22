async function getPathToServer(ns, serverName) {
    const currentServerName = ns.getHostname();
    const queue = [{server: currentServerName, path: currentServerName}];
    const visited = {currentServerName: true};

    while (queue.length > 0) {
        const {server, path} = queue.shift();
        const neighbors = ns.scan(server);

        for (const neighbor of neighbors) {
            if (neighbor === serverName) {
                return path + ' --> ' + neighbor;
            }

            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.push({server: neighbor, path: path + ' --> ' + neighbor});
            }
        }
    }

    return 'No path found';
}

export async function main(ns) {
    await ns.tprint(await getPathToServer(ns, ns.args[0]));
}
