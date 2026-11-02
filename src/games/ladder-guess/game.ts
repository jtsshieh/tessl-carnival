import { canvasFont, recordScore, theme, type CarnivalGame } from '../../carnival';

const { width: WIDTH, height: HEIGHT } = theme.canvas;

export const RUNGS = 10;

export interface Question {
  hint: string;
  choices: readonly string[];
  answer: string;
}

/**
 * Two trivia questions for each rung, easiest first. A round asks one question from
 * each rung, so the hints get harder the further you cross.
 */
export const QUESTIONS: readonly (readonly Question[])[] = [
  [
    {
      hint: 'Brendan Eich wrote it in 10 days in 1995 for Netscape.',
      choices: ['JavaScript', 'Python', 'C', 'Ruby'],
      answer: 'JavaScript',
    },
    {
      hint: 'Guido van Rossum named it after a BBC comedy troupe.',
      choices: ['Python', 'Java', 'PHP', 'C#'],
      answer: 'Python',
    },
  ],
  [
    {
      hint: '"Write once, run anywhere", first called Oak.',
      choices: ['Java', 'C', 'Go', 'Kotlin'],
      answer: 'Java',
    },
    {
      hint: 'Its name once stood for "Personal Home Page".',
      choices: ['PHP', 'Perl', 'Ruby', 'JavaScript'],
      answer: 'PHP',
    },
  ],
  [
    {
      hint: 'Dennis Ritchie made it at Bell Labs to write Unix.',
      choices: ['C', 'Rust', 'Swift', 'Python'],
      answer: 'C',
    },
    {
      hint: 'Born at IBM in the 1970s as SEQUEL, for querying data.',
      choices: ['SQL', 'Haskell', 'Lua', 'R'],
      answer: 'SQL',
    },
  ],
  [
    {
      hint: 'Matz made it in Japan to make programmers happy.',
      choices: ['Ruby', 'Python', 'Elixir', 'Lua'],
      answer: 'Ruby',
    },
    {
      hint: 'Microsoft added static types to JavaScript in 2012.',
      choices: ['TypeScript', 'JavaScript', 'Dart', 'Java'],
      answer: 'TypeScript',
    },
  ],
  [
    {
      hint: 'Designed at Google; its mascot is a gopher.',
      choices: ['Go', 'Swift', 'Rust', 'Kotlin'],
      answer: 'Go',
    },
    {
      hint: 'Anders Hejlsberg led it at Microsoft for .NET.',
      choices: ['C#', 'Java', 'F#', 'C++'],
      answer: 'C#',
    },
  ],
  [
    {
      hint: 'Its mascot is Ferris the crab; Mozilla backed it early.',
      choices: ['Rust', 'Go', 'C++', 'Zig'],
      answer: 'Rust',
    },
    {
      hint: 'Apple unveiled it in 2014 as a successor to Objective-C.',
      choices: ['Swift', 'Kotlin', 'Rust', 'Scala'],
      answer: 'Swift',
    },
  ],
  [
    {
      hint: 'JetBrains named it after an island near St. Petersburg.',
      choices: ['Kotlin', 'Scala', 'Swift', 'Groovy'],
      answer: 'Kotlin',
    },
    {
      hint: 'Its name is Portuguese for "moon"; made in Brazil.',
      choices: ['Lua', 'Ruby', 'Julia', 'Perl'],
      answer: 'Lua',
    },
  ],
  [
    {
      hint: 'A lazy, pure language named after logician Curry.',
      choices: ['Haskell', 'OCaml', 'Elm', 'F#'],
      answer: 'Haskell',
    },
    {
      hint: 'José Valim built it to run on the Erlang VM.',
      choices: ['Elixir', 'Erlang', 'Ruby', 'Clojure'],
      answer: 'Elixir',
    },
  ],
  [
    {
      hint: "Rich Hickey's Lisp for the Java Virtual Machine.",
      choices: ['Clojure', 'Common Lisp', 'Scheme', 'Racket'],
      answer: 'Clojure',
    },
    {
      hint: 'Larry Wall\'s "Swiss Army chainsaw"; its symbol is a camel.',
      choices: ['Perl', 'PHP', 'Ruby', 'Bash'],
      answer: 'Perl',
    },
  ],
  [
    {
      hint: 'Grace Hopper helped shape it; banks still run it.',
      choices: ['COBOL', 'Fortran', 'Ada', 'Pascal'],
      answer: 'COBOL',
    },
    {
      hint: "Urban Müller's 1993 language has only eight commands.",
      choices: ['Brainfuck', 'APL', 'Befunge', 'Forth'],
      answer: 'Brainfuck',
    },
  ],
];

export interface LadderGuessState {
  /** One question per rung, easiest first. */
  questions: Question[];
  /** Rungs crossed so far, which is also the score. */
  rung: number;
  /** The choice the player picked on the last rung, once they fall. */
  picked?: string;
  phase: 'playing' | 'fell' | 'won';
}

/** Picks one question for each rung. `random` returns a number in [0, 1). */
export function createState(random: () => number = Math.random): LadderGuessState {
  const questions = QUESTIONS.map((pool) => pool[Math.floor(random() * pool.length)]);
  return { questions, rung: 0, phase: 'playing' };
}

export function currentQuestion(state: LadderGuessState): Question | undefined {
  return state.questions[state.rung];
}

