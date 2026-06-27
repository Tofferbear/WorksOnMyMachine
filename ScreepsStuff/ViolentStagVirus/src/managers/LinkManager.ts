// src/managers/LinkManager.ts

export class LinkManager {
  public run(room: Room): void {
    if (room.controller!.level < 5) return; // Links unlock at RCL 5

    const links = room.find<StructureLink>(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_LINK }
    });

    if (links.length < 2) return;

    // Identify Storage Link, Controller Link, and Source Links.
    // Heuristic: 
    // - Link near Controller is Controller Link
    // - Link near Storage is Storage Link
    // - Links near Sources are Source Links

    let controllerLink: StructureLink | null = null;
    let storageLink: StructureLink | null = null;
    const sourceLinks: StructureLink[] = [];

    const storage = room.storage;
    for (const link of links) {
      if (link.pos.inRangeTo(room.controller!, 3)) {
        controllerLink = link;
      } else if (storage && link.pos.inRangeTo(storage, 3)) {
        storageLink = link;
      } else {
        sourceLinks.push(link);
      }
    }

    // Logic: Source Links send energy to Storage Link or Controller Link
    for (const sourceLink of sourceLinks) {
      if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && sourceLink.cooldown === 0) {
        if (controllerLink && controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) {
             sourceLink.transferEnergy(controllerLink);
        } else if (storageLink && storageLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) {
             sourceLink.transferEnergy(storageLink);
        }
      }
    }

    // Storage link might also feed controller link if source links aren't keeping up
    if (storageLink && controllerLink && storageLink.cooldown === 0 && storageLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 700) {
      if (controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 700) {
        storageLink.transferEnergy(controllerLink);
      }
    }
  }
}
