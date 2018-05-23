const { format, getYear } = require('date-fns');

const moment = (str, pattern) => format(str, pattern);

const currentYear = () => getYear(new Date());

module.exports = {
  moment,
  currentYear
};
