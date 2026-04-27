
const WHITE = 'w';
const BLACK = 'b';
const BOARD_FILES = 'abcdefgh';
const BOARD_RANKS = '87654321';
const PIECE_VALUES = {p:100,n:320,b:330,r:500,q:900,k:20000};
const CHECKMATE_SCORE = 100000;
const QUIESCENCE_CAP_DEPTH = 10;
const SEARCH_LIMITS = { easy: 0, medium: 1500, hard: 9000 };
const HARD_MAX_DEPTH = 20;
const ASPIRATION_WINDOW = 45;
const MAX_CHECK_EXTENSIONS = 2;
const NMP_MIN_DEPTH = 3;
const TT_EXACT = 0;
const TT_LOWER = 1;
const TT_UPPER = 2;
const KNIGHT_DELTAS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const ORTHO_DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
const DIAG_DIRS = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ALL_DIRS = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
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
    this.halfmoveClock = 0;
    this.priorPositions = null;
  }

  cloneBoard() {
    return this.board.map(row => row.map(cell => cell ? {...cell} : null));
  }

  loadState(state) {
    this.board = state.board.map(row => row.map(cell => cell ? {...cell} : null));
    this.turn = state.turn;
    this.castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
    this.enPassantTarget = state.enPassantTarget ? {...state.enPassantTarget} : null;
    // Keep prior history (from/to) so opening book can read it; search will append its own undo records on top.
    this.moveHistory = (state.moveHistory || []).map(m => ({ from: m.from, to: m.to }));
    this.capturedByWhite = (state.capturedByWhite || []).map(piece => ({...piece}));
    this.capturedByBlack = (state.capturedByBlack || []).map(piece => ({...piece}));
    this.halfmoveClock = typeof state.halfmoveClock === 'number' ? state.halfmoveClock : 0;
    this.priorPositions = new Set(Array.isArray(state.priorPositions) ? state.priorPositions : []);
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
    const board = this.board;
    // Pawn attacks: a pawn of byColor stands one row before (r,c) in its forward direction.
    const pawnRow = byColor===WHITE ? r+1 : r-1;
    if(pawnRow>=0 && pawnRow<8) {
      if(c>0) {
        const p = board[pawnRow][c-1];
        if(p && p.color===byColor && p.type==='p') return true;
      }
      if(c<7) {
        const p = board[pawnRow][c+1];
        if(p && p.color===byColor && p.type==='p') return true;
      }
    }
    // Knight
    for(let i=0;i<8;i++) {
      const dr = KNIGHT_DELTAS[i][0], dc = KNIGHT_DELTAS[i][1];
      const nr = r+dr, nc = c+dc;
      if(nr<0||nr>7||nc<0||nc>7) continue;
      const p = board[nr][nc];
      if(p && p.color===byColor && p.type==='n') return true;
    }
    // King
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
      if(!dr && !dc) continue;
      const nr = r+dr, nc = c+dc;
      if(nr<0||nr>7||nc<0||nc>7) continue;
      const p = board[nr][nc];
      if(p && p.color===byColor && p.type==='k') return true;
    }
    // Rook/Queen orthogonal rays
    for(let i=0;i<4;i++) {
      const dr = ORTHO_DIRS[i][0], dc = ORTHO_DIRS[i][1];
      let nr = r+dr, nc = c+dc;
      while(nr>=0 && nr<8 && nc>=0 && nc<8) {
        const p = board[nr][nc];
        if(p) {
          if(p.color===byColor && (p.type==='r' || p.type==='q')) return true;
          break;
        }
        nr += dr; nc += dc;
      }
    }
    // Bishop/Queen diagonal rays
    for(let i=0;i<4;i++) {
      const dr = DIAG_DIRS[i][0], dc = DIAG_DIRS[i][1];
      let nr = r+dr, nc = c+dc;
      while(nr>=0 && nr<8 && nc>=0 && nc<8) {
        const p = board[nr][nc];
        if(p) {
          if(p.color===byColor && (p.type==='b' || p.type==='q')) return true;
          break;
        }
        nr += dr; nc += dc;
      }
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
    const board = this.board;
    const piece = board[fr][fc];
    if(!piece) return false;
    const movingColor = piece.color;
    const oppColor = movingColor===WHITE ? BLACK : WHITE;
    const isPromotion = piece.type==='p' && (tr===0 || tr===7);
    const targetBefore = board[tr][tc];
    let epCapR = -1, epCapC = -1, epCapPiece = null;
    let castleSide = null;

    // Apply move in-place
    if(isPromotion) board[tr][tc] = { type: (move && move.promotion) || 'q', color: piece.color };
    else board[tr][tc] = piece;
    board[fr][fc] = null;

    if(move && move.enPassant) {
      epCapR = movingColor===WHITE ? tr+1 : tr-1;
      epCapC = tc;
      epCapPiece = board[epCapR][epCapC];
      board[epCapR][epCapC] = null;
    }
    if(move && move.castle) {
      castleSide = move.castle;
      const row = fr;
      if(castleSide==='k') { board[row][5] = board[row][7]; board[row][7] = null; }
      else { board[row][3] = board[row][0]; board[row][0] = null; }
    }

    // Find moving color's king
    let kr = -1, kc = -1;
    if(piece.type==='k') { kr = tr; kc = tc; }
    else {
      outer: for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
        const p = board[r][c];
        if(p && p.type==='k' && p.color===movingColor) { kr = r; kc = c; break outer; }
      }
    }
    const inCheck = (kr>=0) ? this.isSquareAttacked(kr, kc, oppColor) : false;

    // Restore
    board[fr][fc] = piece;
    board[tr][tc] = targetBefore;
    if(epCapPiece) board[epCapR][epCapC] = epCapPiece;
    if(castleSide) {
      const row = fr;
      if(castleSide==='k') { board[row][7] = board[row][5]; board[row][5] = null; }
      else { board[row][0] = board[row][3]; board[row][3] = null; }
    }
    return inCheck;
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
    const board = this.board;
    const piece = board[fr][fc];
    if(!piece) return false;
    const movingColor = piece.color;
    const isPromotion = piece.type==='p' && (tr===0 || tr===7);
    const targetBefore = board[tr][tc];
    let captured = null;
    let epCapR = -1, epCapC = -1, epCapPiece = null;
    if(move && move.enPassant) {
      epCapR = movingColor===WHITE ? tr+1 : tr-1;
      epCapC = tc;
      epCapPiece = board[epCapR][epCapC];
      captured = epCapPiece;
    } else {
      captured = targetBefore;
    }
    const undoData = {
      from:{r:fr,c:fc},
      to:{r:tr,c:tc},
      move,
      pieceBefore: piece,
      targetBefore,
      epCapR, epCapC, epCapPiece,
      castle: (move && move.castle) ? move.castle : null,
      savedEP: this.enPassantTarget,
      savedCR: { w:{...this.castlingRights.w}, b:{...this.castlingRights.b} },
      savedTurn: this.turn,
      savedHalf: this.halfmoveClock,
      savedCapturedByWhite: this.capturedByWhite,
      savedCapturedByBlack: this.capturedByBlack,
      captured
    };
    // Apply move
    if(isPromotion) board[tr][tc] = { type: promoType || (move && move.promotion) || 'q', color: movingColor };
    else board[tr][tc] = piece;
    board[fr][fc] = null;
    if(epCapPiece) board[epCapR][epCapC] = null;
    if(undoData.castle) {
      const row = fr;
      if(undoData.castle==='k') { board[row][5] = board[row][7]; board[row][7] = null; }
      else { board[row][3] = board[row][0]; board[row][0] = null; }
    }
    // EP target
    this.enPassantTarget = (move && move.doublePush) ? {r:(fr+tr)/2,c:fc} : null;
    // Castling rights
    if(piece.type==='k') this.castlingRights[movingColor] = {k:false, q:false};
    else if(piece.type==='r') {
      const cr = this.castlingRights[movingColor];
      if(fc===0 && cr.q) this.castlingRights[movingColor] = {...cr, q:false};
      else if(fc===7 && cr.k) this.castlingRights[movingColor] = {...cr, k:false};
    }
    if(captured && captured.type==='r') {
      const oppColor = captured.color;
      const opRow = oppColor===WHITE ? 7 : 0;
      if(tr===opRow && tc===0) {
        const cr = this.castlingRights[oppColor];
        if(cr.q) this.castlingRights[oppColor] = {...cr, q:false};
      } else if(tr===opRow && tc===7) {
        const cr = this.castlingRights[oppColor];
        if(cr.k) this.castlingRights[oppColor] = {...cr, k:false};
      }
    }
    // Halfmove clock
    if(piece.type==='p' || captured) this.halfmoveClock = 0;
    else this.halfmoveClock = this.halfmoveClock + 1;
    // Captured tracking (immutable arrays)
    if(captured) {
      if(movingColor===WHITE) this.capturedByWhite = this.capturedByWhite.concat(captured);
      else this.capturedByBlack = this.capturedByBlack.concat(captured);
    }
    this.turn = this.turn===WHITE ? BLACK : WHITE;
    this.moveHistory.push(undoData);
    return true;
  }

  undoMove() {
    if(!this.moveHistory.length) return false;
    const u = this.moveHistory.pop();
    const board = this.board;
    board[u.from.r][u.from.c] = u.pieceBefore;
    if(u.move && u.move.enPassant) {
      board[u.to.r][u.to.c] = null;
      board[u.epCapR][u.epCapC] = u.epCapPiece;
    } else {
      board[u.to.r][u.to.c] = u.targetBefore;
    }
    if(u.castle==='k') {
      const row = u.from.r;
      board[row][7] = board[row][5];
      board[row][5] = null;
    } else if(u.castle==='q') {
      const row = u.from.r;
      board[row][0] = board[row][3];
      board[row][3] = null;
    }
    this.enPassantTarget = u.savedEP;
    this.castlingRights = u.savedCR;
    this.turn = u.savedTurn;
    this.halfmoveClock = u.savedHalf;
    this.capturedByWhite = u.savedCapturedByWhite;
    this.capturedByBlack = u.savedCapturedByBlack;
    return u;
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
    if(nearPawn && nearPawn.type==='p' && nearPawn.color===color) score += 12;
    else score -= 14;
  }
  if(kingPos.c===6 || kingPos.c===2) score += 24;
  return score;
}

