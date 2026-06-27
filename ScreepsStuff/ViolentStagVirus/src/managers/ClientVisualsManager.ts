// src/managers/ClientVisualsManager.ts

import * as _ from "lodash";

export class ClientVisualsManager {
  public run(room: Room): void {
      const isOutlander = (c: Creep) => 
          ['sambar', 'javan', 'schomburgk', 'gazelle', 'caribou', 'reindeer'].includes(c.memory.role) || 
          (c.memory.role === 'moose' && !!c.memory.targetRoom);

      const getAgedColor = (baseColor: string, ttl: number | undefined) => {
          if (ttl === undefined) return baseColor; 
          const colorPercent = ttl > 750 ? 1 : ttl / 750;
          const r1 = parseInt(baseColor.substring(1, 3), 16);
          const g1 = parseInt(baseColor.substring(3, 5), 16);
          const b1 = parseInt(baseColor.substring(5, 7), 16);
          const r2 = parseInt('66', 16); 
          const g2 = parseInt('66', 16);
          const b2 = parseInt('66', 16);
          const r = Math.round(r1 * colorPercent + r2 * (1 - colorPercent));
          const g = Math.round(g1 * colorPercent + g2 * (1 - colorPercent));
          const b = Math.round(b1 * colorPercent + b2 * (1 - colorPercent));
          return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
      };

      const roomName = room.name;
      const visual = new RoomVisual(roomName);

      let roomType = "👀 VISIBLE ROOM";
      let headerColor = '#aaaaaa';
      let isHomeBase = false;

      let isOutpost = false;
      for (const homeName in Game.rooms) {
          const home = Game.rooms[homeName];
          if (home.controller?.my && home.memory.remoteRooms?.includes(roomName)) {
              isOutpost = true; 
              break;
          }
      }

      if (room.controller && room.controller.my) {
          const isRemoteBase = Memory.empire?.remoteBases?.includes(roomName);
          const isExpansion = Memory.empire?.targetExpansionRoom === roomName;

          if (isExpansion) {
              roomType = "🚀 EXPANSION";
              headerColor = '#ff5555';
              isHomeBase = true; // render dashboard so we can see Reindeers etc
          } else if (isRemoteBase) {
              roomType = "🏠 REMOTE BASE";
              headerColor = '#aaffaa';
              isHomeBase = true; 
          } else {
              roomType = "🏰 HOME BASE";
              headerColor = '#00ff00';
              isHomeBase = true;
          }
      } else if (isOutpost) {
          roomType = "📡 OUTPOST";
          headerColor = '#00ffff';
      }

      // 1. THE UNIVERSAL TITLE BAR
      visual.text(`${roomType}: ${roomName}`, 1, 1, { 
          align: 'left', 
          color: headerColor, 
          font: 'bold 1.1 Tahoma', 
          backgroundColor: '#000000', 
          backgroundPadding: 0.2,
          opacity: 0.8
      });

      const drawColumns = (columns: any[], creepsToDraw: Creep[], startY: number) => {
          const creepsByRole = _.groupBy(creepsToDraw, c => c.memory.role);
          for (const col of columns) {
              visual.text(col.role.toUpperCase(), col.x, startY, { align: 'left', font: 'bold 0.45 Tahoma', color: col.color });
              visual.line(col.x, startY + 0.2, col.x + 3, startY + 0.2, { color: '#444444' });

              const creeps = creepsByRole[col.role] || [];
              let currentY = startY + 1.0; 

              for (const creep of creeps) {
                  const shortName = creep.name.split(' (')[0]; 
                  const ttl = creep.ticksToLive || 1500;
                  const ttlPercent = ttl / 1500;
                  const agedColor = getAgedColor(col.color, creep.ticksToLive);

                  visual.text(shortName, col.x, currentY, { align: 'left', font: '0.45 Tahoma', color: agedColor });
                  const textWidth = shortName.length * 0.24; 
                  visual.line(col.x, currentY + 0.1, col.x + (textWidth * ttlPercent), currentY + 0.1, { color: agedColor, width: 0.05, opacity: 0.8 });
                  currentY += 0.8;
              }
          }
      };

      const gridStartY = 2.5; 

      if (isHomeBase) {
          // --- MAIN BASE DASHBOARD ---
          const localColumns = [
              { role: 'elk', x: 1, color: '#2ecc71' },      
              { role: 'stag', x: 7, color: '#f1c40f' },     
              { role: 'oryx', x: 13, color: '#9b59b6' },    
              { role: 'buck', x: 19, color: '#e67e22' },    
              { role: 'wapiti', x: 25, color: '#1abc9c' },  
              { role: 'mule', x: 31, color: '#bdc3c7' },    
              { role: 'moose', x: 37, color: '#c0392b' },
              { role: 'sika', x: 43, color: '#da61ff' }     
          ];
          
          const localCreeps = _.filter(Game.creeps, c => !isOutlander(c) && (c.room.name === room.name || c.memory.baseRoom === room.name));
          drawColumns(localColumns, localCreeps, gridStartY);

          // =========================================================
          // THE RELOCATED DASHBOARD (Bottom Left)
          // =========================================================
          const botLeftX = 1;
          let botLeftY = 28; 

          visual.text("🌍 THE OUTLANDERS", botLeftX, botLeftY, { align: "left", color: "#F4CE14", font: "bold 0.75 Tahoma" });
          botLeftY += 1.5;

          const remoteRooms = room.memory.remoteRooms || [];
          
          if (remoteRooms.length === 0) {
              visual.text("No active outposts.", botLeftX, botLeftY, { align: "left", color: "#888888", font: "0.6 Tahoma" });
              botLeftY += 1.5;
          }

          for (const outpost of remoteRooms) {
              // Skip rooms that are actively being claimed — shown in Expansion Fleet section instead
              if (outpost === Memory.empire?.targetExpansionRoom) continue;

              visual.text(`📍 Outpost: ${outpost}`, botLeftX, botLeftY, { align: "left", color: "#00E0FF", font: "bold 0.65 Tahoma" });
              botLeftY += 0.9;

              const outlanders = _.filter(Game.creeps, c => c.memory.targetRoom === outpost);
              
              const javans = outlanders.filter(c => c.memory.role === 'javan').length;
              const sambars = outlanders.filter(c => c.memory.role === 'sambar').length;
              const schoms = outlanders.filter(c => c.memory.role === 'schomburgk').length;
              const mooses = outlanders.filter(c => c.memory.role === 'moose').length;
              const caribous = outlanders.filter(c => c.memory.role === 'caribou').length;

              const dataFont = { align: "left" as const, color: "#DDDDDD", font: "0.6 monospace" };
              
              visual.text(`⛏️ Javans: ${javans}`, botLeftX + 0.5, botLeftY, dataFont);
              visual.text(`🚚 Sambars: ${sambars}`, botLeftX + 0.5, botLeftY + 0.7, dataFont);
              visual.text(`⚔️ Mooses:  ${mooses}`, botLeftX + 0.5, botLeftY + 1.4, dataFont);
              
              visual.text(`🏗️ Schoms:  ${schoms}`, botLeftX + 6.5, botLeftY, dataFont);
              visual.text(`🦬 Caribous: ${caribous}`, botLeftX + 6.5, botLeftY + 0.7, dataFont);
              
              botLeftY += 2.5; 
          }

          botLeftY += 0.5;
          visual.text("🚀 EXPANSION FLEET", botLeftX, botLeftY, { align: "left", color: "#FF00FF", font: "bold 0.75 Tahoma" });
          botLeftY += 1.2;

          const baseGazelles = _.filter(Game.creeps, c => c.memory.role === 'gazelle' && c.memory.baseRoom === room.name);
          const baseReindeers = _.filter(Game.creeps, c => c.memory.role === 'reindeer' && c.memory.baseRoom === room.name);

          const expansionFont = { align: "left" as const, color: "#DDDDDD", font: "0.6 monospace" };

          visual.text(`🔭 Gazelles:  ${baseGazelles.length}`, botLeftX, botLeftY, expansionFont);
          botLeftY += 0.9;

          visual.text(`🦌 Reindeer:  ${baseReindeers.length}`, botLeftX, botLeftY, expansionFont);
          botLeftY += 0.9;

          const targets = Memory.empire?.targetExpansionRoom;
          if (targets) {
              visual.text(`🚩 Target:    ${targets} (Claiming)`, botLeftX, botLeftY, { align: "left", color: "#FF5555", font: "0.6 monospace" });
          } else {
              visual.text(`🚩 Target:    None (Awaiting Intel)`, botLeftX, botLeftY, { align: "left", color: "#888888", font: "0.6 monospace" });
          }

          // BOTTOM CENTER: THE STATUS BARS
          const barX = 12;
          const barWidth = 30;
          const barHeight = 1.0;
          const barSpacing = 1.5;
          let currentBarY = 42.5; // Adjusted higher for 5-bar safety

          const resourceColors: { [key: string]: string } = {
              [RESOURCE_ENERGY]: '#ffe56c',  // Yellow
              [RESOURCE_KEANIUM]: '#da61ff', // Purple (Keanium)
              [RESOURCE_OXYGEN]: '#cccccc',  // White/Grey
              [RESOURCE_HYDROGEN]: '#bdc3c7',
              [RESOURCE_UTRIUM]: '#50ff50',
              [RESOURCE_LEMERGIUM]: '#50ff50',
              [RESOURCE_ZYNTHIUM]: '#ffe475',
              [RESOURCE_CATALYST]: '#ff7777'
          };

          const drawStackedBar = (title: string, store: Store<ResourceConstant, any>, y: number) => {
              const cap = store.getCapacity() || 1;
              visual.rect(barX, y, barWidth, barHeight, { fill: '#222222', stroke: '#555555' });
              
              let currentX = barX;
              for (const resource in store) {
                  const amount = store[resource as ResourceConstant];
                  if (amount > 0) {
                      const segmentWidth = (amount / cap) * barWidth;
                      const color = resourceColors[resource] || '#ffffff';
                      visual.rect(currentX, y, segmentWidth, barHeight, { fill: color });
                      currentX += segmentWidth;
                  }
              }
              const used = store.getUsedCapacity();
              visual.text(`${title}: ${(used / 1000).toFixed(1)}k / ${(cap / 1000).toFixed(1)}k`, barX + (barWidth / 2), y + 0.75, { align: 'center', color: (used/cap > 0.5) ? '#000000' : '#ffffff', font: 'bold 0.6 Tahoma' });
          };

          // 1. MINERAL (Top)
          const mineral = room.find(FIND_MINERALS)[0];
          if (mineral) {
              const amount = mineral.mineralAmount;
              const type = mineral.mineralType;
              const minColor = resourceColors[type] || '#636e72';
              visual.rect(barX, currentBarY, barWidth, barHeight, { fill: '#222222', stroke: '#555555' });
              visual.rect(barX, currentBarY, amount > 0 ? barWidth : 0, barHeight, { fill: minColor }); 
              visual.text(`MINERAL (${type}): ${(amount / 1000).toFixed(1)}k`, barX + (barWidth / 2), currentBarY + 0.75, { align: 'center', color: '#000000', font: 'bold 0.6 Tahoma' });
              currentBarY += barSpacing;
          }

          // 2. SPAWN ENERGY
          if (room.energyCapacityAvailable > 0) {
              const available = room.energyAvailable;
              const cap = room.energyCapacityAvailable;
              const percent = available / cap;
              visual.rect(barX, currentBarY, barWidth, barHeight, { fill: '#222222', stroke: '#555555' });
              visual.rect(barX, currentBarY, barWidth * percent, barHeight, { fill: resourceColors[RESOURCE_ENERGY] }); 
              visual.text(`SPAWN ENERGY: ${available} / ${cap}`, barX + (barWidth / 2), currentBarY + 0.75, { align: 'center', color: percent > 0.5 ? '#000000' : '#ffffff', font: 'bold 0.6 Tahoma' });
              currentBarY += barSpacing;
          }

          // 3. STORAGE
          if (room.storage) {
              drawStackedBar("STORAGE", room.storage.store, currentBarY);
              currentBarY += barSpacing;
          }

          // 4. TERMINAL
          if (room.terminal) {
              drawStackedBar("TERMINAL", room.terminal.store, currentBarY);
              currentBarY += barSpacing;
          }

          // 5. RCL (Bottom)
          if (room.controller) {
              const prog = room.controller.progress;
              const total = room.controller.progressTotal;
              const percent = prog / total;
              visual.rect(barX, currentBarY, barWidth, barHeight, { fill: '#222222', stroke: '#555555' });
              visual.rect(barX, currentBarY, barWidth * percent, barHeight, { fill: '#2ecc71' }); 
              visual.text(`RCL ${room.controller.level}: ${(prog / 1000).toFixed(1)}k / ${(total / 1000).toFixed(1)}k`, barX + (barWidth / 2), currentBarY + 0.75, { align: 'center', color: percent > 0.5 ? '#000000' : '#ffffff', font: 'bold 0.6 Tahoma' });
          }

      } else if (isOutpost) {
          // --- OUTPOST DASHBOARD ---
          const outpostColumns = [
              { role: 'javan', x: 1, color: '#e74c3c' },
              { role: 'sambar', x: 8, color: '#3498db' },
              { role: 'caribou', x: 15, color: '#9b59b6' },
              { role: 'moose', x: 22, color: '#c0392b' },
              { role: 'schomburgk', x: 29, color: '#7f8c8d' }
          ];
          
          const outpostCreeps = room.find(FIND_MY_CREEPS);
          drawColumns(outpostColumns, outpostCreeps, gridStartY);
      }
  }
}
