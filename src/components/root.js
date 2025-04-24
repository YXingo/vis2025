import React from 'react';
import {csv} from 'd3-fetch';
import {processData, getYears, findStateData, getDataName} from './utils';

import GridView from './grid-view';
import MapComponent from './map-component';
import SliderComponent from './slider';
import Filter from './filter';

class RootComponent extends React.Component {
  state = {
    country: null,
    year: 2017,
    myData: {},
    processedData: {},
    indicator: '',
    lastIndicator: '',
    descriptions: {},
    currVal: ''
  }

  componentWillMount() {
    // if the data you are going to import is small, then you can import it using es6 import
    // import MY_DATA from './data/example.json'
    // (I tend to think it's best to use screaming snake case for imported json)
    Promise.all([
      csv('data/sanitation_data.csv'),
      csv('data/renewable.csv'),
      csv('data/DeathRate.csv'),
      csv('data/DrinkingWater.csv'),
      csv('data/Fertility.csv'),
      csv('data/life_expectancy_birth.csv'),
      csv('data/labor_participation.csv'),
      csv('data/internet_access.csv'),
      csv('data/electricity_access.csv'),
      csv('data/CO2.csv'),
      csv('data/GDP_percap.csv'),
      csv('data/merch_exports.csv'),
      csv('data/merch_imports.csv'),
      csv('data/mobile_subscription.csv'),
      csv('data/tourism_receipts.csv')
    ]).then(data => {
      const myData = {
        Sanitation: data[0],
        'Death Rate': data[2],
        'Drinking Water': data[3],
        Fertility: data[4],
        'Life Expectancy': data[5],
        'Labor Participation': data[6],
        'Internet Access': data[7],
        'Electricity Access': data[8],
        CO2: data[9],
        'GDP Per Capita': data[10],
        'Merch Exports': data[11],
        'Merch Imports': data[12],
        'Mobile Subscription': data[13]
      };

      const labels = {
        'Death Rate': ['1.47-4.12', '4.12-6.77', '6.77-9.42', '9.42-12.07',
          '12.07-14.72', '14.72-17.36', '17.36-20.01', '20.01-22.66', '22.66-25.31',
          '25.31-27.96', '27.96-30.61', '30.61-33.26', '33.26-35.90', '35.90-38.55',
          '38.55-41.20', '41.20-43.85', '43.85-46.50', '46.50-49.15', '49.15-51.80',
          '51.80-54.44'],
        Sanitation: ['3.15-7.99', '7.99-12.83', '12.83-17.68',
          '17.68-22.52', '22.52-27.36', '27.36-32.20', '32.20-37.05',
          '37.05-41.89', '41.89-46.73', '46.73-51.58', '51.58-56.42',
          '56.42-61.26', '61.26-66.10', '66.10-70.95', '70.95-75.79',
          '75.79-80.63', '80.63-85.47', '85.47-90.32', '90.32-95.16', '95.16-100.00'],
        'Drinking Water': ['16.73-20.89', '20.89-25.06', '25.06-29.22',
          '29.22-33.38', '33.38-37.55', '37.55-41.71', '41.71-45.87', '45.87-50.04',
          '50.04-54.20', '54.20-58.36', '58.36-62.53', '62.53-66.69', '66.69-70.86',
          '70.86-75.02', '75.02-79.18', '79.18-83.35', '83.35-87.51', '87.51-91.67',
          '91.67-95.84', '95.84-100.00'],
        Fertility: ['0.83-1.23', '1.23-1.63', '1.63-2.03', '2.03-2.43',
          '2.43-2.84', '2.84-3.24', '3.24-3.64', '3.64-4.04', '4.04-4.44', '4.44-4.85',
          '4.85-5.25', '5.25-5.65', '5.65-6.05', '6.05-6.45', '6.45-6.86', '6.86-7.26',
          '7.26-7.66', '7.66-8.06', '8.06-8.46', '8.46-8.87'],
        'Life Expectancy': ['18.91-22.23', '22.23-25.56', '25.56-28.88', '28.88-32.21',
          '32.21-35.53', '35.53-38.86', '38.86-42.19', '42.19-45.51', '45.51-48.84',
          '48.84-52.16', '52.16-55.49', '55.49-58.81', '58.81-62.14', '62.14-65.46',
          '65.46-68.79', '68.79-72.11', '72.11-75.44', '75.44-78.77', '78.77-82.09',
          '82.09-85.42'],
        'Labor Participation': ['17.99-22.08', '22.08-26.18', '26.18-30.27', '30.27-34.36',
          '34.36-38.46', '38.46-42.55', '42.55-46.64', '46.64-50.74', '50.74-54.83',
          '54.83-58.92', '58.92-63.02', '63.02-67.11', '67.11-71.21', '71.21-75.30',
          '75.30-79.39', '79.39-83.49', '83.49-87.58', '87.58-91.67', '91.67-95.77',
          '95.77-99.86'],
        'Internet Access': ['0.00-4.92', '4.92-9.83', '9.83-14.75', '14.75-19.66',
          '19.66-24.58', '24.58-29.50', '29.50-34.41', '34.41-39.33', '39.33-44.25',
          '44.25-49.16', '49.16-54.08', '54.08-58.99', '58.99-63.91', '63.91-68.83',
          '68.83-73.74', '73.74-78.66', '78.66-83.58', '83.58-88.49', '88.49-93.41',
          '93.41-98.32'],
        'Electricity Access': ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30',
          '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70',
          '70-75', '75-80', '80-85', '85-90', '90-95', '95-100'],
        CO2: ['(0-0.111) E+ 11', '(0.111-0.222) E+ 11', '(0.222-0.333) E+ 11',
          '(0.333-0.444) E+ 11', '(0.444-0.555) E+ 11', '(0.555-0.666) E+ 11',
          '(0.666-0.777) E+ 11', '(0.777-0.888) E+ 11', '(0.888-0.999) E+ 11',
          '(0.999-1.110) E+ 11', '(1.110-1.221) E+ 11', '(1.221-1.332) E+ 11',
          '(1.332-1.443) E+ 11', '(1.443-1.554) E+ 11', '(1.554-1.665) E+ 11',
          '(1.665-1.776) E+ 11', '(1.776-1.887) E+ 11', '(1.887-1.998) E+ 11',
          '(1.998-2.109) E+ 11', '(2.109-2.220) E+ 11'],
        'Merch Exports': ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30',
          '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70',
          '70-75', '75-80', '80-85', '85-90', '90-95', '95-100'],
        'Merch Imports': ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30',
          '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70',
          '70-75', '75-80', '80-85', '85-90', '90-95', '95-100'],
        'Mobile Subscription': ['0.0-16.1', '16.1-32.2', '32.2-48.3', '48.3-64.4', '64.4-80.5',
          '80.5-96.5', '96.5-112.6', '112.6-128.7', '128.7-144.8', '144.8-160.9', '160.9-177.0',
          '177.0-193.1', '193.1-209.2', '209.2-225.3', '225.3-241.4', '241.4-257.4', '257.4-273.5',
          '273.5-289.6', '289.6-305.7', '305.7-321.8']
      };