function findKing(engine, color) {
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r, c);
    if(piece && piece.type==='k' && piece.color===color) return { r, c };
  }
  return null;
}

function evaluateKingAttack(engine, color) {
  const enemy = color===WHITE ? BLACK : WHITE;
  const kingPos = findKing(engine, enemy);
  if(!kingPos) return 0;

  let score = 0;
  for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++) {
    const rr = kingPos.r + dr;
    const cc = kingPos.c + dc;
    if(rr<0 || rr>7 || cc<0 || cc>7) continue;
    if(engine.isSquareAttacked(rr, cc, color)) {
      score += (dr===0 && dc===0) ? 12 : 6;
    }
    const occupant = engine.getPiece(rr, cc);
    if(occupant && occupant.color===color && occupant.type!=='k') {
      score += 4;
    }
  }

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
    if(!defended) penalty += Math.round(value * 0.3);
    else penalty += Math.round(value * 0.11);
  }

  return penalty;
}

function evaluateDevelopment(engine, color) {
  let score = 0;
  const homeRank = color===WHITE ? 7 : 0;
  const minorSquares = [
    { c:1, type:'n' }, { c:6, type:'n' },
    { c:2, type:'b' }, { c:5, type:'b' }
  ];
  for(const square of minorSquares) {
    const piece = engine.getPiece(homeRank, square.c);
    if(!piece || piece.color!==color || piece.type!==square.type) score += 11;
  }
  const queenHome = engine.getPiece(homeRank, 3);
  const undevelopedMinors = minorSquares.reduce((count, square) => {
    const piece = engine.getPiece(homeRank, square.c);
    return count + ((piece && piece.color===color && piece.type===square.type) ? 1 : 0);
  }, 0);
  if((!queenHome || queenHome.color!==color || queenHome.type!=='q') && undevelopedMinors >= 2) score -= 16;
  return score;
}

