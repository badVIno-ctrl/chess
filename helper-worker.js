
const WHITE = 'w';
const BLACK = 'b';
const PIECE_VALUES = {p:100,n:320,b:330,r:500,q:900,k:20000};
const CHECKMATE_SCORE = 100000;
const QUIESCENCE_CAP_DEPTH = 10;
const SEARCH_LIMITS = { easy: 0, medium: 340, hard: 9000 };
const HARD_MAX_DEPTH = 10;
const TT_EXACT = 0;
const TT_LOWER = 1;
const TT_UPPER = 2;
const PST = {
  p: [
      0,   0,   0,   0,   0,   0,   0,   0,
     40,  50,  50, -10, -10,  50,  50,  40,
     18,  18,  22,  36,  36,  22,  18,  18,
      8,  10,  14,  30,  30,  14,  10,   8,
      0,   6,  10,  24,  24,  10,   6,   0,
      4,   2,   8,  10,  10,   8,   2,   4,
      6,  10,  10, -20, -20,  10,  10,   6,
      0,   0,   0,   0,   0,   0,   0,   0
  ],
  n: [
    -70, -40, -24, -18, -18, -24, -40, -70,
    -36, -12,   4,   8,   8,   4, -12, -36,
    -18,   8,  24,  28,  28,  24,   8, -18,
    -10,  14,  30,  36,  36,  30,  14, -10,
    -10,  12,  28,  36,  36,  28,  12, -10,
    -16,   6,  20,  24,  24,  20,   6, -16,
    -28, -10,   2,   8,   8,   2, -10, -28,
    -56, -36, -18, -12, -12, -18, -36, -56
  ],
  b: [
    -24, -12,  -8,  -6,  -6,  -8, -12, -24,
    -10,   8,   2,   8,   8,   2,   8, -10,
     -8,   8,  16,  18,  18,  16,   8,  -8,
     -6,  10,  18,  24,  24,  18,  10,  -6,
     -4,  12,  18,  24,  24,  18,  12,  -4,
     -4,  10,  14,  16,  16,  14,  10,  -4,
     -8,   6,   4,   8,   8,   4,   6,  -8,
    -16,  -8,  -8,  -6,  -6,  -8,  -8, -16
  ],
  r: [
     10,  16,  16,  18,  18,  16,  16,  10,
      6,   8,  10,  12,  12,  10,   8,   6,
     -4,   0,   4,   8,   8,   4,   0,  -4,
     -8,  -4,   0,   6,   6,   0,  -4,  -8,
    -10,  -6,  -2,   4,   4,  -2,  -6, -10,
    -10,  -6,  -2,   4,   4,  -2,  -6, -10,
     -6,  -2,   2,   6,   6,   2,  -2,  -6,
      0,   4,  10,  14,  14,  10,   4,   0
  ],
  q: [
    -14, -10,  -8,  -4,  -4,  -8, -10, -14,
     -8,   0,   4,   6,   6,   4,   0,  -8,
     -8,   2,   8,  10,  10,   8,   2,  -8,
     -4,   4,  10,  14,  14,  10,   4,  -4,
      0,   4,  10,  14,  14,  10,   4,   0,
     -6,   2,   8,  10,  10,   8,   2,  -6,
     -8,  -2,   2,   2,   2,   2,  -2,  -8,
    -14, -10,  -8,  -6,  -6,  -8, -10, -14
  ],
  k: [
    -60, -50, -50, -50, -50, -50, -50, -60,
    -42, -38, -38, -40, -40, -38, -38, -42,
    -28, -30, -34, -40, -40, -34, -30, -28,
    -18, -26, -30, -38, -38, -30, -26, -18,
    -12, -18, -24, -30, -30, -24, -18, -12,
     -6, -10, -16, -22, -22, -16, -10,  -6,
     12,  18,   4,  -8,  -8,   4,  18,  12,
     18,  28,  12,  -4,  -4,  12,  28,  18
  ],
  kEnd: [
    -28, -12,  -4,   0,   0,  -4, -12, -28,
    -12,   6,  16,  20,  20,  16,   6, -12,
     -4,  16,  26,  32,  32,  26,  16,  -4,
      0,  20,  32,  38,  38,  32,  20,   0,
      0,  20,  32,  38,  38,  32,  20,   0,
     -4,  16,  26,  32,  32,  26,  16,  -4,
    -12,   6,  16,  20,  20,  16,   6, -12,
    -28, -12,  -4,   0,   0,  -4, -12, -28
  ]
};

class ChessEngine {
  constructor() {
    this.board = Array.from({length:8}, () => Array(8).fill(null));
    this.turn = WHITE;
    this.castlingRights = { w:{k:true,q:true}, b:{k:true,q:true} };
    this.enPassantTarget = null;
    this.moveHistory = [];
    this.capturedByWhite = [];
    this.capturedByBlack = [];
  }

