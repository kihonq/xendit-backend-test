function generateRandomRiderID(requestParams, ctx, ee, next) {
  ctx.vars['riderID'] = generateRandomInteger(1, 30);

  return next();
}

function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random()*(max - min + 1))
}

module.exports = {
  generateRandomRiderID,
};
