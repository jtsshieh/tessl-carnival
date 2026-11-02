# Ladder Guess

Cross a wobbly ladder that is held only by a post at each end. Every rung asks
you to name a programming language from a hint.

## How to play

- Each rung shows a hint, such as a line of code, and four languages to choose from.
- Click a choice, or press `1` to `4`, to guess.
- A right guess moves you one rung along. A wrong guess and you fall off.
- The hints get harder the further you go. Cross all 10 rungs to win.
- Click, or press Enter, on the end screen to play another round.

## Scoring

You score 1 point for every rung you cross, so a full crossing scores 10.
Your score is saved to the carnival's score board when you fall or win.

Each rung has two possible questions, and a round picks one of them at random.

## Files

- `game.ts`: the questions (`QUESTIONS`), the game logic (`createState`, `guess`,
  `scoreFor`, `choiceAt`) and the `ladderGuess` entry, the default export the
  midway finds.
- `game.test.ts`: tests for the game logic.
