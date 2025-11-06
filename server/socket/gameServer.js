const { Server } = require('socket.io');
const EVENTS = require('./events');

const rooms = new Map();
const soloRooms = new Map();

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeTracks(results) {
  return (results || [])
    .filter((x) => x?.previewUrl && x?.artistName && x?.trackName)
    .map((x) => ({
      trackId: String(x.trackId),
      artist: x.artistName,
      title: x.trackName,
      previewUrl: x.previewUrl,
      artwork: x.artworkUrl100 || x.artworkUrl60 || null,
    }));
}

/**
 * category:
 *  - 'pop' | 'rock' | 'rap' | 'mix' (mövcud)
 *  - 'azerbaijani' | 'turkish' (yeni)
 */
async function fetchItunesTracks(category = 'pop', limit = 60) {
  const queries = [];
  if (category === 'azerbaijani') {
    const countries = ['az'];
    const terms = [
      // Populyar müğənnilər (klassik + müasir)
      'Aygün Kazımova',
      'Zeynəb Həsəni',
      'Röya',
      'Zülfiyyə Xanbabayeva',
      'Üzeyir Mehdizadə',
      'Brilliant Dadaşova',
      'Tünzalə Ağayeva',
      'Natavan Həbibi',
      'Nigar Camal',
      'Ramin Nabran',
      'Sabina Babayeva',
      'Sevil Sevinc',
      'Orxan Zeynallı',
      'Sevil & Sevinc',
      'Xatirə İslam',
      'Orkhan Zeynalli',
      'Nisa Qasımova',
      'Zarina Qurbanova',
      'Zarina Gurbanova',
      'Nigar Muharrem',
      'Eldar Qasımov',
      'Safura Əlizadə',
      'Narmin Karimbayova',
      'Uzeyir Mehdizade',
      'Miri Yusif',
      'MiriYusif',
      'Zamiq Hüseynov',
      'Çingiz Mustafayev',
      'Rauf & Faik',
      'Rauf Faik',
      'Aysel Teymurzadə',
      'Məryəm Şabanova',
      'Xpert',
      'Niyaməddin',
      'Eyyub Yaqubov',
      'Abbas Bağırov',
      'Flora Kərimova',
      'Elşad Xose',
      'Paster',
      'Nahidə Babaşlı',
      'Nahide Babashli',
      'Murad Arif',
    ];
    for (const c of countries) {
      for (const t of terms) {
        queries.push({ country: c, term: t });
      }
    }
  } else if (category === 'turkish') {
    const countries = ['tr', 'de', 'us']; // TR əsas, diaspora üçün DE/US fallback
    const terms = [
      'Türk',
      'Turkish',
      'Türkçe',
      'Türk Pop',
      'Arabesk',
      'Anadolu Rock',
      'Rap',
      'Pop',
      'Hit',
    ];
    for (const c of countries) {
      for (const t of terms) {
        queries.push({ country: c, term: t });
      }
    }
  } else if (category === 'mix') {
    // qarışıq üçün bir az pop/rock/rap
    const pairs = [
      { country: 'us', term: 'Pop' },
      { country: 'us', term: 'Rock' },
      { country: 'us', term: 'Rap' },
      { country: 'gb', term: 'Pop' },
      { country: 'de', term: 'Pop' },
    ];
    queries.push(...pairs);
  } else {
    // klassik janrlar: pop/rock/rap
    const countries = ['us', 'gb', 'de'];
    for (const c of countries) {
      queries.push({ country: c, term: category });
    }
  }

  // Sorğuları icra et və yığ
  const collected = [];
  const seenIds = new Set();
  for (const { country, term } of queries) {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('media', 'music');
    url.searchParams.set('entity', 'song');
    url.searchParams.set('term', term);
    url.searchParams.set('limit', String(Math.min(50, limit)));
    url.searchParams.set('country', country);
    const data = await fetchJson(url);
    const items = normalizeTracks(data?.results);

    for (const t of items) {
      if (!seenIds.has(t.trackId)) {
        collected.push(t);
        seenIds.add(t.trackId);
      }
    }
    if (collected.length >= limit) break; // kifayət qədər topladıq
  }

  // Əgər hələ də azdırsa, “universal” fallback
  if (collected.length < Math.floor(limit * 0.6)) {
    const fallback = [
      { country: 'us', term: 'world music' },
      { country: 'us', term: 'international pop' },
    ];
    for (const { country, term } of fallback) {
      const url = new URL('https://itunes.apple.com/search');
      url.searchParams.set('media', 'music');
      url.searchParams.set('entity', 'song');
      url.searchParams.set('term', term);
      url.searchParams.set('limit', String(Math.min(50, limit)));
      url.searchParams.set('country', country);
      const data = await fetchJson(url);
      const items = normalizeTracks(data?.results);
      for (const t of items) {
        if (!seenIds.has(t.trackId)) {
          collected.push(t);
          seenIds.add(t.trackId);
        }
      }
      if (collected.length >= limit) break;
    }
  }

  // Hələ də çatmırsa, mövcud pop/rock/rap ilə tamamla
  if (collected.length < limit) {
    const extras = ['Pop', 'Rock', 'Rap'];
    for (const ex of extras) {
      const url = new URL('https://itunes.apple.com/search');
      url.searchParams.set('media', 'music');
      url.searchParams.set('entity', 'song');
      url.searchParams.set('term', ex);
      url.searchParams.set('limit', String(Math.min(50, limit)));
      url.searchParams.set('country', 'us');
      const data = await fetchJson(url);
      const items = normalizeTracks(data?.results);
      for (const t of items) {
        if (!seenIds.has(t.trackId)) {
          collected.push(t);
          seenIds.add(t.trackId);
        }
      }
      if (collected.length >= limit) break;
    }
  }

  // təsadüfiləşdir və kəs
  return collected.sort(() => Math.random() - 0.5).slice(0, limit);
}

