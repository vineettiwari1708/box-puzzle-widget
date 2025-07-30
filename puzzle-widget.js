document.addEventListener("DOMContentLoaded", () => {
  const PUZZLE_SIZE = 300;
  const GRID_DIM = 3;
  const TILE_SIZE = PUZZLE_SIZE / GRID_DIM;

  // Sample house image (replace with your own)
  const houseImgSrc = "https://i.imgur.com/5q0LYpH.png";

  // Create floating button
  const btn = document.createElement("button");
  btn.id = "open-puzzle-widget";
  btn.innerHTML = `<i class="bi bi-puzzle-fill"></i>`;
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "100px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "28px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    cursor: "pointer",
    zIndex: "99999",
  });
  document.body.appendChild(btn);

  // Create widget container
  const widget = document.createElement("div");
  widget.id = "puzzle-widget";
  Object.assign(widget.style, {
    position: "fixed",
    bottom: "170px",
    right: "20px",
    width: PUZZLE_SIZE + "px",
    height: PUZZLE_SIZE + 60 + "px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    display: "none",
    flexDirection: "column",
    zIndex: "99998",
    fontFamily: "Arial, sans-serif",
  });
  widget.innerHTML = `
    <div style="background:#007bff; color:#fff; padding:8px 12px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
      House Puzzle
      <button id="close-puzzle" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">&times;</button>
    </div>
    <canvas id="puzzle-canvas" width="${PUZZLE_SIZE}" height="${PUZZLE_SIZE}" style="background:#eee; border-radius:0 0 10px 10px; cursor:pointer;"></canvas>
  `;
  document.body.appendChild(widget);

  const closeBtn = widget.querySelector("#close-puzzle");
  const canvas = widget.querySelector("#puzzle-canvas");
  const ctx = canvas.getContext("2d");

  let tiles = [];
  let emptyPos = { x: GRID_DIM - 1, y: GRID_DIM - 1 };
  let img = new Image();
  let isAnimating = false;

  // Initialize tiles in solved order except last is empty
  function initTiles() {
    tiles = [];
    for (let y = 0; y < GRID_DIM; y++) {
      for (let x = 0; x < GRID_DIM; x++) {
        if (x === GRID_DIM - 1 && y === GRID_DIM - 1) {
          tiles.push(null);
        } else {
          tiles.push({ x, y, correctX: x, correctY: y });
        }
      }
    }
  }

  // Shuffle tiles by simulating legal moves
  function shuffleTiles(moves = 100) {
    let directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    for (let i = 0; i < moves; i++) {
      let neighbors = directions
        .map(d => ({ x: emptyPos.x + d.x, y: emptyPos.y + d.y }))
        .filter(p => p.x >= 0 && p.x < GRID_DIM && p.y >= 0 && p.y < GRID_DIM);

      let moveTo = neighbors[Math.floor(Math.random() * neighbors.length)];

      swapTiles(emptyPos, moveTo);
      emptyPos = moveTo;
    }
  }

  // Swap tiles in the array by their positions
  function swapTiles(pos1, pos2) {
    let i1 = pos1.y * GRID_DIM + pos1.x;
    let i2 = pos2.y * GRID_DIM + pos2.x;
    [tiles[i1], tiles[i2]] = [tiles[i2], tiles[i1]];
  }

  // Draw the puzzle pieces
  function draw() {
    ctx.clearRect(0, 0, PUZZLE_SIZE, PUZZLE_SIZE);

    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      if (!tile) continue; // skip empty tile

      let drawX = (i % GRID_DIM) * TILE_SIZE;
      let drawY = Math.floor(i / GRID_DIM) * TILE_SIZE;

      ctx.drawImage(
        img,
        tile.correctX * TILE_SIZE,
        tile.correctY * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        drawX,
        drawY,
        TILE_SIZE,
        TILE_SIZE
      );

      // Draw tile border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    }
  }

  // Check if puzzle solved
  function isSolved() {
    for (let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      if (!tile) continue;
      let correctIndex = tile.correctY * GRID_DIM + tile.correctX;
      if (i !== correctIndex) return false;
    }
    return true;
  }

  // Handle click to move tiles
  canvas.addEventListener("click", e => {
    if (isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = Math.floor(clickX / TILE_SIZE);
    const y = Math.floor(clickY / TILE_SIZE);

    // Check if clicked tile adjacent to empty
    if (
      (Math.abs(emptyPos.x - x) === 1 && emptyPos.y === y) ||
      (Math.abs(emptyPos.y - y) === 1 && emptyPos.x === x)
    ) {
      swapTiles(emptyPos, { x, y });
      emptyPos = { x, y };
      draw();

      if (isSolved()) {
        setTimeout(() => alert("🎉 Puzzle Solved!"), 100);
      }
    }
  });

  // Load image and start
  img.onload = () => {
    initTiles();
    shuffleTiles(200);
    draw();
  };
  img.crossOrigin = "anonymous"; // prevent CORS issues
  img.src = houseImgSrc;

  // Button toggles widget
  btn.addEventListener("click", () => {
    widget.style.display = "flex";
    btn.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    widget.style.display = "none";
    btn.style.display = "block";
  });
});
