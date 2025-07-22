const getStrategicMove = (board, validMoves) => {
    const moveOptions = [];
    const size = board[0].length;

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const isValidMove = validMoves[x][y] === true;
            const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;

            if (isValidMove && isNotReservedSpace) {
                moveOptions.push({ x, y, score: evaluateMove(board, x, y) });
            }
        }
    }

    moveOptions.sort((a, b) => b.score - a.score);
    return moveOptions.length > 0 ? [moveOptions[0].x, moveOptions[0].y] : [];
}

const evaluateMove = (board, x, y) => {
    const size = board[0].length;
    const centerX = Math.floor(size / 2);
    const centerY = Math.floor(size / 2);
    const distanceToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);

    // Calculate the potential to form groups and capture opponent stones
    const groupPotential = calculateGroupPotential(board, x, y);
    const capturePotential = calculateCapturePotential(board, x, y);

    // Higher score for moves closer to the center, with additional points for group and capture potential
    return (size - distanceToCenter) + groupPotential + capturePotential;
}

const calculateGroupPotential = (board, x, y) => {
    // Evaluate the potential to form groups with adjacent stones
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    let groupPotential = 0;

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < board.length && ny < board[0].length) {
            if (board[nx][ny] === 1) { // Assuming 1 represents our stones
                groupPotential += 1;
            }
        }
    }

    return groupPotential;
}

const calculateCapturePotential = (board, x, y) => {
    // Evaluate the potential to capture opponent stones
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    let capturePotential = 0;

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < board.length && ny < board[0].length) {
            if (board[nx][ny] === 2) { // Assuming 2 represents opponent stones
                capturePotential += 2;
            }
        }
    }

    return capturePotential;
}

export async function main(ns) {
    if (ns.args.length !== 2) {
        ns.tprint("Usage: run going.js <target> <size>");
        return;
    }

    let result, x, y;

    while (true) {
        do {
            const board = ns.go.getBoardState();
            const validMoves = ns.go.analysis.getValidMoves();
    
            const [strategicX, strategicY] = getStrategicMove(board, validMoves);
    
            x = strategicX;
            y = strategicY;
    
            if (x === undefined) {
                result = await ns.go.passTurn();
            } else {
                result = await ns.go.makeMove(x, y);
            }
    
            await ns.go.opponentNextTurn();
            await ns.sleep(200);
    
        } while (result?.type !== "gameOver");

        ns.go.resetBoardState(ns.args[0], parseInt(ns.args[1]));
        await ns.sleep(1000);
    }
}