  cloneBoard() {
    return this.board.map(row => row.map(cell => cell ? {...cell} : null));
  }

  loadState(state) {
    this.board = state.board.map(row => row.map(cell => cell ? {...cell} : null));
    this.turn = state.turn;
    this.castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
    this.enPassantTarget = state.enPassantTarget ? {...state.enPassantTarget} : null;
    this.moveHistory = (state.moveHistory || []).map(move => ({...move}));
    this.capturedByWhite = (state.capturedByWhite || []).map(piece => ({...piece}));
    this.capturedByBlack = (state.capturedByBlack || []).map(piece => ({...piece}));
  }

  getPiece(r,c) { return (r>=0&&r<8&&c>=0&&c<8) ? this.board[r][c] : null; }

  getLegalMoves(r,c) {
    const piece = this.getPiece(r,c);
    if(!piece || piece.color!==this.turn) return [];
    const pseudo = this.getPseudoMoves(r,c,piece);
    return pseudo.filter(move => !this.wouldBeInCheck(r,c,move.r,move.c,move));
  }

  getAllLegalMoves(color) {
    const moves = [];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const piece = this.getPiece(r,c);
      if(!piece || piece.color!==color) continue;
      const save = this.turn;
      this.turn = color;
      const legal = this.getLegalMoves(r,c);
      this.turn = save;
      legal.forEach(to => moves.push({from:{r,c},to}));
    }
    return moves;
  }

  getPseudoMoves(r,c,piece,attackOnly=false) {
    const moves = [];
    const opp = piece.color===WHITE ? BLACK : WHITE;
    const add = (nr,nc,extra={}) => {
      if(nr>=0&&nr<8&&nc>=0&&nc<8) moves.push({r:nr,c:nc,...extra});
    };
    const slide = (dr,dc) => {
      let nr = r + dr;
      let nc = c + dc;
      while(nr>=0&&nr<8&&nc>=0&&nc<8) {
        const target = this.getPiece(nr,nc);
        if(target) {
          if(target.color===opp) add(nr,nc,{capture:true});
          break;
        }
        add(nr,nc);
        nr += dr;
        nc += dc;
      }
    };

    switch(piece.type) {
      case 'p': {
        const dir = piece.color===WHITE ? -1 : 1;
        const startRow = piece.color===WHITE ? 6 : 1;
        if(!attackOnly) {
          if(!this.getPiece(r+dir,c)) {
            add(r+dir,c);
            if(r===startRow && !this.getPiece(r+2*dir,c)) add(r+2*dir,c,{doublePush:true});
          }
        }
        [-1,1].forEach(dc => {
          const tr = r + dir;
          const tc = c + dc;
          const target = this.getPiece(tr,tc);
          if(attackOnly) {
            add(tr,tc,{capture:!!target});
            return;
          }
          if(target && target.color===opp) add(tr,tc,{capture:true});
          if(this.enPassantTarget && this.enPassantTarget.r===r+dir && this.enPassantTarget.c===c+dc) {
            add(r+dir,c+dc,{enPassant:true});
          }
        });
        break;
      }
      case 'r': slide(-1,0); slide(1,0); slide(0,-1); slide(0,1); break;
      case 'b': slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1); break;
      case 'q':
        slide(-1,0); slide(1,0); slide(0,-1); slide(0,1);
        slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1);
        break;
      case 'n':
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => {
          const target = this.getPiece(r+dr,c+dc);
          if(!target || target.color===opp) add(r+dr,c+dc,{capture:!!target});
        });
        break;
      case 'k': {
        [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
          const target = this.getPiece(r+dr,c+dc);
          if(!target || target.color===opp) add(r+dr,c+dc,{capture:!!target});
        });
        const row = piece.color===WHITE ? 7 : 0;
        if(!attackOnly && r===row && c===4 && this.castlingRights[piece.color]) {
          const rights = this.castlingRights[piece.color];
          if(rights.k && !this.getPiece(row,5) && !this.getPiece(row,6)) {
            const rook = this.getPiece(row,7);
            if(rook && rook.type==='r' && rook.color===piece.color &&
              !this.isSquareAttacked(row,4,opp) && !this.isSquareAttacked(row,5,opp) && !this.isSquareAttacked(row,6,opp)) {
              add(row,6,{castle:'k'});
            }
          }
          if(rights.q && !this.getPiece(row,3) && !this.getPiece(row,2) && !this.getPiece(row,1)) {
            const rook = this.getPiece(row,0);
            if(rook && rook.type==='r' && rook.color===piece.color &&
              !this.isSquareAttacked(row,4,opp) && !this.isSquareAttacked(row,3,opp) && !this.isSquareAttacked(row,2,opp)) {
              add(row,2,{castle:'q'});
            }
          }
        }
        break;
      }
    }
    return moves;
  }

  isSquareAttacked(r,c,byColor) {
    for(let fr=0;fr<8;fr++) for(let fc=0;fc<8;fc++) {
      const piece = this.getPiece(fr,fc);
      if(!piece || piece.color!==byColor) continue;
      const pseudo = this.getPseudoMoves(fr,fc,piece,true);
      if(pseudo.some(move => move.r===r && move.c===c)) return true;
    }
    return false;
  }

  isInCheck(color) {
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const piece = this.getPiece(r,c);
      if(piece && piece.type==='k' && piece.color===color) {
        return this.isSquareAttacked(r,c,color===WHITE ? BLACK : WHITE);
      }
    }
    return false;
  }

  wouldBeInCheck(fr,fc,tr,tc,move) {
    const saveBoard = this.cloneBoard();
    const saveEP = this.enPassantTarget ? {...this.enPassantTarget} : null;
    const saveCR = JSON.parse(JSON.stringify(this.castlingRights));
    const movingColor = this.board[fr][fc] ? this.board[fr][fc].color : null;
    if(!movingColor) return false;
    this.applyMoveInternal(fr,fc,tr,tc,move,'q');
    const check = this.isInCheck(movingColor);
    this.board = saveBoard;
    this.enPassantTarget = saveEP;
    this.castlingRights = saveCR;
    return check;
  }

  applyMoveInternal(fr,fc,tr,tc,move,promoType='q') {
    const piece = this.board[fr][fc];
    if(!piece) return null;
    const captured = this.board[tr][tc];
    this.board[tr][tc] = piece;
    this.board[fr][fc] = null;

    if(move && move.enPassant) {
      const capRow = piece.color===WHITE ? tr+1 : tr-1;
      this.board[capRow][tc] = null;
    }

    if(move && move.castle) {
      const row = fr;
      if(move.castle==='k') {
        this.board[row][5] = this.board[row][7];
        this.board[row][7] = null;
      } else {
        this.board[row][3] = this.board[row][0];
        this.board[row][0] = null;
      }
    }

    if(piece.type==='p' && (tr===0 || tr===7)) {
      this.board[tr][tc] = { type: promoType || 'q', color: piece.color };
    }

    this.enPassantTarget = (move && move.doublePush) ? {r:(fr+tr)/2,c:fc} : null;
    if(piece.type==='k') this.castlingRights[piece.color] = {k:false,q:false};
    if(piece.type==='r') {
      if(fc===0) this.castlingRights[piece.color].q = false;
      if(fc===7) this.castlingRights[piece.color].k = false;
    }
    return captured;
  }

  makeMove(fr,fc,tr,tc,move,promoType='q') {
    const piece = this.board[fr][fc];
    if(!piece) return false;
    const saveBoard = this.cloneBoard();
    const saveEP = this.enPassantTarget ? {...this.enPassantTarget} : null;
    const saveCR = JSON.parse(JSON.stringify(this.castlingRights));
    const saveTurn = this.turn;
    let captured = null;
    if(move && move.enPassant) {
      const capRow = piece.color===WHITE ? tr+1 : tr-1;
      captured = this.board[capRow][tc];
    } else {
      captured = this.board[tr][tc];
    }
    this.applyMoveInternal(fr,fc,tr,tc,move,promoType);
    this.moveHistory.push({
      board: saveBoard,
      ep: saveEP,
      cr: saveCR,
      turn: saveTurn,
      from:{r:fr,c:fc},
      to:{r:tr,c:tc},
      move,
      captured,
      capturedByWhite:[...this.capturedByWhite],
      capturedByBlack:[...this.capturedByBlack]
    });
    if(captured) {
      if(piece.color===WHITE) this.capturedByWhite.push(captured);
      else this.capturedByBlack.push(captured);
    }
    this.turn = this.turn===WHITE ? BLACK : WHITE;
    return true;
  }

  undoMove() {
    if(!this.moveHistory.length) return false;
    const h = this.moveHistory.pop();
    this.board = h.board;
    this.enPassantTarget = h.ep;
    this.castlingRights = h.cr;
    this.turn = h.turn;
    this.capturedByWhite = h.capturedByWhite;
    this.capturedByBlack = h.capturedByBlack;
    return h;
  }

  isCheckmate(color) {
    return this.isInCheck(color) && this.getAllLegalMoves(color).length===0;
  }

  isStalemate(color) {
    return !this.isInCheck(color) && this.getAllLegalMoves(color).length===0;
  }

  isInsufficientMaterial() {
    const pieces = [];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const piece = this.getPiece(r,c);
      if(piece) pieces.push(piece);
    }
    if(pieces.length===2) return true;
    if(pieces.length===3 && pieces.some(piece => piece.type==='n' || piece.type==='b')) return true;
    return false;
  }
}

