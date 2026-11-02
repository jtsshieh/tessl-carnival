import { describe, expect, it } from 'vitest';
import {
  QUESTIONS,
  RUNGS,
  choiceAt,
  choiceButtons,
  createState,
  currentQuestion,
  guess,
  scoreFor,
} from './game';

const first = () => 0;

describe('ladder guess', () => {
  it('starts at the first rung with one question per rung', () => {
    const state = createState(first);
    expect(state.rung).toBe(0);
    expect(state.phase).toBe('playing');
    expect(state.questions).toHaveLength(RUNGS);
    expect(scoreFor(state)).toBe(0);
  });

  it('asks the easiest question first and the hardest last', () => {
    const state = createState(first);
    expect(state.questions[0]).toBe(QUESTIONS[0][0]);
    expect(state.questions[RUNGS - 1]).toBe(QUESTIONS[RUNGS - 1][0]);
  });

  it('only offers questions whose answer is one of the choices', () => {
    for (const question of QUESTIONS.flat()) {
      expect(question.choices).toContain(question.answer);
    }
  });

  it('moves one rung along for a right guess', () => {
    const state = createState(first);
    expect(guess(state, currentQuestion(state)!.answer)).toBe(true);
    expect(state.rung).toBe(1);
    expect(state.phase).toBe('playing');
  });

  it('ends the round on a wrong guess and keeps the rungs crossed', () => {
    const state = createState(first);
    guess(state, currentQuestion(state)!.answer);
    const wrong = currentQuestion(state)!.choices.find(
      (c) => c !== currentQuestion(state)!.answer,
    )!;
    expect(guess(state, wrong)).toBe(false);
    expect(state.phase).toBe('fell');
    expect(state.picked).toBe(wrong);
    expect(scoreFor(state)).toBe(1);
  });

  it('wins after all ten right guesses', () => {
    const state = createState(first);
    for (let i = 0; i < RUNGS; i++) guess(state, currentQuestion(state)!.answer);
    expect(state.phase).toBe('won');
    expect(scoreFor(state)).toBe(RUNGS);
  });

  it('ignores guesses once the round is over', () => {
    const state = createState(first);
    guess(state, 'not a language');
    expect(guess(state, QUESTIONS[0][0].answer)).toBe(false);
    expect(state.rung).toBe(0);
  });

  it('finds the choice button under a point', () => {
    const [a, b] = choiceButtons(4);
    expect(choiceAt(4, a.x + 1, a.y + 1)).toBe(0);
    expect(choiceAt(4, b.x + 1, b.y + 1)).toBe(1);
    expect(choiceAt(4, 0, 0)).toBe(-1);
  });
});