function evaluateHangingPieces(engine, color) {
  const enemy = color===WHITE ? BLACK : WHITE;
  let penalty = 0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const piece = engine.getPiece(r, c);
    if(!piece || piece.color!==color || piece.type==='k') continue;
    if(!engine.isSquareAttacked(r, c, enemy)) continue;
    const defended = engine.isSquareAttacked(r, c, color);
    const value = PIECE_VALUES[piece.type] || 0;
    if(!defended) penalty += Math.round(value * 0.62);
    else if(piece.type==='q' || piece.type==='r') penalty += Math.round(value * 0.2);
  }
  return penalty;
}

function evaluateCenterPresence(engine, color) {
  const centralSquares = [
    [3,3], [3,4], [4,3], [4,4],
    [2,2], [2,3], [2,4], [2,5],
    [5,2], [5,3], [5,4], [5,5]
  ];
  let score = 0;
  for(const [r,c] of centralSquares) {
    const piece = engine.getPiece(r, c);
    if(piece && piece.color===color) score += (r>=3 && r<=4 && c>=3 && c<=4) ? 8 : 4;
    if(engine.isSquareAttacked(r, c, color)) score += (r>=3 && r<=4 && c>=3 && c<=4) ? 3 : 1;
  }
  return score;
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
  score += evaluateKingAttack(engine, WHITE);
  score -= evaluateKingAttack(engine, BLACK);
  score += evaluateDevelopment(engine, WHITE);
  score -= evaluateDevelopment(engine, BLACK);
  score += evaluateCenterPresence(engine, WHITE);
  score -= evaluateCenterPresence(engine, BLACK);
  score -= evaluatePiecePressure(engine, WHITE);
  score += evaluatePiecePressure(engine, BLACK);
  score -= evaluateHangingPieces(engine, WHITE);
  score += evaluateHangingPieces(engine, BLACK);

  const endgameFactor = whiteMaterial + blackMaterial < 2600 ? 1 : 0;
  if(endgameFactor) {
    score += (whiteMaterial - blackMaterial) * 0.03;
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

function isPromotionMove(engine, move) {
  const mover = engine.getPiece(move.from.r, move.from.c);
  return !!(mover && mover.type==='p' && (move.to.r===0 || move.to.r===7));
}

function isQuietMove(engine, move) {
  return !getCapturePiece(engine, move) && !move.to.castle && !isPromotionMove(engine, move);
}

function hasNonPawnMaterial(engine, color) {
  const board = engine.board;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
    const p = board[r][c];
    if(p && p.color===color && p.type!=='k' && p.type!=='p') return true;
  }
  return false;
}

function findSmallestAttacker(board, tr, tc, byColor, removed) {
  // Returns {r, c, value} of cheapest attacker of (tr,tc) by byColor that isn't in removed.
  // Ray-scans treat removed squares as transparent (x-ray support).
  // Pawn
  const pawnRow = byColor===WHITE ? tr+1 : tr-1;
  if(pawnRow>=0 && pawnRow<8) {
    if(tc>0) {
      const idx = pawnRow*8 + (tc-1);
      const p = board[pawnRow][tc-1];
      if(p && p.color===byColor && p.type==='p' && !removed.has(idx)) return {r:pawnRow,c:tc-1,value:PIECE_VALUES.p};
    }
    if(tc<7) {
      const idx = pawnRow*8 + (tc+1);
      const p = board[pawnRow][tc+1];
      if(p && p.color===byColor && p.type==='p' && !removed.has(idx)) return {r:pawnRow,c:tc+1,value:PIECE_VALUES.p};
    }
  }
  // Knight
  for(let i=0;i<8;i++) {
    const dr = KNIGHT_DELTAS[i][0], dc = KNIGHT_DELTAS[i][1];
    const nr = tr+dr, nc = tc+dc;
    if(nr<0||nr>7||nc<0||nc>7) continue;
    const idx = nr*8+nc;
    if(removed.has(idx)) continue;
    const p = board[nr][nc];
    if(p && p.color===byColor && p.type==='n') return {r:nr,c:nc,value:PIECE_VALUES.n};
  }
  // Diagonal rays for bishop/queen
  let bestDiag = null;
  for(let i=0;i<4;i++) {
    const dr = DIAG_DIRS[i][0], dc = DIAG_DIRS[i][1];
    let nr = tr+dr, nc = tc+dc;
    while(nr>=0 && nr<8 && nc>=0 && nc<8) {
      const idx = nr*8+nc;
      if(!removed.has(idx)) {
        const p = board[nr][nc];
        if(p) {
          if(p.color===byColor && p.type==='b') {
            if(!bestDiag || PIECE_VALUES.b < bestDiag.value) bestDiag = {r:nr,c:nc,value:PIECE_VALUES.b};
          }
          break;
        }
      }
      nr+=dr; nc+=dc;
    }
  }
  if(bestDiag) return bestDiag;
  // Orthogonal rays for rook
  let bestOrtho = null;
  for(let i=0;i<4;i++) {
    const dr = ORTHO_DIRS[i][0], dc = ORTHO_DIRS[i][1];
    let nr = tr+dr, nc = tc+dc;
    while(nr>=0 && nr<8 && nc>=0 && nc<8) {
      const idx = nr*8+nc;
      if(!removed.has(idx)) {
        const p = board[nr][nc];
        if(p) {
          if(p.color===byColor && p.type==='r') {
            if(!bestOrtho || PIECE_VALUES.r < bestOrtho.value) bestOrtho = {r:nr,c:nc,value:PIECE_VALUES.r};
          }
          break;
        }
      }
      nr+=dr; nc+=dc;
    }
  }
  if(bestOrtho) return bestOrtho;
  // Queen via any direction
  let bestQueen = null;
  for(let i=0;i<8;i++) {
    const dr = ALL_DIRS[i][0], dc = ALL_DIRS[i][1];
    let nr = tr+dr, nc = tc+dc;
    while(nr>=0 && nr<8 && nc>=0 && nc<8) {
      const idx = nr*8+nc;
      if(!removed.has(idx)) {
        const p = board[nr][nc];
        if(p) {
          if(p.color===byColor && p.type==='q') bestQueen = {r:nr,c:nc,value:PIECE_VALUES.q};
          break;
        }
      }
      nr+=dr; nc+=dc;
    }
  }
  if(bestQueen) return bestQueen;
  // King last
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) {
    if(!dr && !dc) continue;
    const nr = tr+dr, nc = tc+dc;
    if(nr<0||nr>7||nc<0||nc>7) continue;
    const idx = nr*8+nc;
    if(removed.has(idx)) continue;
    const p = board[nr][nc];
    if(p && p.color===byColor && p.type==='k') return {r:nr,c:nc,value:PIECE_VALUES.k};
  }
  return null;
}

