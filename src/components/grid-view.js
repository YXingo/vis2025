import React from 'react';
import {line} from 'd3-shape';
import {buildGridColormap, drawPath} from './utils';
import {select} from 'd3-selection';

class Square extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const countries = this.props.data.countries.map(d => d.country);
    const numCountries = countries.length;
    const squareSideLength = 18;
    return (
      <rect
        x={(this.props.index + 1.3) * squareSideLength}
        y={50 + (this.props.rowIndex) * squareSideLength}
        width={squareSideLength - 1}
        height={squareSideLength - 1}
        stroke="#000"
        strokeWidth="0.5"
        fill={this.props.scale(numCountries)}
        data-countries={countries}
        data-num-countries={numCountries}
        data-distribution={this.props.data.distr}
        onClick={this.props.handleClick}
      />
    );
  }
}

class Row extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const squareSideLength = 18;
    const squares = [];
    const timeLabel = (
      <text
        x="-12"
        y={squareSideLength * (this.props.index) + 65}
        style={{fontSize: '0.8em', fontWeight: 'bold'}}
      >
        {this.props.year}
      </text>
    );

    const stats = this.props.data.stats;
    const maxDist = this.props.maxDist > 20 ? 19 : this.props.maxDist;
    const ranges = Array.from(new Array(maxDist - this.props.minDist + 1),
      (d, i) => i + this.props.minDist);
    const fullStats = [];
    ranges.forEach((n) => {
      fullStats.push({distr: n, countries: []});
    });

    stats.forEach((s) => {
      fullStats.forEach((n) => {
        if (n.distr === Number(s.distr)) {
          n.countries = s.countries;
        }
      });
    });

    fullStats.forEach((d, i) => {
      squares.push(
        <Square
          data={d}
          index={i}
          rowIndex={this.props.index}
          scale={this.props.scale}
          key={`${this.props.indicator}-row-${this.props.index}-square-${i}`}
          handleClick={this.props.handleClick}
        />
      );
    });

    return (
      <g>
        {timeLabel}
        {squares}
      </g>
    );
  }
}

class GridView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const indicator = this.props.indicator;
    const processedData = indicator ? this.props.processedData[indicator].data : [];
    const currentLabels = indicator ? this.props.processedData[indicator].labels : [];

    const rows = [];
    let years = [];
    let maxDist = -Infinity;
    if (processedData) {
      years = processedData.map(d => d.year);
      let minDist = Infinity;
      let maxNum = -Infinity;
      let minNum = Infinity;
      processedData.forEach((d) => {
        d.stats.forEach((s) => {
          maxDist = Math.max(maxDist, Number(s.distr));
          minDist = Math.min(minDist, Number(s.distr));
          maxNum = Math.max(maxNum, s.countries.length);
          minNum = Math.min(minNum, s.countries.length);
        });
      });

      const colorScale = buildGridColormap(minNum, maxNum, maxDist);
      processedData.forEach((d, i) => {
        rows.push(
          <Row
            data={d}
            index={i}
            scale={colorScale}
            maxDist={maxDist}
            minDist={minDist}
            indicator={indicator}
            key={`${indicator}-${i}`}
            year={years[i]}
            handleClick={this.props.handleClick}
          />
        );
      });
    }

    const squareSideLength = 18;
    const xLabels = [];
    currentLabels.forEach((label, index) => {
      xLabels.push(
        <g key={`label-group-${index}`}>
          <text
            key={`distr-label-${index}`}
            className="label-distribution"
            x={(index + 1) * squareSideLength - 15}
            y="40"
            style={{
              fontSize: '0.8em',
              fontWeight: 'bold',
              transformOrigin: `${(index + 1) * squareSideLength}px 15px`,
              transform: 'rotate(-90deg) translateX(-5px) translateY(-10px)'
            }}
          >
            {label}
          </text>
          <line
            x1={(index + 1) * squareSideLength + (squareSideLength / 1.5)}
            y1="40"
            x2={(index + 1) * squareSideLength + (squareSideLength / 1.5)}
            y2="50"
            style={{
              stroke: '#000',
              strokeWidth: '0.5px'
            }}
          />
        </g>
      );
    });

    const lines = drawPath(processedData, this.props.country, maxDist);
    const gridHeight = Math.max(500, (rows.length + 2) * squareSideLength + 100);
    const gridWidth = Math.max(400, (currentLabels.length + 2) * squareSideLength);

    return (
      <div className="grid-view-container">
        <div className="grid-header">
          <h3>时间分布图</h3>
          <p className="grid-legend">颜色深浅表示该区间内国家数量的多少</p>
        </div>
        <svg
          className="grid"
          height={gridHeight}
          width={gridWidth}
          style={{ minWidth: '100%' }}
        >
          <g transform={`translate(40, 100)`}>
            {xLabels}
            {rows}
            {lines}
          </g>
        </svg>
      </div>
    );
  }
}

GridView.displayName = 'GridView';
export default GridView;
