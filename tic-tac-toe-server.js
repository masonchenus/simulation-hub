const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const games = {}; // Store game states

function generateGameCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

/**
 * Checks for a win or draw condition on the board.
 * @param {object} game - The game state object.
 * @returns {string|null} 'X', 'O', 'Draw', or null if the game is ongoing.
 */
function checkWin(game) {
    const { gameState, gridSize, winLength, currentPlayer } = game;
    const board = gameState;

    const isValid = (r, c) => r >= 0 && r < gridSize && c >= 0 && c < gridSize;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (board[r * gridSize + c] !== currentPlayer) continue;

            const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]; // Horizontal, Vertical, Diagonal
            for (let [dr, dc] of dirs) {
                let count = 0;
                for (let s = 0; s < winLength; s++) {
                    const nr = r + dr * s;
                    const nc = c + dc * s;
                    if (isValid(nr, nc) && board[nr * gridSize + nc] === currentPlayer) {
                        count++;
                    } else {
                        break;
                    }
                }
                if (count === winLength) return currentPlayer;
            }
        }
    }

    if (board.every(cell => cell !== '')) return 'Draw';
    return null;
}


wss.on('connection', ws => {
    console.log('Client connected');
    ws.gameCode = null;

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);
            console.log('received: %s', message);

            switch (data.type) {
                case 'host':
                    {
                        const code = generateGameCode();
                        ws.gameCode = code;
                        const settings = data.settings || {};
                        const gridSize = settings.gridSize || 3;
                        games[code] = {
                            players: [ws],
                            gameState: Array(gridSize * gridSize).fill(""),
                            currentPlayer: 'X',
                            gameMode: settings.gameMode || 'classic',
                            gridSize: gridSize,
                            winLength: settings.winLength || 3,
                            gameActive: true,
                        };
                        ws.send(JSON.stringify({ type: 'game_created', code: code, player: 'X' }));
                        console.log(`Game ${code} created by a player.`);
                        break;
                    }
                case 'join':
                    {
                        const code = data.code.toUpperCase();
                        if (games[code] && games[code].players.length === 1) {
                            ws.gameCode = code;
                            games[code].players.push(ws);
                            console.log(`Player joined game ${code}`);

                            const [player1, player2] = games[code].players;
                            
                            player2.send(JSON.stringify({ type: 'game_joined', code: code, player: 'O', state: games[code] }));
                            player1.send(JSON.stringify({ type: 'opponent_joined', code: code, state: games[code] }));

                        } else {
                            ws.send(JSON.stringify({ type: 'error', message: 'Game not found or is full.' }));
                        }
                        break;
                    }
                case 'move':
                    {
                        const code = ws.gameCode;
                        const game = games[code];
                        if (!game || !game.gameActive) return;

                        const playerIndex = game.players.indexOf(ws);
                        const playerSymbol = playerIndex === 0 ? 'X' : 'O';

                        if (game.currentPlayer !== playerSymbol) return;

                        const { index } = data;
                        if (game.gameState[index] === "") {
                            game.gameState[index] = playerSymbol;
                            
                            const winResult = checkWin(game);
                            if (winResult) {
                                game.gameActive = false;
                                game.winner = winResult;
                            } else {
                                game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
                            }

                            game.players.forEach(playerWs => {
                                if (playerWs.readyState === WebSocket.OPEN) {
                                    playerWs.send(JSON.stringify({ type: 'update_state', state: game }));
                                }
                            });
                        }
                        break;
                    }
                case 'chat':
                    {
                        const code = ws.gameCode;
                        const game = games[code];
                        if (!game) return;

                        const playerIndex = game.players.indexOf(ws);
                        const playerSymbol = playerIndex === 0 ? 'X' : 'O';

                        const message = {
                            type: 'chat_message',
                            sender: `Player ${playerSymbol}`,
                            text: data.text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };

                        game.players.forEach(playerWs => {
                            if (playerWs.readyState === WebSocket.OPEN) {
                                playerWs.send(JSON.stringify(message));
                            }
                        });
                        break;
                    }
            }
        } catch (e) {
            console.error('Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const code = ws.gameCode;
        if (code && games[code]) {
            games[code].players = games[code].players.filter(p => p !== ws);
            if (games[code].players.length === 0) {
                delete games[code];
                console.log(`Game ${code} deleted.`);
            } else {
                games[code].players[0].send(JSON.stringify({ type: 'opponent_left' }));
            }
        }
    });
});

console.log('Tic-Tac-Toe WebSocket server started on ws://localhost:8080');