function see(engine, move) {
  const board = engine.board;
  const fr = move.from.r, fc = move.from.c;
  const tr = move.to.r, tc = move.to.c;
  const attacker = board[fr][fc];
  if(!attacker) return 0;
  let target;
  if(move.to.enPassant) {
    const capRow = attacker.color===WHITE ? tr+1 : tr-1;
    target = board[capRow][tc];
  } else {
    target = board[tr][tc];
  }
  if(!target) return 0;
  const removed = new Set();
  removed.add(fr*8+fc);
  if(move.to.enPassant) {
    const capRow = attacker.color===WHITE ? tr+1 : tr-1;
    removed.add(capRow*8+tc);
  }
  const gain = [PIECE_VALUES[target.type] || 0];
  let lastVal = PIECE_VALUES[attacker.type] || 0;
  let side = attacker.color===WHITE ? BLACK : WHITE;
  let d = 0;
  while(true) {
    const next = findSmallestAttacker(board, tr, tc, side, removed);
    if(!next) break;
    d++;
    gain[d] = lastVal - gain[d-1];
    if(Math.max(-gain[d-1], gain[d]) < 0) break;
    removed.add(next.r*8+next.c);
    lastVal = next.value;
    side = side===WHITE ? BLACK : WHITE;
  }
  while(d > 0) {
    gain[d-1] = -Math.max(-gain[d-1], gain[d]);
    d--;
  }
  return gain[0];
}