function getPositionKey(engine) {
  const ep = engine.enPassantTarget ? `${engine.enPassantTarget.r}${engine.enPassantTarget.c}` : '-';
  const crw = engine.castlingRights.w || {k:false,q:false};
  const crb = engine.castlingRights.b || {k:false,q:false};
  const cr = `${crw.k?'K':''}${crw.q?'Q':''}${crb.k?'k':''}${crb.q?'q':''}` || '-';
  return `${serializeBoard(engine.board)} ${engine.turn} ${cr} ${ep}`;
}

function serializeBoard(board) {
  return board.map(row => {
    let empty = 0;
    let out = '';
    row.forEach(cell => {
      if(!cell) empty++;
      else {
        if(empty) { out += empty; empty = 0; }
        out += cell.color===WHITE ? cell.type.toUpperCase() : cell.type;
      }
    });
    if(empty) out += empty;
    return out;
  }).join('/');
}

function getCapturePiece(engine, move) {
  if(move.to.enPassant) {
    const mover = engine.getPiece(move.from.r, move.from.c);
    if(!mover) return null;
    const capRow = mover.color===WHITE ? move.to.r+1 : move.to.r-1;
    return engine.getPiece(capRow, move.to.c);
  }
  return engine.getPiece(move.to.r, move.to.c);
}

