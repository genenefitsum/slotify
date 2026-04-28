const normalizeValidators = (validators) => {
  if (validators.length === 1 && Array.isArray(validators[0])) {
    return validators[0];
  }

  return validators.flat().filter(Boolean);
};

const validateRequest = (...validators) => {
  const activeValidators = normalizeValidators(validators);

  return async (req, res, next) => {
    try {
      for (const validator of activeValidators) {
        await validator({
          body: req.body,
          params: req.params,
          query: req.query,
          user: req.user,
          req,
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = { validateRequest };
