import React from 'react';

class FilterInput extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
        className={this.props.classes}
        id={this.props.id}
        type="button"
        value={this.props.value}
        onClick={(e) => {
          const activeButton = document.getElementsByClassName('active')[0];
          if (activeButton) {
            activeButton.classList.remove('active');
          }
          e.target.classList.add('active');
          this.props.modifyIndicator(e.target.value);
        }}
      >
        {this.props.displayText}
      </button>
    );
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const filtersInfo = [
      '卫生设施', '死亡率',
      '饮用水', '生育率', '预期寿命',
      '劳动参与', '互联网接入',
      '电力接入', '二氧化碳排放', '商品出口',
      '商品进口', '移动电话'
    ];

    const filterValues = [
      'Sanitation', 'Death Rate',
      'Drinking Water', 'Fertility', 'Life Expectancy',
      'Labor Participation', 'Internet Access',
      'Electricity Access', 'CO2', 'Merch Exports',
      'Merch Imports', 'Mobile Subscription'
    ];

    const filters = [];
    filtersInfo.forEach((fInfo, index) => {
      const classes = index === 0 ? 'filter-input active' : 'filter-input';
      filters.push(
        <FilterInput
          key={`filter-${index}`}
          classes={classes}
          value={filterValues[index]}
          displayText={fInfo}
          modifyIndicator={this.props.modifyIndicator}
        />
      );
    });

    return (
      <div className="filter-list">
        {filters}
      </div>
    );
  }
}

export default Filter;
