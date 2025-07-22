import FileUtils from './toffsoft-FileUtils.js';

export async function main(ns) {
    const fileUtils = new FileUtils(ns);
    fileUtils.rmAll(ns.args[0]);
}