/** Answers the current rung's question. Returns true if the guess was right. */
export function guess(state: LadderGuessState, choice: string): boolean {
  const question = currentQuestion(state);
  if (state.phase !== 'playing' || !question) return false;
  if (choice !== question.answer) {
    state.picked = choice;
    state.phase = 'fell';
    return false;
  }
  state.rung += 1;
  if (state.rung === state.questions.length) state.phase = 'won';
  return true;
}

/** The score for a round: one point for every rung crossed. */
export function scoreFor(state: LadderGuessState): number {
  return state.rung;
}

const LADDER = { left: 60, right: WIDTH - 60, y: 130 } as const;
const BUTTON = { width: 340, height: 56, gap: 16, top: 300 } as const;

/** Where each choice's button sits on the canvas, in choice order. */
export function choiceButtons(count: number) {
  const left = (WIDTH - BUTTON.width * 2 - BUTTON.gap) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: left + (i % 2) * (BUTTON.width + BUTTON.gap),
    y: BUTTON.top + Math.floor(i / 2) * (BUTTON.height + BUTTON.gap),
    width: BUTTON.width,
    height: BUTTON.height,
  }));
}

/** The index of the choice button at a canvas point, or -1 if there is none. */
export function choiceAt(count: number, x: number, y: number): number {
  return choiceButtons(count).findIndex(
    (b) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height,
  );
}

function draw(ctx: CanvasRenderingContext2D, state: LadderGuessState) {
  const { colors } = theme;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // The ladder, held only by a post at each end.
  const spacing = (LADDER.right - LADDER.left) / RUNGS;
  ctx.fillStyle = colors.wood;
  ctx.fillRect(LADDER.left - 14, LADDER.y - 50, 14, HEIGHT);
  ctx.fillRect(LADDER.right, LADDER.y - 50, 14, HEIGHT);
  ctx.fillRect(LADDER.left, LADDER.y - 10, LADDER.right - LADDER.left, 4);
  ctx.fillRect(LADDER.left, LADDER.y + 10, LADDER.right - LADDER.left, 4);
  for (let i = 0; i <= RUNGS; i++) {
    ctx.fillStyle = i < state.rung ? colors.accent : colors.wood;
    ctx.fillRect(LADDER.left + i * spacing - 3, LADDER.y - 10, 6, 24);
  }

  // The player, standing on the rung they have reached.
  const px = LADDER.left + state.rung * spacing;
  const py = state.phase === 'fell' ? LADDER.y + 110 : LADDER.y - 30;
  ctx.fillStyle = state.phase === 'fell' ? colors.danger : colors.accent;
  ctx.beginPath();
  ctx.arc(px, py, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.text;
  ctx.font = canvasFont('body', 'bold');
  ctx.textAlign = 'left';
  ctx.fillText(`Rung ${state.rung}/${RUNGS}`, 16, 32);

  const question = currentQuestion(state);
  if (state.phase === 'playing' && question) {
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.muted;
    ctx.font = canvasFont('small');
    ctx.fillText('Which language is this about?', WIDTH / 2, 220);
    ctx.fillStyle = colors.text;
    ctx.font = canvasFont('body', 'bold');
    ctx.fillText(question.hint, WIDTH / 2, 255, WIDTH - 40);

    const buttons = choiceButtons(question.choices.length);
    question.choices.forEach((choice, i) => {
      const b = buttons[i];
      ctx.fillStyle = colors.surface;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.width, b.height, theme.radius);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = canvasFont('body');
      ctx.fillText(`${i + 1}. ${choice}`, b.x + b.width / 2, b.y + b.height / 2 + 6);
    });
    return;
  }

  ctx.fillStyle = colors.background;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = state.phase === 'won' ? colors.accent : colors.danger;
  ctx.font = canvasFont('title', 'bold');
  const headline =
    state.phase === 'won'
      ? `You crossed all ${RUNGS} rungs!`
      : `You fell after ${state.rung} rung${state.rung === 1 ? '' : 's'}`;
  ctx.fillText(headline, WIDTH / 2, HEIGHT / 2);
  ctx.fillStyle = colors.text;
  ctx.font = canvasFont('body');
  if (state.phase === 'fell' && question) {
    ctx.fillText(`That was ${question.answer}, not ${state.picked}.`, WIDTH / 2, HEIGHT / 2 + 36);
  }
  ctx.fillText('Click to play again', WIDTH / 2, HEIGHT / 2 + 72);
}

export const ladderGuess: CarnivalGame = {
  id: 'ladder-guess',
  name: 'Ladder Guess',
  description:
    'Cross the wobbly ladder by naming the programming language. One wrong guess and you fall.',

  start(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let state = createState();
    let scoreRecorded = false;

    const answer = (index: number) => {
      const question = currentQuestion(state);
      if (!question || index < 0 || index >= question.choices.length) return;
      guess(state, question.choices[index]);
    };
    const restart = () => {
      state = createState();
      scoreRecorded = false;
    };

    const onDown = (event: PointerEvent) => {
      if (state.phase !== 'playing') return restart();
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
      answer(choiceAt(currentQuestion(state)?.choices.length ?? 0, x, y));
    };
    const onKey = (event: KeyboardEvent) => {
      if (state.phase !== 'playing') {
        if (event.key === 'Enter' || event.key === ' ') restart();
        return;
      }
      const index = Number(event.key) - 1;
      if (Number.isInteger(index)) answer(index);
    };
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);

    let frame = 0;
    const loop = () => {
      if (state.phase !== 'playing' && !scoreRecorded) {
        recordScore(ladderGuess.id, scoreFor(state));
        scoreRecorded = true;
      }
      draw(ctx, state);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  },
};

export default ladderGuess;
