import React from 'react';
import {scaleLinear} from 'd3-scale';
import {hsl} from 'd3-color';
import {groupBy} from 'underscore';
import {line} from 'd3-shape';

export function findStateData(data, name) {
  let result;
  data.forEach(d => {
    if (d['Country Name'] === name) {
      result = d;
    }
  });

  return result;
}

export function getDataName(countryName) {
  const namesMapping = {
    'United States of America': 'United States',
    Brunei: 'Brunei Darussalam',
    Venezuela: 'Venezuela, RB',
    Russia: 'Russian Federation',
    'Ivory Coast': 'Cote d\'Ivoire',
    'Guinea Bissau': 'Guinea-Bissau',
    'Democratic Republic of the Congo': 'Congo, Dem. Rep.',
    'United Republic of Tanzania': 'Tanzania',
    'Republic of Congo': 'Congo, Rep.',
    Egypt: 'Egypt, Arab Rep.',
    Yemen: 'Yemen, Rep.',
    Somaliland: 'Somalia',
    Iran: 'Iran, Islamic Rep.',
    Syria: 'Syrian Arab Republic',
    Slovakia: 'Slovak Republic',
    'Republic of Serbia': 'Serbia',
    Macedonia: 'Macedonia, FYR',
    Kyrgyzstan: 'Kyrgyz Republic',
    Laos: 'Lao PDR',
    'North Korea': 'Korea, Dem. People’s Rep.',
    'South Korea': 'Korea, Rep.',
    Taiwan: 'China',
    'Cape Verde': 'Cabo Verde',
    'East Timor': 'Timor-Leste',
    Gambia: 'Gambia, The',
    Palestine: 'West Bank and Gaza',
    'Northern Cyprus': 'Cyprus',
    'The Bahamas': 'Bahamas, The'
  };

  if (countryName in namesMapping) {
    countryName = namesMapping[countryName];
  }

  return countryName;
}

export function buildColormapValue(min, max) {
  // const lum = scaleLinear().domain([min, max]).range([0, 0.9]);
  // const hue = scaleLinear().domain([min, max]).range([-30, 70]);
  // const sat = 0.6;
  const lum = scaleLinear().domain([max, min]).range([0.1, 0.95]);
  const hue = scaleLinear().domain([min, max]).range([150, 250]);
  const sat = 0.5;
  return (d) => {
    return hsl(hue(d), sat, lum(d));
  };
}

export function buildGridColormap(min, max) {
  const lum = scaleLinear().domain([max, min]).range([0.1, 0.95]);
  const hue = scaleLinear().domain([min, max]).range([150, 250]);
  const sat = 0.5;
  return (d) => {
    if (d === 0) {
      return hsl(0, 0, 1);
    }

    return hsl(hue(d), sat, lum(d));
  };
}

export function rankArray(arr) {
  arr.sort((a, b) => a - b);
  const diffs = [];
  arr.forEach((e, i) => {
    if (i < arr.length - 1) {
      const dif = arr[i + 1] - arr[i];
      if (dif !== 0) {
        diffs.push(dif);
      }
    }
  });
  diffs.sort((a, b) => a - b);
  const tolerance = diffs[Math.ceil(diffs.length / 20.0)];
  const ranks = {};
  let temp = arr[0];
  let rankVal = 0;
  arr.forEach((e, i) => {
    if (!(e in ranks)) {
      if (i === 0) {
        ranks[e] = rankVal;
      } else {
        const lowerBound = temp - tolerance;
        const upperBound = temp + tolerance;
        if (e < lowerBound || e > upperBound) {
          rankVal += 1;
          temp = arr[i];
        }

        ranks[e] = rankVal;
      }
    }
  });
  return ranks;
}

// get the max and min of the passed data
export function getMaxMinData(data) {
  if (data) {
    let max = -Infinity;
    let min = Infinity;
    const allData = [];
    data.forEach((d) => {
      const name = d['Country Name'];
      if (name === 'Gibraltar' ||
        name === 'Isle of Man' ||
        name === 'World' ||
        name === 'American Samoa') {
        return;
      }

      Object.keys(d).forEach((key) => {
        if (isNaN(Number(key)) || key === '') {
          return;
        }

        if (!isNaN(Number(d[key]))) {
          allData.push(Number(d[key]));
        }

        const val = Number(d[key]);
        if (val > max && !isNaN(val)) {
          max = val;
        }

        if (val < min && !isNaN(val)) {
          min = val;
        }
      });
    });

    return {
      max,
      min
    };
  }
}

export function getMaxDistrSize(data) {
  const arraySizes = data.map(d => d.stats.map(q => q.countries.length));
  const firstMaxes = arraySizes.map(d => d.reduce((p, v) => {
    return (p > v ? p : v);
  }));
  return firstMaxes.reduce((p, v) => {
    return (p > v ? p : v);
  });
}

export function getYears(data) {
  const keys = Object.keys(data[0]).filter((d) => !isNaN(Number(d)) && d !== '');
  const minYear = Number(keys[0]);
  const maxYear = Number(keys[keys.length - 1]);
  return {minYear, maxYear};
}

export function processData(data) {
  if (data) {
    const startEndYear = getYears(data);
    const startYear = startEndYear.minYear;
    const endYear = startEndYear.maxYear;
    // setting up the histogram binner
    const minMax = getMaxMinData(data);
    const rangeWidth = (minMax.max - minMax.min) / 20;
    const groupByFunction = stat => Number(stat.value) === minMax.max ?
      19 : Math.floor((stat.value - minMax.min) / rangeWidth);
    // determining which years will be used
    let years = Array(...(null, {length: endYear - startYear + 1})).map(Number.call, Number);
    years = years.map(d => d + startYear);
    // begin processing the data by applying keys to values
    let retData = years.map(year => {
      return {
        year,
        stats: data.map(d => {
          return {
            country: d['Country Name'],
            value: d[year]
          };
        }).filter(stat => stat.value !== 'NaN')};
    });
    // binning each years countries into different ranges
    retData = retData.map(d => {
      return {
        year: d.year,
        stats: groupBy(d.stats, groupByFunction)
      };
    });
    // labelling the bins so that they can be accessed easily
    retData = retData.map(d => {
      return {
        year: d.year,
        stats: Object.keys(d.stats).map((val, i) => {
          return {
            distr: val,
            countries: Object.values(d.stats)[i]
          };
        })
      };
    });

    return retData;
  }
}

export function drawPath(data, countryName, maxDist) {
  const length = 18;
  const coordinates = [];
  data.forEach((d, rowIndex) => {
    d.stats.forEach((e, i) => {
      const countries = [];
      e.countries.forEach((stats) => {
        countries.push(stats.country);
      });

      if (countries.indexOf(getDataName(countryName)) !== -1) {
        const xIndex = Number(e.distr);
        coordinates.push({
          x: ((xIndex + 1.3) * length) + (length / 2),
          y: (50 + (rowIndex) * length) + (length / 2)
        });
      }
    });
  });

  const lines = [];
  coordinates.forEach((c, i) => {
    if (i < coordinates.length - 1) {
      lines.push(
        <line
          x1={c.x}
          y1={c.y}
          x2={coordinates[i + 1].x}
          y2={coordinates[i + 1].y}
          stroke="orange"
          strokeWidth="5"
          />
      );
    }
  });

  return lines;
}
