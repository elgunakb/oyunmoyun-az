module.exports = Object.freeze({
  JOIN: 'room:join',
  LEAVE: 'room:leave',
  MEMBERS: 'room:members',

  START: 'game:start',
  STARTED: 'game:started',

  TIMER: 'round:timer',

  REVIEW: 'round:review',
  VOTE: 'review:vote',
  REVIEW_DONE: 'review:done',

  NEXT_REQ: 'round:next-request',
  NEXT_ROUND: 'round:next',
  OVER: 'game:over',
  ERROR: 'room:error',
});