function toTableIndex(r, c, color) {
  const row = color===WHITE ? r : 7-r;
  return row * 8 + c;
}

function getGamePhase(engine) {
  let phase = 0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r,c);
    if(!piece) continue;
    if(piece.type==='q') phase += 4;
    else if(piece.type==='r') phase += 2;
    else if(piece.type==='b' || piece.type==='n') phase += 1;
  }
  return Math.min(24, phase);
}

function evaluatePawnStructure(engine, color) {
  let score = 0;
  const pawnsByFile = Array.from({length:8}, () => []);
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r,c);
    if(piece && piece.color===color && piece.type==='p') pawnsByFile[c].push(r);
  }

  for(let file=0; file<8; file++) {
    const filePawns = pawnsByFile[file];
    if(filePawns.length > 1) score -= 14 * (filePawns.length - 1);

    for(const row of filePawns) {
      const hasLeftSupport = file>0 && pawnsByFile[file-1].length > 0;
      const hasRightSupport = file<7 && pawnsByFile[file+1].length > 0;
      if(!hasLeftSupport && !hasRightSupport) score -= 12;

      let passed = true;
      const enemyStart = color===WHITE ? 0 : row + 1;
      const enemyEnd = color===WHITE ? row - 1 : 7;
      for(let enemyFile=Math.max(0, file-1); enemyFile<=Math.min(7, file+1) && passed; enemyFile++) {
        for(let enemyRow=0; enemyRow<8; enemyRow++) {
          const enemy = engine.getPiece(enemyRow, enemyFile);
          if(!enemy || enemy.type!=='p' || enemy.color===color) continue;
          if(color===WHITE && enemyRow < row) { passed = false; break; }
          if(color===BLACK && enemyRow > row) { passed = false; break; }
        }
      }
      if(passed) {
        const advance = color===WHITE ? (6-row) : (row-1);
        score += 16 + advance * 10;
      }
    }
  }
  return score;
}

function evaluateKingShelter(engine, color) {
  let kingPos = null;
  for(let r=0;r<8 && !kingPos;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r,c);
    if(piece && piece.type==='k' && piece.color===color) {
      kingPos = {r,c};
      break;
    }
  }
  if(!kingPos) return 0;

  let score = 0;
  const dir = color===WHITE ? -1 : 1;
  for(let dc=-1; dc<=1; dc++) {
    const file = kingPos.c + dc;
    if(file < 0 || file > 7) continue;
    const frontRow = kingPos.r - dir;
    const nearPawn = engine.getPiece(frontRow, file);
    if(nearPawn && nearPawn.type==='p' && nearPawn.color===color) score += 10;
    else score -= 10;
  }
  if(kingPos.c===6 || kingPos.c===2) score += 18;
  return score;
}

function evaluatePiecePressure(engine, color) {
  let penalty = 0;
  const enemy = color===WHITE ? BLACK : WHITE;

  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r,c);
    if(!piece || piece.color!==color || piece.type==='k') continue;
    const attacked = engine.isSquareAttacked(r, c, enemy);
    if(!attacked) continue;

    const defended = engine.isSquareAttacked(r, c, color);
    const value = PIECE_VALUES[piece.type] || 0;
    if(!defended) penalty += Math.round(value * 0.22);
    else penalty += Math.round(value * 0.08);
  }

  return penalty;
}

