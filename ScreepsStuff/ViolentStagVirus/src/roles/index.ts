// src/roles/index.ts

import { RoleRegistry } from "./RoleRegistry";
import { StagRole } from "./stag";
import { BuckRole } from "./buck";
import { MuleRole } from "./mule";
import { OryxRole } from "./oryx";
import { ElkRole } from "./elk";
import { WapitiRole } from "./wapiti";
import { GazelleRole } from "./gazelle";
import { ReindeerRole } from "./reindeer";
import { JavanRole } from "./javan";
import { SambarRole } from "./sambar";
import { SchomburgkRole } from "./schomburgk";
import { CaribouRole } from "./caribou";
import { MooseRole } from "./moose";
import { SikaRole } from "./sika";

// Register all modular roles here
RoleRegistry.register(new StagRole());
RoleRegistry.register(new BuckRole());
RoleRegistry.register(new MuleRole());
RoleRegistry.register(new OryxRole());
RoleRegistry.register(new ElkRole());
RoleRegistry.register(new WapitiRole());
RoleRegistry.register(new GazelleRole());
RoleRegistry.register(new ReindeerRole());
RoleRegistry.register(new JavanRole());
RoleRegistry.register(new SambarRole());
RoleRegistry.register(new SchomburgkRole());
RoleRegistry.register(new CaribouRole());
RoleRegistry.register(new MooseRole());
RoleRegistry.register(new SikaRole());

// Export types if needed
export * from "./Role";
export * from "./RoleRegistry";
