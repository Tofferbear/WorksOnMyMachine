// src/managers/MarketManager.ts

export class MarketManager {
    public run(room: Room): void {
        const terminal = room.terminal;
        if (!terminal || !terminal.my || terminal.cooldown !== 0) return;

        // Auto-sell surplus energy
        const surplusThreshold = 100000;
        const sellAmount = 10000;

        if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) > surplusThreshold) {
            // Find highest buy order for energy
            const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: RESOURCE_ENERGY });
            
            if (orders.length > 0) {
                // Sort by price descending
                orders.sort((a, b) => b.price - a.price);
                
                const bestOrder = orders[0];
                const amountToSell = Math.min(sellAmount, bestOrder.amount);

                // Calculate energy cost for transaction
                const transactionCost = Game.market.calcTransactionCost(amountToSell, room.name, bestOrder.roomName!);
                
                if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) - transactionCost >= amountToSell) {
                    const result = Game.market.deal(bestOrder.id, amountToSell, room.name);
                    if (result === OK) {
                        console.log(`[Market] Sold ${amountToSell} energy at ${bestOrder.price} credits/unit.`);
                    }
                }
            }
        }
    }
}