function evaluateBoard(engine) {
  let score = 0;
  let whiteBishops = 0;
  let blackBishops = 0;
  let whiteMaterial = 0;
  let blackMaterial = 0;
  const phase = getGamePhase(engine);

  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r,c);
    if(!piece) continue;

    const sign = piece.color===WHITE ? 1 : -1;
    const base = PIECE_VALUES[piece.type] || 0;
    score += sign * base;

    if(piece.color===WHITE) whiteMaterial += base;
    else blackMaterial += base;

    const pst = piece.type==='k'
      ? Math.round((PST.k[toTableIndex(r,c,piece.color)] * phase + PST.kEnd[toTableIndex(r,c,piece.color)] * (24-phase)) / 24)
      : PST[piece.type][toTableIndex(r,c,piece.color)];
    score += sign * pst;

    if(piece.type==='b') piece.color===WHITE ? whiteBishops++ : blackBishops++;

    if(piece.type==='r') {
      let ownPawnOnFile = false;
      let enemyPawnOnFile = false;
      for(let rr=0; rr<8; rr++) {
        const onFile = engine.getPiece(rr, c);
        if(!onFile || onFile.type!=='p') continue;
        if(onFile.color===piece.color) ownPawnOnFile = true;
        else enemyPawnOnFile = true;
      }
      if(!ownPawnOnFile && !enemyPawnOnFile) score += sign * 20;
      else if(!ownPawnOnFile) score += sign * 10;
    }
  }

  if(whiteBishops >= 2) score += 34;
  if(blackBishops >= 2) score -= 34;

  score += evaluatePawnStructure(engine, WHITE);
  score -= evaluatePawnStructure(engine, BLACK);
  score += evaluateKingShelter(engine, WHITE);
  score -= evaluateKingShelter(engine, BLACK);
  score -= evaluatePiecePressure(engine, WHITE);
  score += evaluatePiecePressure(engine, BLACK);

  const endgameFactor = whiteMaterial + blackMaterial < 2600 ? 1 : 0;
  if(endgameFactor) {
    score += (whiteMaterial - blackMaterial) * 0.02;
  }

  return score;
}

function evaluateFromPerspective(engine, side) {
  const score = evaluateBoard(engine);
  return side===WHITE ? score : -score;
}

function moveKey(move) {
  const flags = `${move.to.castle || ''}${move.to.enPassant ? 'e' : ''}${move.to.doublePush ? 'd' : ''}${move.to.capture ? 'c' : ''}`;
  return `${move.from.r}${move.from.c}${move.to.r}${move.to.c}${flags}`;
}

function scoreMove(engine, move, ctx=null, ply=0, ttMoveKey='') {
  const mover = engine.getPiece(move.from.r, move.from.c);
  if(!mover) return -999999;
  const key = moveKey(move);
  if(ttMoveKey && key===ttMoveKey) return 1_000_000;
  let score = 0;
  const captured = getCapturePiece(engine, move);
  if(captured) score += 20_000 + (PIECE_VALUES[captured.type] || 0) * 20 - (PIECE_VALUES[mover.type] || 0);
  if(move.to.castle) score += 260;
  if(mover.type==='p' && (move.to.r===0 || move.to.r===7)) score += 12_000;
  if(ctx && !captured) {
    const killers = ctx.killers[ply] || [];
    if(killers[0]===key) score += 9_000;
    else if(killers[1]===key) score += 8_500;
    score += ctx.history[key] || 0;
  }
  score += PST[mover.type==='k' ? 'kEnd' : mover.type][toTableIndex(move.to.r, move.to.c, mover.color)] || 0;
  return score;
}

function orderedMoves(engine, side, ctx=null, ply=0, ttMoveKey='') {
  return engine.getAllLegalMoves(side).sort((a,b) => scoreMove(engine,b,ctx,ply,ttMoveKey) - scoreMove(engine,a,ctx,ply,ttMoveKey));
}

function registerKiller(ctx, ply, key) {
  const killers = ctx.killers[ply] || (ctx.killers[ply] = []);
  if(killers[0]===key) return;
  killers[1] = killers[0];
  killers[0] = key;
}

