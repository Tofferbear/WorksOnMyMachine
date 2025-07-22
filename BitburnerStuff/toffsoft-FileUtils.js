export default class FileUtils {
    constructor(ns) {
        this.ns = ns;
    }

    async cpAll(sourceFolderPath, destinationServerName, sourceServerName = 'home') {
        const files = this.ns.ls(sourceServerName, sourceFolderPath);

        if (files.length === 0) {
            this.ns.tprint(`Folder ${sourceFolderPath} does not exist or is empty`);
            return;
        }

        this.ns.scp(files, destinationServerName, sourceServerName);
        this.ns.tprint(`Copied /${files.join(', /')} to ${destinationServerName}`);
    }

    async rmAll(folderPath) {
        const files = this.ns.ls('home', folderPath);

        if (files.length === 0) {
            this.ns.tprint(`Folder ${folderPath} does not exist or is empty`);
            return;
        }

        for (const file of files) {
            this.ns.rm(file);
            this.ns.tprint(`Removed /${file}`);
        }
    }
}
