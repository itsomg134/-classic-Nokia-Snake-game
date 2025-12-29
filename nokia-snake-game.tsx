import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 15;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[7, 7]];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  function generateFood(currentSnake) {
    while (true) {
      const newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
      if (!currentSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1])) {
        return newFood;
      }
    }
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = [head[0] + direction.x, head[1] + direction.y];

      // Check wall collision
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, isPaused]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key.startsWith('Arrow')) {
        setGameStarted(true);
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (gameStarted && !gameOver) {
          setIsPaused(p => !p);
        }
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver, isPaused]);

  const handleDirectionClick = (newDir) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (isPaused || gameOver) return;

    if (newDir === 'up' && direction.y === 0) setDirection({ x: 0, y: -1 });
    if (newDir === 'down' && direction.y === 0) setDirection({ x: 0, y: 1 });
    if (newDir === 'left' && direction.x === 0) setDirection({ x: -1, y: 0 });
    if (newDir === 'right' && direction.x === 0) setDirection({ x: 1, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 p-4">
      <div className="bg-amber-100 rounded-3xl p-8 shadow-2xl" style={{ width: '400px' }}>
        {/* Nokia Screen */}
        <div className="bg-[#9ca777] rounded-lg p-4 mb-6 border-4 border-gray-800">
          <div className="text-right mb-2 font-mono text-sm">Score: {score}</div>
          <div 
            className="bg-[#c7d39c] relative mx-auto border-2 border-gray-700"
            style={{ 
              width: GRID_SIZE * CELL_SIZE, 
              height: GRID_SIZE * CELL_SIZE 
            }}
          >
            {/* Snake */}
            {snake.map((segment, i) => (
              <div
                key={i}
                className="absolute bg-black"
                style={{
                  left: segment[0] * CELL_SIZE,
                  top: segment[1] * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            ))}
            
            {/* Food */}
            <div
              className="absolute bg-black rounded-full"
              style={{
                left: food[0] * CELL_SIZE + 5,
                top: food[1] * CELL_SIZE + 5,
                width: CELL_SIZE - 10,
                height: CELL_SIZE - 10,
              }}
            />

            {/* Game Over / Start Message */}
            {(gameOver || !gameStarted || isPaused) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#c7d39c] bg-opacity-90">
                <div className="text-center font-mono">
                  {gameOver && <div className="text-xl font-bold mb-2">Game Over!</div>}
                  {isPaused && <div className="text-xl font-bold mb-2">Paused</div>}
                  {!gameStarted && <div className="text-sm mb-2">Press Arrow Key<br/>to Start</div>}
                  {gameOver && (
                    <button
                      onClick={resetGame}
                      className="mt-2 px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Play Again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nokia Controls */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleDirectionClick('up')}
            className="w-16 h-16 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 active:bg-gray-900 font-bold text-xl"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleDirectionClick('left')}
              className="w-16 h-16 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 active:bg-gray-900 font-bold text-xl"
            >
              ◀
            </button>
            <button
              onClick={() => setIsPaused(p => !p)}
              className="w-16 h-16 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-500 active:bg-gray-700 font-bold text-xs"
            >
              {isPaused ? '▶' : '❚❚'}
            </button>
            <button
              onClick={() => handleDirectionClick('right')}
              className="w-16 h-16 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 active:bg-gray-900 font-bold text-xl"
            >
              ▶
            </button>
          </div>
          <button
            onClick={() => handleDirectionClick('down')}
            className="w-16 h-16 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 active:bg-gray-900 font-bold text-xl"
          >
            ▼
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          Use arrow keys or buttons • Space to pause
        </div>
      </div>
    </div>
  );
}