function tacticalBlunderPenalty(engine, side) {
  const enemy = engine.turn;
  let maxPenalty = 0;
  const enemyMoves = orderedMoves(engine, enemy).slice(0, 18);

  for(const move of enemyMoves) {
    const captured = getCapturePiece(engine, move);
    const attacker = engine.getPiece(move.from.r, move.from.c);
    if(!captured || !attacker || captured.color!==side) continue;

    const victimVal = PIECE_VALUES[captured.type] || 0;
    const attackerVal = PIECE_VALUES[attacker.type] || 0;
    let penalty = victimVal - Math.round(attackerVal * 0.35);

    if(captured.type==='q') penalty += 900;
    else if(captured.type==='r') penalty += 220;
    else if(captured.type==='b' || captured.type==='n') penalty += 120;

    if(!engine.isSquareAttacked(move.to.r, move.to.c, side)) penalty += 90;
    maxPenalty = Math.max(maxPenalty, penalty);
  }

  return maxPenalty;
}

function quiescence(engine, alpha, beta, side, ctx, ply=0) {
  if((++ctx.nodes & 255)===0 && performance.now() > ctx.deadline) {
    ctx.timeUp = true;
    return alpha;
  }
  const standPat = evaluateFromPerspective(engine, side);
  if(standPat >= beta) return beta;
  if(standPat > alpha) alpha = standPat;
  if(ply >= QUIESCENCE_CAP_DEPTH) return standPat;

  const moves = orderedMoves(engine, engine.turn, ctx, ply).filter(move => {
    const captured = getCapturePiece(engine, move);
    const mover = engine.getPiece(move.from.r, move.from.c);
    return !!captured || (mover && mover.type==='p' && (move.to.r===0 || move.to.r===7));
  });

  for(const move of moves) {
    engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
    const score = -quiescence(engine, -beta, -alpha, side, ctx, ply+1);
    engine.undoMove();
    if(ctx.timeUp) return alpha;
    if(score >= beta) return beta;
    if(score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(engine, depth, alpha, beta, side, ctx, ply=0) {
  if((++ctx.nodes & 511)===0 && performance.now() > ctx.deadline) {
    ctx.timeUp = true;
    return 0;
  }

  const alphaOrig = alpha;
  const posKey = getPositionKey(engine);
  const ttEntry = ctx.tt.get(posKey);
  let ttMoveKey = '';
  if(ttEntry) {
    ttMoveKey = ttEntry.bestMoveKey || '';
    if(ttEntry.depth >= depth) {
      if(ttEntry.flag===TT_EXACT) return ttEntry.score;
      if(ttEntry.flag===TT_LOWER) alpha = Math.max(alpha, ttEntry.score);
      else if(ttEntry.flag===TT_UPPER) beta = Math.min(beta, ttEntry.score);
      if(alpha >= beta) return ttEntry.score;
    }
  }

  if(depth<=0) return quiescence(engine, alpha, beta, side, ctx, ply);
  if(engine.isInsufficientMaterial()) return 0;

  const legalMoves = orderedMoves(engine, engine.turn, ctx, ply, ttMoveKey);
  if(!legalMoves.length) {
    if(engine.isInCheck(engine.turn)) {
      return engine.turn===side ? -CHECKMATE_SCORE + ply : CHECKMATE_SCORE - ply;
    }
    return 0;
  }

  let bestScore = -Infinity;
  let bestMoveKey = '';
  for(const move of legalMoves) {
    const key = moveKey(move);
    engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
    const extension = engine.isInCheck(engine.turn) ? 1 : 0;
    const score = -negamax(engine, depth-1+extension, -beta, -alpha, side, ctx, ply+1);
    engine.undoMove();
    if(ctx.timeUp) return 0;
    if(score > bestScore) {
      bestScore = score;
      bestMoveKey = key;
    }
    if(score > alpha) alpha = score;
    if(alpha >= beta) {
      if(!getCapturePiece(engine, move)) {
        registerKiller(ctx, ply, key);
        ctx.history[key] = Math.min(12000, (ctx.history[key] || 0) + depth * depth * 18);
      }
      break;
    }
  }

  let flag = TT_EXACT;
  if(bestScore <= alphaOrig) flag = TT_UPPER;
  else if(bestScore >= beta) flag = TT_LOWER;
  ctx.tt.set(posKey, { depth, score: bestScore, flag, bestMoveKey });
  return bestScore;
}

function pickEasyMove(engine, side) {
  const legal = orderedMoves(engine, side);
  if(!legal.length) return null;
  const scored = legal.map(move => {
    engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
    const score = evaluateFromPerspective(engine, side);
    engine.undoMove();
    return { move, score };
  }).sort((a,b) => a.score - b.score);
  const pool = scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.5)));
  return pool[Math.floor(Math.random() * pool.length)]?.move || scored[0]?.move || legal[0] || null;
}

