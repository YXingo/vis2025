import React from 'react';
import {json} from 'd3-fetch';
import {geoEquirectangular, geoPath} from 'd3-geo';
import {event, select} from 'd3-selection';
import {zoom} from 'd3-zoom';
import {findStateData, getDataName, buildColormapValue, rankArray} from './utils';

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      features: [],
      height: 400,
      projection: null,
      width: this.props.width
    };
  }

  componentDidMount() {
    json('./data/custom.geo.json').then((data) => {
      this.setState({
        features: data.features
      });
    });
  }

  render() {
    const projection = geoEquirectangular()
      .center([0, 15])
      .scale([this.state.width / (2 * Math.PI)])
      .translate([this.state.width / 2, this.state.height / 2]);

    const allData = [];
    this.props.data.forEach((e) => {
      const keys = Object.keys(e).filter(key => !isNaN(Number(key)) && key !== '');
      keys.forEach((key) => {
        if (!isNaN(Number(e[key]))) {
          allData.push(Number(e[key]));
        }
      });
    });

    const ranks = rankArray(allData);
    let maxrank = Object.values(ranks);
    if (maxrank.length !== 0) {
      maxrank = maxrank.reduce((acc, d) => (d > acc ? d : acc));
    }

    const path = geoPath().projection(projection);
    /* To use abbreviation instead of full country name: d.properties.iso_a3 */
    const countries = this.state.features.map((d, i) => {
      const currPath = path(d);
      let fill = '#A3A3A3';
      const colorScale = buildColormapValue(0, maxrank);
      const countryName = getDataName(d.properties.admin);
      const countryData = findStateData(this.props.data, countryName);
      if (countryData) {
        if (isNaN(Number(countryData[this.props.year]))) {
          fill = '#A3A3A3';
        } else {
          const val2color = Number(countryData[this.props.year]);
          fill = colorScale(ranks[val2color]);
        }
      }
      return (
        <path
          d={currPath}
          id={`${d.properties.admin}`}
          className="country"
          fill={fill}
          onClick={(e) => this.props.modifyCountry(e.target.id) }
          key={`country-${i}`}
          stroke="#2A2C39"
        />
      );
    });

    const svg = select('.map');
    const map = select('.map__countries');
    function zoomed() {
      map.attr('transform', event.transform);
    }

    const zoom1 = zoom()
      .translateExtent([[-100, -100], [this.state.width + 100, this.state.height + 100]])
      .scaleExtent([1, 10])
      .on('zoom', zoomed);
    svg.call(zoom1);
    let selectMin = '低';
    let selectMax = '高';
    let selectUnit = '';
    const dataMinsMaxs = {
      Sanitation: ['低', '高', '使用基本卫生设施人口比例'],
      'Death Rate': ['低', '高', '每千人死亡率'],
      'Drinking Water': ['低', '高', '使用基本饮用水人口比例'],
      Fertility: ['低', '高', '每位妇女生育数'],
      'Life Expectancy': ['低', '高', '预期寿命（年）'],
      'Labor Participation': ['低', '高', '劳动力参与率'],
      'Internet Access': ['低', '高', '互联网接入人口比例'],
      'Electricity Access': ['低', '高', '电力接入人口比例'],
      'Merch Exports': ['低', '高', '商品出口比例'],
      'Merch Imports': ['低', '高', '商品进口比例'],
      'Mobile Subscription': ['低', '高', '每人移动电话订阅数'],
      CO2: ['低', '高', '人均二氧化碳排放量']
    };

    if (this.props.indicator !== '') {
      const item = dataMinsMaxs[this.props.indicator];
      if (item) {
        selectMin = item[0];
        selectMax = item[1];
        selectUnit = item[2];
      }
    }

    return (
      <div className="map-container">
        <div className="map-content">
          <svg className="map">
            <g className="map__countries">
              {countries}
            </g>
          </svg>
          <div className="map-legend">
            <svg width="600" height="60">
              <defs>
                <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y1="0%">
                  {/*<stop offset="0%" style={{stopColor: '#f0f5d6', stopOpacity: 1}}/>*/}
                  {/*<stop offset="25%" style={{stopColor: '#dec57a', stopOpacity: 1}}/>*/}
                  {/*<stop offset="50%" style={{stopColor: '#b85c2e', stopOpacity: 1}}/>*/}
                  {/*<stop offset="75%" style={{stopColor: '#5c171d', stopOpacity: 1}}/>*/}
                  {/*<stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}}/>*/}
                  <stop offset="0%" style={{stopColor: '#000000', stopOpacity: 1}}/>
                  <stop offset="25%" style={{stopColor: '#3b7bb1', stopOpacity: 1}}/>
                  <stop offset="50%" style={{stopColor: '#73c6d0', stopOpacity: 1}}/>
                  <stop offset="75%" style={{stopColor: '#d7f2e7', stopOpacity: 1}}/>
                  <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 1}}/>
                </linearGradient>
              </defs>
              <rect
                  className="gradientMap"
                  height="30"
                  width="600"
                  x="0"
                  y="0"
                  fill="url(#legendGradient)"
                  stroke="#000"
              />
              <text
                  x="10"
                  y="50"
                  style={{
                    fontSize: '0.9em',
                    fill: '#333'
                  }}
              >
                {selectMin}
              </text>
              <text
                x="300"
                y="50"
                style={{
                  fontSize: '0.9em',
                  fill: '#333',
                  textAnchor: 'middle'
                }}
              >
                {selectUnit}
              </text>
              <text
                x="590"
                y="50"
                style={{
                  fontSize: '0.9em',
                  fill: '#333',
                  textAnchor: 'end'
                }}
              >
                {selectMax}
              </text>
            </svg>
          </div>
        </div>
        {/* <div className="info-and-slider">
          <div className="info-container">
            <p>选定年份：{this.props.year}</p>
            <p>选定国家：{this.props.country || '未选择'}</p>
            <p>当前值：{this.props.value || '无数据'}</p>
          </div>
          <div className="slider-container">
            {this.props.children}
          </div>
        </div> */}
      </div>
    );
  }
}

MapComponent.displayName = 'MapComponent';
export default MapComponent;
