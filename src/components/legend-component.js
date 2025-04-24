import React from 'react';
import {json} from 'd3-fetch';

class LegendComponent extends React.Component {
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

    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    return (
      <div className="legend-component">
        <svg className="legend">
          { legend }
        </svg>
      </div>
    );
  }
}

LegendComponent.displayName = 'LegendComponent';
export default LegendComponent;