function pickMediumMove(engine, side) {
  const legal = orderedMoves(engine, side);
  const scored = [];
  for(const move of legal) {
    engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
    const ctx = {
      deadline: performance.now() + SEARCH_LIMITS.medium,
      tt: new Map(),
      killers: [],
      history: Object.create(null),
      nodes: 0,
      timeUp: false
    };
    const reply = negamax(engine, 3, -Infinity, Infinity, side, ctx, 1);
    engine.undoMove();
    scored.push({ move, score: -reply });
  }
  scored.sort((a,b) => b.score - a.score);
  const pool = scored.slice(0, Math.min(3, scored.length));
  return pool[Math.floor(Math.random() * pool.length)].move;
}

function pickHardMove(engine, side) {
  const openingMove = getOpeningMove(engine, side);
  if(openingMove) return openingMove;

  const rootMoves = orderedMoves(engine, side);
  if(!rootMoves.length) return null;
  let bestMove = rootMoves[0];
  let bestScore = -Infinity;
  const ctx = {
    deadline: performance.now() + SEARCH_LIMITS.hard,
    tt: new Map(),
    killers: [],
    history: Object.create(null),
    nodes: 0,
    timeUp: false
  };

  for(let depth=2; depth<=HARD_MAX_DEPTH; depth++) {
    rootMoves.sort((a,b) => {
      if(moveKey(a)===moveKey(bestMove)) return -1;
      if(moveKey(b)===moveKey(bestMove)) return 1;
      return scoreMove(engine,b,ctx,0) - scoreMove(engine,a,ctx,0);
    });
    let localBest = bestMove;
    let localScore = bestScore;
    for(const move of rootMoves) {
      engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
      let result = -negamax(engine, depth-1, -Infinity, Infinity, side, ctx, 1);
      if(!ctx.timeUp) {
        result -= tacticalBlunderPenalty(engine, side);
      }
      engine.undoMove();
      if(ctx.timeUp) return bestMove;
      if(result > localScore || !localBest) {
        localScore = result;
        localBest = move;
      }
      if(performance.now() > ctx.deadline) {
        ctx.timeUp = true;
        return bestMove;
      }
    }
    bestMove = localBest;
    bestScore = localScore;
  }
  return bestMove;
}

function getOpeningMove(engine, side) {
  const history = engine.moveHistory || [];
  if(side!==BLACK) return null;
  const book = {
    '': ['1434','1232','1636','1545','1333'],
    '6444': ['1434','1232','1545'],
    '6343': ['1232','1434','1545'],
    '6242': ['1232','1434'],
    '6646': ['1434','1232'],
    '6141': ['1232','1434'],
    '7152': ['1232','1434'],
    '7655': ['1232','1434'],
    '7354': ['1232','1434'],
    '6444|7655': ['0625','0122','1434'],
    '6444|7152': ['0625','1545'],
    '6444|6343': ['1232','0625'],
    '6444|6343|7655': ['0625'],
    '6444|7655|7554': ['0122','0614'],
    '6444|7655|7354': ['0625','0122'],
    '6444|7354': ['0122','0625'],
    '6343|7655': ['0625','1434'],
    '6343|7152': ['1636','0625'],
    '6343|6244': ['1232','0625'],
    '6343|6244|7152': ['0625'],
    '6242|7152': ['1232','0625'],
    '6242|7655': ['1232','0625']
  };
  const sequence = history.map(move => `${move.from.r}${move.from.c}${move.to.r}${move.to.c}`).join('|');
  const candidates = book[sequence];
  if(!candidates) return null;
  const legal = engine.getAllLegalMoves(side);
  for(const encoded of candidates) {
    const [fr,fc,tr,tc] = encoded.split('').map(Number);
    const found = legal.find(move =>
      move.from.r===fr && move.from.c===fc && move.to.r===tr && move.to.c===tc
    );
    if(found) return found;
  }
  return null;
}

function getBestMove(state, difficulty) {
  const engine = new ChessEngine();
  engine.loadState(state);
  const side = state.turn;
  if(difficulty==='easy') return pickEasyMove(engine, side);
  if(difficulty==='medium') return pickMediumMove(engine, side);
  return pickHardMove(engine, side);
}

function algebraicSquare(r,c) {
  return `${'abcdefgh'[c]}${'87654321'[r]}`;
}

function findLegalMoveByCode(engine, side, code) {
  const legal = engine.getAllLegalMoves(side);
  const [fr, fc, tr, tc] = code.split('').map(Number);
  return legal.find(move =>
    move.from.r===fr && move.from.c===fc && move.to.r===tr && move.to.c===tc
  ) || null;
}