function pickDistractors(allArtists, correct, count = 3) {
  const pool = allArtists.filter((a) => a !== correct);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildSoloQuestions(tracks, rounds) {
  const byArtist = new Map();
  for (const t of tracks) {
    if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
    byArtist.get(t.artist).push(t);
  }
  const unique = Array.from(byArtist.values()).flatMap((list) =>
    list.slice(0, 2)
  );
  const chosen = unique.sort(() => Math.random() - 0.5).slice(0, rounds);

  const allArtists = Array.from(new Set(tracks.map((t) => t.artist)));

  return chosen.map((t) => {
    const distractors = pickDistractors(allArtists, t.artist, 3);
    const options = [t.artist, ...distractors].sort(() => Math.random() - 0.5);
    return {
      id: t.trackId,
      audio: t.previewUrl,
      title: t.title,
      artwork: t.artwork,
      correctArtist: t.artist,
      options,
    };
  });
}

function clearSoloTimers(room) {
  if (!room) return;
  if (room.state?.roundTimer) {
    clearTimeout(room.state.roundTimer);
    room.state.roundTimer = null;
  }
  if (room.state?.tickInterval) {
    clearInterval(room.state.tickInterval);
    room.state.tickInterval = null;
  }
}

function soloStartRound(io, roomId) {
  const room = soloRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  const q = state.questions[state.roundIndex];
  if (!q) return soloFinishGame(io, roomId);

  clearSoloTimers(room);

  state.roundStartedAt = Date.now();
  state.timeLeft = state.roundTime;
  state.answered = false;

  io.to(roomId).emit('solo:state', {
    phase: 'playing',
    roundIndex: state.roundIndex,
    totalRounds: state.totalRounds,
    timeLeft: state.timeLeft,
    question: {
      id: q.id,
      audio: q.audio,
      artwork: q.artwork,
      options: q.options,
      titleHint: '—',
    },
    score: state.score,
  });

  state.tickInterval = setInterval(() => {
    const r = soloRooms.get(roomId);
    if (!r) return clearInterval(state.tickInterval);
    r.state.timeLeft -= 1;
    io.to(roomId).emit('solo:tick', { timeLeft: r.state.timeLeft });
  }, 1000);

  state.roundTimer = setTimeout(() => {
    soloRevealAndNext(io, roomId);
  }, state.roundTime * 1000);
}

function soloRevealAndNext(io, roomId) {
  const room = soloRooms.get(roomId);
  if (!room) return;
  const { state } = room;
  clearSoloTimers(room);

  const q = state.questions[state.roundIndex];
  io.to(roomId).emit('solo:reveal', {
    roundIndex: state.roundIndex,
    correctArtist: q.correctArtist,
    title: q.title,
  });

  setTimeout(() => {
    state.roundIndex += 1;
    if (state.roundIndex >= state.totalRounds)
      return soloFinishGame(io, roomId);
    soloStartRound(io, roomId);
  }, 1500);
}

function soloFinishGame(io, roomId) {
  const room = soloRooms.get(roomId);
  if (!room) return;
  clearSoloTimers(room);
  const { state } = room;

  io.to(roomId).emit('solo:finished', {
    totalRounds: state.totalRounds,
    score: state.score,
    leaderboard: [{ name: state.playerName, score: state.score }],
  });

  setTimeout(() => soloRooms.delete(roomId), 30_000);
}

function safeArray(a) {
  return Array.isArray(a) ? a : [];
}
function arrayRand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function cryptoRandomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function pickNextLetter(room) {
  const all = safeArray(room.meta.letters);
  room.meta.usedLetters ||= new Set();
  const candidates = all.filter((L) => !room.meta.usedLetters.has(L));
  const pool = candidates.length ? candidates : all;
  const chosen = arrayRand(pool);
  room.meta.usedLetters.add(chosen);
  return chosen;
}
//
function emitRoom(io, room, extra = {}) {
  const payload = {
    _id: room.id,
    roomName: room.meta.roomName,
    host: room.meta.host,
    visibility: room.meta.visibility,
    passwordHash: room.meta.passwordHash ?? null,
    encryptedPassword: room.meta.encryptedPassword ?? null,
    passwordIV: room.meta.passwordIV ?? null,
    players: Array.from(room.players.values()).map((p) => p.name),
    categories: room.meta.categories,
    letters: room.meta.letters,
    selectedLetter: room.meta.selectedLetter ?? null,
    playerCount: room.players.size,
    timer: room.meta.timer ?? null,
    connectedPlayers: Array.from(room.players.values())
      .filter((p) => p.connected)
      .map((p) => p.name),
    stage: room.meta.stage,
    currentRound: room.meta.currentRound,
    roundScores: room.meta.roundScores,
    createdAt: room.meta.createdAt,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
  io.to(room.id).emit('updateRoomInfo', [payload]);
  io.to(room.id).emit('room:update', payload);
}

function emitInitialData(io, room) {
  const players = Array.from(room.players.values()).map((p) => p.name);
  const connectedPlayers = Array.from(room.players.values())
    .filter((p) => p.connected)
    .map((p) => p.name);
  const answers = {};
  for (const [pid, map] of room.state.answers.entries()) {
    const name = room.players.get(pid)?.name;
    if (name) answers[name] = map;
  }
  io.to(room.id).emit('initialData', [
    'initialData',
    {
      players,
      connectedPlayers,
      answers,
      rawAnswers: room.state.rawAnswers || {},
      votes: room.state.votes || {},
    },
  ]);
}

function startRound(io, room, seconds) {
  room.meta.stage = 'running';
  room.meta.currentRound = (room.meta.currentRound || 0) + 1;
  room.meta.selectedLetter = pickNextLetter(room);
  room.state.reviewGraceUntil = null;

  room.state.answers = new Map();
  room.state.votes = {};
  for (const p of room.players.values()) p.submitted = false;

  room.state.timer = { t: seconds, interval: null };

  emitRoom(io, room);
  io.to(room.id).emit(EVENTS.STARTED, {
    letter: room.meta.selectedLetter,
    round: room.meta.currentRound,
    duration: seconds,
    categories: room.meta.categories,
  });

  room.state.timer.interval = setInterval(() => {
    room.state.timer.t -= 1;
    io.to(room.id).emit(EVENTS.TIMER, { t: room.state.timer.t });
    if (room.state.timer.t <= 0) {
      clearInterval(room.state.timer.interval);
      room.state.timer.interval = null;
      beginReview(io, room);
    }
  }, 1000);
}

function beginReview(io, room) {
  room.meta.stage = 'review';

  // Grace window (gecikən submitlər üçün)
  room.state.reviewGraceUntil = Date.now() + 2000;

  // Prepare voting state
  room.state.votes ||= {};
  room.state.voterHistory = {}; // { voter: { target: { cat: 'positive'|'negative' } } }
  room.state.locked = new Set(); // Set of `${target}::${category}` (boş cavablar üçün kilid)

  // answers-i ada görə xəritələyək
  const answersByName = {};
  for (const [pid, a] of room.state.answers.entries()) {
    const nm = room.players.get(pid)?.name;
    if (nm) answersByName[nm] = a;
  }

  // Boş cavabları negative=playersCount ilə yaz və kilidlə
  const playerCount = room.players.size;
  for (const p of room.players.values()) {
    const name = p.name;
    const a = answersByName[name] || {};
    for (const cat of room.meta.categories) {
      const text = (a?.[cat] || '').trim();
      if (!text) {
        room.state.votes[name] ??= {};
        room.state.votes[name][cat] = { positive: 0, negative: playerCount };
        room.state.locked.add(`${name}::${cat}`);
      }
    }
  }

  emitInitialData(io, room);
  io.to(room.id).emit(EVENTS.REVIEW, {
    round: room.meta.currentRound,
    letter: room.meta.selectedLetter,
  });
  emitRoom(io, room);
}

function submitAnswers(io, room, playerId, answers) {
  const now = Date.now();
  const inGrace =
    room.state.reviewGraceUntil && now <= room.state.reviewGraceUntil;
  if (room.meta.stage !== 'running' && !inGrace) return;

  const pid = String(playerId);
  // əgər hər hansı səbəbdən players-də yoxdursa, ən azı ad kimi pid göstər
  if (!room.players.has(pid)) {
    room.players.set(pid, {
      id: pid,
      name: pid,
      connected: true,
      submitted: false,
    });
  }
  const pl = room.players.get(pid);
  if (!pl || pl.submitted) return;

  const trimmed = {};
  for (const cat of room.meta.categories) {
    trimmed[cat] = String(answers?.[cat] ?? '').trim();
  }
  room.state.answers.set(pid, trimmed);
  pl.submitted = true;

  emitInitialData(io, room);
}

function castVote(io, room, voterName, targetName, category, voteType) {
  if (room.meta.stage !== 'review') return;
  // 🔒 Review kilidliykən səs qəbul etmə
  if (room.state?.votingLocked) return;
  if (!['positive', 'negative'].includes(voteType)) return;

  // Boş cavablar üçün səs qəbul etmə
  const pairKey = `${targetName}::${category}`;
  if (room.state.locked && room.state.locked.has(pairKey)) return;

  room.state.votes[targetName] ??= {};
  room.state.votes[targetName][category] ??= { positive: 0, negative: 0 };

  // toggle: eyni voter bu (target,cat) üçün yalnız 1 seçim edə bilər
  room.state.voterHistory ??= {};
  const vh = room.state.voterHistory;
  vh[voterName] ??= {};
  vh[voterName][targetName] ??= {};
  const prev = vh[voterName][targetName][category];

  if (prev === voteType) {
    // eyni düyməyə təkrar basış — heç nə etmirik
    return;
  }

  // əvvəlki seçimdən geri qaytar
  if (prev === 'positive') {
    room.state.votes[targetName][category].positive = Math.max(
      0,
      (room.state.votes[targetName][category].positive || 0) - 1
    );
  } else if (prev === 'negative') {
    room.state.votes[targetName][category].negative = Math.max(
      0,
      (room.state.votes[targetName][category].negative || 0) - 1
    );
  }

  // yeni seçimi tətbiq et
  room.state.votes[targetName][category][voteType] =
    (room.state.votes[targetName][category][voteType] || 0) + 1;

  // history-ni yaz
  vh[voterName][targetName][category] = voteType;

  // UI-ni yenilə
  io.to(room.id).emit('updateVotes', [
    'updateVotes',
    {
      player: targetName,
      category,
      votes: room.state.votes[targetName][category],
    },
  ]);
}

function finalizeReview(io, room) {
  const scores = {};
  for (const p of room.players.values()) scores[p.name] = 0;

  const answersByName = {};
  for (const [pid, a] of room.state.answers.entries()) {
    const nm = room.players.get(pid)?.name;
    if (nm) answersByName[nm] = a;
  }

  for (const [playerName, cats] of Object.entries(answersByName)) {
    for (const [cat, text] of Object.entries(cats)) {
      if (!text) continue;
      const v = room.state.votes?.[playerName]?.[cat] ?? {
        positive: 0,
        negative: 0,
      };
      const scoreAdd = (v.positive || 0) * 5;
      scores[playerName] += scoreAdd;
    }
  }

  room.meta.roundScores ??= [];
  room.meta.roundScores.push({
    round: room.meta.currentRound,
    scores,
    _id: cryptoRandomId(),
  });

  // 🔒 bu raund üçün səsverməni bağla
  room.state.votingLocked = true;

  // Hamıya: nəticələr + kilid + round tarixçəsi
  io.to(room.id).emit(EVENTS.REVIEW_DONE, {
    round: room.meta.currentRound,
    scores,
    locked: true,
    roundScores: room.meta.roundScores,
  });

  // Stage 'review' qalsın, host "Next round" edəcək.
  // İstəsən 'waiting' saxlaya bilərsən, amma clientdə məntiq artıq işləyir.
  room.meta.stage = 'review';
  emitRoom(io, room);
}

function nextRound(io, room) {
  // "over"dan sonra host təkrar NEXT basarsa — sadəcə reset saxla
  if (room.meta.stage === 'over') {
    resetGame(room);
    emitRoom(io, room); // waiting vəziyyətini yayınla
    return;
  }

  const all = safeArray(room.meta.letters);
  const usedCount = room.meta.usedLetters ? room.meta.usedLetters.size : 0;

  if (all.length && usedCount >= all.length) {
    // bütün hərflər oynanıb
    io.to(room.id).emit(EVENTS.OVER, { reason: 'letters_exhausted' });

    // dərhal sıfırla ki, növbəti oyunda hərflər yenidən oynansın
    resetGame(room);
    emitRoom(io, room); // stage=waiting, currentRound=0, roundScores=[], selectedLetter=null
    return;
  }

  // hələ hərflər qalıb — növbəti raund
  startRound(io, room, room.meta.timer || 60);
}

// ===== Socket.IO bağlamaları =====
function attachGameServer(io) {
  io.on('connection', (socket) => {
    socket.on('solo:create', async (payload, ack) => {
      try {
        const {
          rounds = 5,
          roundTime = 30,
          category = 'pop',
          nickname = 'Player',
        } = payload || {};
        const roomId = 'solo_' + cryptoRandomId();

        const tracks = await fetchItunesTracks(
          category,
          Math.max(40, rounds * 10)
        );
        const questions = buildSoloQuestions(tracks, rounds);

        const state = {
          roomId,
          playerSocketId: socket.id,
          playerName: nickname,
          totalRounds: rounds,
          roundTime,
          questions,
          roundIndex: 0,
          timeLeft: roundTime,
          answered: false,
          score: 0,
          roundTimer: null,
          tickInterval: null,
        };

        soloRooms.set(roomId, { id: roomId, state });
        socket.join(roomId);
        ack?.({ ok: true, roomId });

        // 👇 Listener-lərin qoşulmasını gözləmək üçün cüzi gecikmə
        setTimeout(() => soloStartRound(io, roomId), 250);
      } catch (e) {
        ack?.({ ok: false, error: e?.message || 'Create failed' });
      }
    });

    // === SOLO: sync (client mount-dan sonra cari vəziyyəti ver) ===
    socket.on('solo:sync', ({ roomId }, ack) => {
      const room = soloRooms.get(roomId);
      if (!room) return ack?.({ ok: false, error: 'room_not_found' });

      const { state } = room;
      const q = state.questions[state.roundIndex];
      if (!q) return ack?.({ ok: false, error: 'no_question' });

      ack?.({
        ok: true,
        payload: {
          phase: 'playing',
          roundIndex: state.roundIndex,
          totalRounds: state.totalRounds,
          timeLeft: state.timeLeft,
          question: {
            id: q.id,
            audio: q.audio,
            artwork: q.artwork,
            options: q.options,
            titleHint: '—',
          },
          score: state.score,
        },
      });
    });

    // === SOLO: answer ===
    socket.on('solo:answer', ({ roomId, artist }) => {
      const room = soloRooms.get(roomId);
      if (!room) return;
      const { state } = room;
      if (state.answered) return; // accept once

      const q = state.questions[state.roundIndex];
      const isCorrect = artist === q.correctArtist;
      state.answered = true;

      if (isCorrect) {
        state.score += 10 + Math.max(0, state.timeLeft);
      }

      // reveal & go next
      soloRevealAndNext(io, roomId);
    });
    // JOIN
    socket.on('room:join', ({ code, roomId, player }) => {
      const id = roomId || code;
      const room = rooms.get(id);
      if (!room) {
        console.warn('[room:join] room not found for id=', id);
        return;
      }

      socket.join(id);

      const pid = String(player?.playerId || socket.id);
      const name = player?.name || `player#${pid.slice(-4)}`;
      if (!room.players.has(pid)) {
        room.players.set(pid, {
          id: pid,
          name,
          connected: true,
          submitted: false,
        });
      } else {
        room.players.get(pid).connected = true;
      }

      const members = Array.from(room.players.values()).map((p) => p.name);
      io.to(id).emit('room:members', { members });
      emitRoom(io, room);

      if (room.meta.stage === 'review') {
        emitInitialData(io, room);
      }
    });

    socket.on('state:sync', ({ roomId, code }) => {
      const id = roomId || code;
      const room = rooms.get(id);
      if (!room) return;
      emitInitialData(io, room);
    });

    // HYDRATE
    socket.on('room:hydrate', (payload) => {
      const R = Array.isArray(payload) ? payload[0] : payload;
      const id = R._id; // bizdə code

      const exists = rooms.get(id);
      if (exists) {
        // ✅ YALNIZ meta-nı yenilə, players/state toxunma
        const m = exists.meta;
        m.roomName = R.roomName ?? m.roomName;
        m.host = R.host ?? m.host;
        m.visibility = R.visibility ?? m.visibility;
        m.passwordHash = R.passwordHash ?? m.passwordHash;
        m.encryptedPassword = R.encryptedPassword ?? m.encryptedPassword;
        m.passwordIV = R.passwordIV ?? m.passwordIV;
        m.categories = Array.isArray(R.categories)
          ? R.categories
          : m.categories;
        m.letters = Array.isArray(R.letters) ? R.letters : m.letters;
        m.selectedLetter = R.selectedLetter ?? m.selectedLetter;
        m.timer = R.timer ?? m.timer;
        m.stage = R.stage ?? m.stage;
        m.currentRound = R.currentRound ?? m.currentRound;
        m.createdAt = R.createdAt ?? m.createdAt;
        // players/state saxlanır
        emitRoom(io, exists);
        return;
      }

      // ⭐ Otaq yoxdursa – yeni yarat
      const room = {
        id,
        meta: {
          roomName: R.roomName,
          host: R.host,
          visibility: R.visibility,
          passwordHash: R.passwordHash,
          encryptedPassword: R.encryptedPassword,
          passwordIV: R.passwordIV,
          categories: Array.isArray(R.categories) ? R.categories : [],
          letters: Array.isArray(R.letters) ? R.letters : [],
          selectedLetter: R.selectedLetter ?? null,
          playerCount: R.playerCount ?? 0,
          timer: R.timer ?? 60,
          stage: R.stage || 'waiting',
          currentRound: R.currentRound || 0,
          roundScores: R.roundScores || [],
          createdAt: R.createdAt || new Date().toISOString(),
          usedLetters: new Set(),
        },
        players: new Map(
          (Array.isArray(R.players) ? R.players : []).map((n, i) => [
            String(i + 1),
            {
              id: String(i + 1),
              name: n,
              connected: (Array.isArray(R.connectedPlayers)
                ? R.connectedPlayers
                : []
              ).includes(n),
              submitted: false,
            },
          ])
        ),
        state: {
          answers: new Map(),
          votes: {},
          rawAnswers: {},
          reviewGraceUntil: null,
        },
      };
      rooms.set(id, room);
      if (R.code && R.code !== id) rooms.set(R.code, room); // ehtiyat
      emitRoom(io, room);
    });

    // START
    socket.on(EVENTS.START, (payload) => {
      const id = payload.roomId || payload.code;
      const room = rooms.get(id);
      if (!room) {
        console.warn('[game:start] room not found for id=', id);
        return;
      }
      const secs = Number(payload?.duration) || room.meta.timer || 60;

      startRound(io, room, secs);
    });

    // SUBMIT
    socket.on('submitAnswers', ({ roomId, code, playerId, answers }) => {
      const id = roomId || code;
      const room = rooms.get(id);
      if (!room) return;
      const safePid = playerId || socket.id; // unikal
      submitAnswers(io, room, safePid, answers);
    });

    // VOTE
    socket.on(
      'castVote',
      ({ roomId, code, voter, target, category, voteType }) => {
        const id = roomId || code;
        const room = rooms.get(id);
        if (!room) return;
        castVote(io, room, voter, target, category, voteType);
      }
    );

    // REVIEW FINISH
    socket.on('review:finish', ({ roomId, code }) => {
      const id = roomId || code;
      const room = rooms.get(id);
      if (!room) return;
      finalizeReview(io, room);
    });

    // NEXT ROUND
    socket.on(EVENTS.NEXT_ROUND, ({ roomId, code }) => {
      const id = roomId || code;
      const room = rooms.get(id);
      if (!room) return;
      nextRound(io, room);
    });
  });
}

// --- CORS helper ---
function parseAllowedOrigins() {
  const def = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const raw = process.env.CORS_ORIGINS || def;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function resetGame(room) {
  // stage & raundlar
  room.meta.stage = 'waiting';
  room.meta.currentRound = 0;
  room.meta.selectedLetter = null;

  // bütün round xallarını sil
  room.meta.roundScores = [];

  // istifadə olunmuş hərfləri sıfırla (yenidən hamısı oynana bilsin)
  room.meta.usedLetters = new Set();

  // cavablar/səslər/timer sıfırlansın
  room.state.answers = new Map();
  room.state.votes = {};
  room.state.rawAnswers = {};
  if (room.state.timer?.interval) {
    clearInterval(room.state.timer.interval);
  }
  room.state.timer = null;

  // oyunçu flag-ları
  for (const p of room.players.values()) {
    p.submitted = false;
  }
}

// --- Socket.IO factory ---
function createSocketServer(httpServer) {
  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    process.env.CLIENT_ORIGIN ||
    ''
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  attachGameServer(io);
  io.on('connection', () => {
    /* optional logs */
  });
  return io;
}

module.exports = { createSocketServer, attachGameServer, rooms };
