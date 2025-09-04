
const calculateNumericStats = (values) => {
  if (!values || values.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, sum: 0 };
  }

  const numericValues = values
    .filter(v => v !== null && v !== undefined)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v));

  if (numericValues.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, sum: 0 };
  }

  const sum = numericValues.reduce((a, b) => a + b, 0);
  const average = sum / numericValues.length;
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return {
    count: numericValues.length,
    average: parseFloat(average.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    sum: parseFloat(sum.toFixed(2))
  };
};

const calculateStringStats = (values) => {
  if (!values || values.length === 0) {
    return { count: 0, topValues: [], uniqueCount: 0 };
  }

  const frequencyMap = {};
  values.forEach(value => {
    if (value && value.toString().trim() !== '') {
      const key = value.toString().trim();
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    }
  });

  const frequencyArray = Object.entries(frequencyMap)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  const topValues = frequencyArray.slice(0, 5);
  const totalCount = topValues.reduce((acc, v) => acc + v.count, 0) + 
                     frequencyArray.slice(5).reduce((acc, v) => acc + v.count, 0);

  return {
    count: totalCount,
    topValues,
    uniqueCount: frequencyArray.length
  };
};


const calculateBooleanStats = (values) => {
  if (!values || values.length === 0) {
    return {
      count: 0,
      trueCount: 0,
      falseCount: 0,
      truePercentage: 0,
      falsePercentage: 0
    };
  }

  const booleanValues = values
    .filter(v => v === true || v === false || v === 'true' || v === 'false')
    .map(v => v === true || v === 'true');

  const trueCount = booleanValues.filter(v => v).length;
  const falseCount = booleanValues.length - trueCount;
  const truePercentage = booleanValues.length > 0 ? (trueCount / booleanValues.length) * 100 : 0;
  const falsePercentage = booleanValues.length > 0 ? (falseCount / booleanValues.length) * 100 : 0;

  return {
    count: booleanValues.length,
    trueCount,
    falseCount,
    truePercentage: parseFloat(truePercentage.toFixed(1)),
    falsePercentage: parseFloat(falsePercentage.toFixed(1))
  };
};

module.exports = {
  calculateNumericStats,
  calculateStringStats,
  calculateBooleanStats
};