function getTutorialScriptMove(engine, side) {
  if(side!==WHITE) return null;
  const sequence = (engine.moveHistory || []).map(move =>
    `${move.from.r}${move.from.c}${move.to.r}${move.to.c}`
  ).join('|');

  const script = {
    '': ['6444', '6343'],
    '1434': ['7655', '7152'],
    '1232': ['7655', '7152'],
    '1545': ['7655', '7152'],
    '1333': ['7655', '7152'],
    '1434|7655': ['7542', '7645'],
    '1434|7152': ['7542', '6443'],
    '1232|7655': ['7645', '6244'],
    '1232|7152': ['7645', '6244'],
    '1434|7655|0625': ['7476'],
    '1434|7152|0625': ['7476'],
    '1232|7655|0625': ['7476'],
    '1232|7152|1636': ['7476']
  };

  const candidates = script[sequence] || [];
  for(const code of candidates) {
    const found = findLegalMoveByCode(engine, side, code);
    if(found) return found;
  }
  return null;
}

function getPieceName(type) {
  return {
    p:'пешкой',
    n:'конём',
    b:'слоном',
    r:'ладьёй',
    q:'ферзём',
    k:'королём'
  }[type] || 'фигурой';
}

function buildTutorialHint(state) {
  const engine = new ChessEngine();
  engine.loadState(state);
  const side = state.turn;
  const bestMove = getTutorialScriptMove(engine, side) || pickEasyMove(engine, side);
  if(!bestMove) return { text:'Сейчас хороших ходов нет: нужно просто выйти из трудной позиции и не подставить короля.' };
  const piece = engine.getPiece(bestMove.from.r, bestMove.from.c);
  const target = engine.getPiece(bestMove.to.r, bestMove.to.c);
  const from = algebraicSquare(bestMove.from.r, bestMove.from.c);
  const to = algebraicSquare(bestMove.to.r, bestMove.to.c);

  let text = `Попробуйте сходить ${getPieceName(piece.type)} с ${from} на ${to}.`;
  if(bestMove.to.castle) {
    text = 'Сейчас лучший момент для рокировки: спрячьте короля и соедините ладьи. Для новичка это один из самых полезных навыков.';
  } else if(piece.type==='p' && (bestMove.to.c===3 || bestMove.to.c===4)) {
    text += ' Это помогает занять центр доски. Кто контролирует центр, тот обычно раньше развивает атаку.';
  } else if(piece.type==='n') {
    text += ' Конь выходит в игру и начинает контролировать важные центральные клетки. Для дебюта это почти всегда полезно.';
  } else if(piece.type==='b') {
    text += ' Так слон открывается и начинает давить по диагонали. Хорошо развитые лёгкие фигуры делают позицию устойчивой.';
  } else if(target) {
    text += ' Это безопасный размен: вы выигрываете материал и упрощаете позицию без лишнего риска.';
  } else {
    text += ' Это спокойный и понятный развивающий ход, который улучшает вашу позицию шаг за шагом.';
  }

  return {
    move: bestMove,
    text,
    intro: getTutorialIntro(engine)
  };
}

function getTutorialIntro(engine) {
  return [
    { piece:'king', squares:[{r:7,c:4},{r:0,c:4}], text:'Это короли. Главная задача в шахматах: защитить своего короля и однажды поставить мат королю соперника.' },
    { piece:'queen', squares:[{r:7,c:3},{r:0,c:3}], text:'Это ферзи. Они очень сильные, но в дебюте их лучше не выводить слишком рано, чтобы не потерять темп.' },
    { piece:'knight', squares:[{r:7,c:1},{r:7,c:6},{r:0,c:1},{r:0,c:6}], text:'Это кони. Для новичка это одни из самых важных фигур в начале партии: они быстро выходят в бой и прыгают через другие фигуры.' },
    { piece:'bishop', squares:[{r:7,c:2},{r:7,c:5},{r:0,c:2},{r:0,c:5}], text:'Это слоны. Они ходят по диагоналям и становятся сильнее, когда пешки и кони помогают им открыть линии.' },
    { piece:'pawn', squares:Array.from({length:8}, (_,i) => ({r:6,c:i})).concat(Array.from({length:8}, (_,i) => ({r:1,c:i}))), text:'Пешки двигаются вперёд, бьют по диагонали и помогают занимать центр. Обычно первые хорошие ходы в партии начинаются именно с пешек.' }
  ];
}

self.onmessage = event => {
  const data = event.data || {};
  if(data.type!=='HELPER_REQUEST') return;

  let payload = null;
  try {
    if(data.action==='bestMove') {
      payload = { move: getBestMove(data.state, data.difficulty || 'medium') };
    } else if(data.action==='tutorialHint') {
      payload = buildTutorialHint(data.state);
    } else {
      payload = { error:'unknown_action' };
    }
  } catch (error) {
    payload = { error: error.message || String(error) };
  }

  self.postMessage({
    type:'HELPER_RESPONSE',
    requestId:data.requestId,
    action:data.action,
    payload
  });
};
