import FileUtils from './toffsoft-FileUtils.js';

export async function main(ns) {
    const fileUtils = new FileUtils(ns);
    fileUtils.cpAll(ns.args[0], ns.args[1], ns.getHostname());
}