      const descriptions = {
        Sanitation: `Percentage of population using at least basic sanitation
                     services. Basic sanitation services are defined as
                     sanitation facilities that are not shared with other households.`,
        'Death Rate': `Deaths per 1,000 people, per year, using the population of a
                       country at midyear as the number of people`,
        'Drinking Water': `The percentage of population using at least basic
                           water services. Basic drinking water services are
                           defined as drinking water from a improved source,
                           provided collection time is not more than 30 minutes
                           for a round trip.  Improved water sources include piped
                           water, boreholes or tubewells, protected dug wells,
                           protected springs, and packaged or delivered water`,
        Fertility: `Total fertility rate represents the number of children that
                    would be born to a woman if she were to live to the end of
                    her childbearing years and bear children in accordance with
                    age-specific fertility rates of the specified year.`,
        'Life Expectancy': `Life expectancy at birth indicates the number of
                            years a newborn infant would live if prevailing
                            patterns of mortality at the time of its birth were
                            to stay the same throughout its life.`,
        'Labor Participation': `Labor force participation rate is the proportion
                                of the population ages 15 and older that is
                                economically active: all people who supply labor
                                for the production of goods and services during
                                a specified period.`,
        'Internet Access': `Percentage of population that uses the internet. Internet
                            users are individuals who have used the Internet
                            (from any location, via any technology) in the last 3 months.`,
        'Electricity Access': `Percentage of population with access to electricity.
                               Electrification data are collected from industry,
                               national surveys, and international sources.`,
        CO2: `Carbon dioxide emissions in metric tons, per capita. CO2 emissions
              are those stemming from the burning of fossil fuels and the
              manufacture of cement. They include carbon dioxide produced during
              consumption of solid, liquid, and gas fuels and gas flaring.`,
        'Merch Exports': `Merchandise exports to high-income economies are the
                          sum of merchandise exports from the reporting economy
                          to high-income economies according to the World Bank
                          classification of economies. Data are expressed as a
                          percentage of total merchandise exports by the economy.`,
        'Merch Imports': `Merchandise imports from high-income economies are the
                          sum of merchandise imports by the reporting economy from
                          high-income economies according to the World Bank classification
                          of economies. Data are expressed as a percentage of total
                          merchandise imports by the economy.`,
        'Mobile Subscription': `Mobile cellular telephone subscriptions are
                               subscriptions to a public mobile telephone service
                               that provide access to the PSTN using cellular technology.
                               The indicator includes the number of postpaid subscriptions,
                               and the number of active prepaid accounts (i.e. that have
                               been used during the last three months). The indicator applies
                               to all mobile cellular subscriptions that offer voice
                               communications. It excludes subscriptions via data cards, USB modems, etc.`
      };