function tacticalBlunderPenalty(engine, side) {
  const enemy = engine.turn;
  let maxPenalty = 0;
  const enemyMoves = orderedMoves(engine, enemy).slice(0, 28);

  for(const move of enemyMoves) {
    const captured = getCapturePiece(engine, move);
    const attacker = engine.getPiece(move.from.r, move.from.c);
    if(!captured || !attacker || captured.color!==side) continue;

    const victimVal = PIECE_VALUES[captured.type] || 0;
    const attackerVal = PIECE_VALUES[attacker.type] || 0;
    let penalty = victimVal - Math.round(attackerVal * 0.2);

    if(captured.type==='q') penalty += 1450;
    else if(captured.type==='r') penalty += 420;
    else if(captured.type==='b' || captured.type==='n') penalty += 240;
    else if(captured.type==='p') penalty += 55;

    if(!engine.isSquareAttacked(move.to.r, move.to.c, side)) penalty += 210;
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

  // Generate captures and promotions only; rank by SEE; skip losing captures.
  const all = engine.getAllLegalMoves(engine.turn);
  const scored = [];
  for(const m of all) {
    const cap = getCapturePiece(engine, m);
    const mover = engine.getPiece(m.from.r, m.from.c);
    const isPromo = !!(mover && mover.type==='p' && (m.to.r===0 || m.to.r===7));
    if(!cap && !isPromo) continue;
    let s;
    if(cap) {
      s = see(engine, m);
      if(s < 0) continue; // skip losing captures
    } else {
      s = 800;
    }
    scored.push({m, s});
  }
  scored.sort((a,b) => b.s - a.s);

  for(const {m} of scored) {
    engine.makeMove(m.from.r, m.from.c, m.to.r, m.to.c, m.to);
    const score = -quiescence(engine, -beta, -alpha, side, ctx, ply+1);
    engine.undoMove();
    if(ctx.timeUp) return alpha;
    if(score >= beta) return beta;
    if(score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(engine, depth, alpha, beta, side, ctx, ply=0, checkExtsUsed=0, allowNull=true) {
  if((++ctx.nodes & 511)===0 && performance.now() > ctx.deadline) {
    ctx.timeUp = true;
    return 0;
  }

  const posKey = getPositionKey(engine);
  let addedToPath = false;

  // Repetition / 50-move draw (only away from root)
  if(ply > 0) {
    if(engine.halfmoveClock >= 100) return 0;
    if(ctx.priorPositions && ctx.priorPositions.has(posKey)) return 0;
    if(ctx.pathPositions.has(posKey)) return 0;
    ctx.pathPositions.add(posKey);
    addedToPath = true;
  }

  const cleanup = (val) => {
    if(addedToPath) ctx.pathPositions.delete(posKey);
    return val;
  };

  const alphaOrig = alpha;
  const ttEntry = ctx.tt.get(posKey);
  let ttMoveKey = '';
  if(ttEntry) {
    ttMoveKey = ttEntry.bestMoveKey || '';
    if(ttEntry.depth >= depth) {
      const ttScore = ttEntry.score;
      if(ttEntry.flag===TT_EXACT) return cleanup(ttScore);
      if(ttEntry.flag===TT_LOWER) {
        if(ttScore >= beta) return cleanup(ttScore);
        alpha = Math.max(alpha, ttScore);
      } else if(ttEntry.flag===TT_UPPER) {
        if(ttScore <= alpha) return cleanup(ttScore);
        beta = Math.min(beta, ttScore);
      }
      if(alpha >= beta) return cleanup(ttScore);
    }
  }

  if(depth <= 0) return cleanup(quiescence(engine, alpha, beta, side, ctx, ply));
  if(engine.isInsufficientMaterial()) return cleanup(0);

  const inCheck = engine.isInCheck(engine.turn);

  // Null Move Pruning
  if(allowNull && !inCheck && depth >= NMP_MIN_DEPTH && ply > 0
     && Math.abs(beta) < CHECKMATE_SCORE - 1000
     && hasNonPawnMaterial(engine, engine.turn)) {
    const savedEP = engine.enPassantTarget;
    engine.enPassantTarget = null;
    engine.turn = engine.turn===WHITE ? BLACK : WHITE;
    const R = depth >= 6 ? 3 : 2;
    const nullScore = -negamax(engine, depth - 1 - R, -beta, -beta + 1, side, ctx, ply + 1, checkExtsUsed, false);
    engine.turn = engine.turn===WHITE ? BLACK : WHITE;
    engine.enPassantTarget = savedEP;
    if(!ctx.timeUp && nullScore >= beta) return cleanup(beta);
  }

  const legalMoves = orderedMoves(engine, engine.turn, ctx, ply, ttMoveKey);
  if(!legalMoves.length) {
    if(inCheck) return cleanup(engine.turn===side ? -CHECKMATE_SCORE + ply : CHECKMATE_SCORE - ply);
    return cleanup(0);
  }

  let bestScore = -Infinity;
  let bestMoveKey = '';
  for(let moveIndex = 0; moveIndex < legalMoves.length; moveIndex++) {
    const move = legalMoves[moveIndex];
    const key = moveKey(move);
    const mover = engine.getPiece(move.from.r, move.from.c);
    const isCap = !!getCapturePiece(engine, move);
    const quietMove = !!mover && !isCap && !move.to.castle && !(mover.type==='p' && (move.to.r===0 || move.to.r===7));
    engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
    const givesCheck = engine.isInCheck(engine.turn);
    let extension = 0;
    if(givesCheck && checkExtsUsed < MAX_CHECK_EXTENSIONS) extension = 1;
    if(mover && mover.type==='p' && (move.to.r===0 || move.to.r===7 || move.to.r===1 || move.to.r===6)) extension = Math.max(extension, 1);
    const fullDepth = depth - 1 + extension;
    const newCheckExts = checkExtsUsed + (givesCheck && extension > 0 ? 1 : 0);
    let searchDepth = fullDepth;
    if(depth >= 3 && ply >= 2 && moveIndex >= 3 && quietMove && extension===0 && !inCheck) {
      searchDepth = Math.max(0, fullDepth - 1);
      if(moveIndex >= 6 && depth >= 5) searchDepth = Math.max(0, searchDepth - 1);
    }
    let score;
    if(moveIndex===0) {
      score = -negamax(engine, fullDepth, -beta, -alpha, side, ctx, ply + 1, newCheckExts, true);
    } else {
      score = -negamax(engine, searchDepth, -alpha - 1, -alpha, side, ctx, ply + 1, newCheckExts, true);
      if(!ctx.timeUp && score > alpha && searchDepth !== fullDepth) {
        score = -negamax(engine, fullDepth, -alpha - 1, -alpha, side, ctx, ply + 1, newCheckExts, true);
      }
      if(!ctx.timeUp && score > alpha && score < beta) {
        score = -negamax(engine, fullDepth, -beta, -alpha, side, ctx, ply + 1, newCheckExts, true);
      }
    }
    engine.undoMove();
    if(ctx.timeUp) return cleanup(0);
    if(score > bestScore) {
      bestScore = score;
      bestMoveKey = key;
    }
    if(score > alpha) alpha = score;
    if(alpha >= beta) {
      if(!isCap) {
        registerKiller(ctx, ply, key);
        ctx.history[key] = Math.min(8000, (ctx.history[key] || 0) + depth * depth);
      }
      break;
    }
  }

  let flag = TT_EXACT;
  if(bestScore <= alphaOrig) flag = TT_UPPER;
  else if(bestScore >= beta) flag = TT_LOWER;
  ctx.tt.set(posKey, { depth, score: bestScore, flag, bestMoveKey });
  return cleanup(bestScore);
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
  if(!legal.length) return null;

  const ctx = {
    deadline: performance.now() + SEARCH_LIMITS.medium,
    tt: new Map(),
    killers: [],
    history: Object.create(null),
    nodes: 0,
    timeUp: false,
    priorPositions: engine.priorPositions || new Set(),
    pathPositions: new Set()
  };

  let bestMove = legal[0];
  let bestScore = -Infinity;

  for(let depth = 3; depth <= 7; depth++) {
    if(ctx.timeUp) break;
    const rootMoves = [...legal];
    rootMoves.sort((a, b) => {
      if(moveKey(a)===moveKey(bestMove)) return -1;
      if(moveKey(b)===moveKey(bestMove)) return 1;
      return scoreMove(engine, b, ctx, 0) - scoreMove(engine, a, ctx, 0);
    });

    let alpha = -Infinity;
    const beta = Infinity;
    let localBest = rootMoves[0];
    let localScore = -Infinity;

    for(let i = 0; i < rootMoves.length; i++) {
      const m = rootMoves[i];
      const mover = engine.getPiece(m.from.r, m.from.c);
      engine.makeMove(m.from.r, m.from.c, m.to.r, m.to.c, m.to);
      let fullDepth = depth - 1;
      if(mover && mover.type==='p' && (m.to.r===0 || m.to.r===7 || m.to.r===1 || m.to.r===6)) fullDepth += 1;
      const s = -negamax(engine, fullDepth, -beta, -alpha, side, ctx, 1, 0, true);
      engine.undoMove();
      if(ctx.timeUp) break;
      if(s > localScore) {
        localScore = s;
        localBest = m;
      }
      if(s > alpha) alpha = s;
    }
    if(!ctx.timeUp) {
      bestMove = localBest;
      bestScore = localScore;
    }
  }
  return bestMove || legal[0];
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
    timeUp: false,
    priorPositions: engine.priorPositions || new Set(),
    pathPositions: new Set()
  };

  for(let depth=3; depth<=HARD_MAX_DEPTH; depth++) {
    let alphaWindow = Number.isFinite(bestScore) ? bestScore - ASPIRATION_WINDOW : -Infinity;
    let betaWindow = Number.isFinite(bestScore) ? bestScore + ASPIRATION_WINDOW : Infinity;
    let completedDepth = false;
    while(!completedDepth) {
      if(ctx.timeUp) return bestMove;
      let alpha = alphaWindow;
      let beta = betaWindow;
      const alphaOrig = alpha;
      const betaOrig = beta;
    rootMoves.sort((a,b) => {
      if(moveKey(a)===moveKey(bestMove)) return -1;
      if(moveKey(b)===moveKey(bestMove)) return 1;
      return scoreMove(engine,b,ctx,0) - scoreMove(engine,a,ctx,0);
    });
    let localBest = bestMove;
    let localScore = bestScore;
    for(let moveIndex = 0; moveIndex < rootMoves.length; moveIndex++) {
      const move = rootMoves[moveIndex];
      const mover = engine.getPiece(move.from.r, move.from.c);
      const quietMove = !!mover && isQuietMove(engine, move);
      engine.makeMove(move.from.r, move.from.c, move.to.r, move.to.c, move.to);
      let fullDepth = depth - 1;
      if(mover && mover.type==='p' && (move.to.r===0 || move.to.r===7 || move.to.r===1 || move.to.r===6)) fullDepth += 1;
      let result;
      if(moveIndex===0) {
        result = -negamax(engine, fullDepth, -beta, -alpha, side, ctx, 1);
      } else {
        let reducedDepth = fullDepth;
        if(depth >= 4 && quietMove) reducedDepth = Math.max(0, fullDepth - 1);
        result = -negamax(engine, reducedDepth, -alpha-1, -alpha, side, ctx, 1);
        if(!ctx.timeUp && result > alpha && reducedDepth !== fullDepth) {
          result = -negamax(engine, fullDepth, -alpha-1, -alpha, side, ctx, 1);
        }
        if(!ctx.timeUp && result > alpha && result < beta) {
          result = -negamax(engine, fullDepth, -beta, -alpha, side, ctx, 1);
        }
      }
      engine.undoMove();
      if(ctx.timeUp) return bestMove;
      if(result > localScore || !localBest) {
        localScore = result;
        localBest = move;
      }
      if(result > alpha) alpha = result;
      if(alpha >= beta) break;
      if(performance.now() > ctx.deadline) {
        ctx.timeUp = true;
        return bestMove;
      }
    }
      if(localScore <= alphaOrig && Number.isFinite(alphaOrig)) {
        alphaWindow = alphaOrig - ASPIRATION_WINDOW * 3;
        betaWindow = betaOrig;
        continue;
      }
      if(localScore >= betaOrig && Number.isFinite(betaOrig)) {
        alphaWindow = alphaOrig;
        betaWindow = betaOrig + ASPIRATION_WINDOW * 3;
        continue;
      }
      bestMove = localBest;
      bestScore = localScore;
      completedDepth = true;
    }
  }
  return bestMove;
}

function getOpeningMove(engine, side) {
  const history = engine.moveHistory || [];
  const book = side===BLACK ? {
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
  } : {
    '': ['6444','6343','6242','6646'],
    '1434': ['7655','7152','6353'],
    '1232': ['6444','7655','7152'],
    '1636': ['6444','6343'],
    '1545': ['6444','7655'],
    '1434|1232': ['7152','7655','7542'],
    '1434|1434': ['7152','7655'],
    '1434|1636': ['7655','7152'],
    '6444|1434': ['7655','7152','7542'],
    '6343|1232': ['7152','7655'],
    '6444|1232': ['7152','7655'],
    '6242|1232': ['7152','7655']
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
  return `${BOARD_FILES[c]}${BOARD_RANKS[r]}`;
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
    { piece:'queen', squares:[{r:7,c:3},{r:0,c:3}], text:'Это ферзи. Белый ферзь стартует на d1, а чёрный на d8: ферзь всегда стоит на клетке своего цвета. Они очень сильные, но в дебюте их лучше не выводить слишком рано, чтобы не потерять темп.' },
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