      const indicators = Object.keys(myData);
      const processedData = {};
      indicators.forEach((indicator) => {
        const years = getYears(myData[indicator]);
        processedData[indicator] = {
          data: processData(myData[indicator]),
          labels: labels[indicator],
          years
        };
      });

      this.setState({
        myData,
        processedData,
        indicator: 'Sanitation',
        lastIndicator: 'Not set',
        descriptions
      });
    });
  }

  render() {
    const indicator = this.state.indicator;
    let selectedData = this.state.myData[this.state.indicator];
    if (selectedData === undefined) {
      selectedData = [];
    }

    const indicatorText = indicator ? this.state.descriptions[indicator] : '';
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>世界发展指标可视化</h1>
        </header>
        <div className="main-content">
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>指标选择</h2>
            </div>
            <div className="filter-container">
              <Filter
                modifyIndicator={(val) => {
                  const country = this.state.country;
                  const currData = findStateData(this.state.myData[val],
                                    getDataName(this.state.country));
                  const minYear = this.state.processedData[val].years.minYear;
                  const maxYear = this.state.processedData[val].years.maxYear;
                  const selectedYear = this.state.year;
                  let newYear = selectedYear < minYear ? minYear : selectedYear;
                  newYear = selectedYear > maxYear ? maxYear : newYear;
                  let currVal = '';
                  if (country !== null) {
                    currVal = !isNaN(currData[newYear]) ? currData[newYear] : '无数据';
                  }

                  this.setState({
                    indicator: val,
                    year: newYear,
                    currVal
                  });
                }}
                indicator={this.state.indicator}
              />
            </div>
          </aside>
          <main className="content-area">
            <div className="map-container">
              <MapComponent
                country={this.state.country}
                modifyCountry={(d) => {
                  const year = this.state.year;
                  const currData = findStateData(this.state.myData[indicator],
                                    getDataName(d));
                  let currVal = '无数据';
                  if (currData !== undefined && !isNaN(currData[year])) {
                    currVal = currData[year];
                  }

                  this.setState({
                    country: d,
                    currVal
                  });
                }}
                width={1000}
                data={selectedData}
                year={this.state.year}
                indicator={this.state.indicator}
              />
              <div className="slider-container">
                <div className="info-container">
                  <p>选定年份：{this.state.year}</p>
                  <p>选定国家：{this.state.country || '未选择'}</p>
                  <p>当前值：{this.state.currVal || '无数据'}</p>
                </div>
              </div>
              <SliderComponent
                  year={this.state.year}
                  modifyYear={(y) => {
                    const country = this.state.country;
                    const currData = findStateData(this.state.myData[indicator],
                        getDataName(country));
                    let currVal = '';
                    if (country !== null) {
                      currVal = !isNaN(currData[y]) ? currData[y] : '无数据';
                    }

                    this.setState({
                      year: y,
                      currVal
                    });
                  }}
                  indicator={this.state.indicator}
                  processedData={this.state.processedData}
              />
            </div>
            <div className="grid-container">
              <GridView
                indicator={this.state.indicator}
                lastIndicator={this.state.lastIndicator}
                processedData={this.state.processedData}
                country={this.state.country}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }
}

RootComponent.displayName = 'RootComponent';
export default RootComponent;
