import React from 'react';

class SliderComponent extends React.Component {
  render() {
    const indicator = this.props.indicator;
    const minYear = indicator ? this.props.processedData[indicator].years.minYear : 1960;
    const maxYear = indicator ? this.props.processedData[indicator].years.maxYear : 2017;

    return (
      <div className="slider-container">
        <button
          id="slider__prev-button"
          className="slider__prev"
          type="button"
          onClick={(e) => {
            let newVal = Number(this.props.year - 1);
            if (newVal < minYear) {
              newVal = minYear;
            }

            this.props.modifyYear(newVal);
          }}>
          Previous
        </button>

        <input
          className="slider"
          type="range"
          min={minYear}
          max={maxYear}
          value={Number(this.props.year)}
          onChange={(e) => this.props.modifyYear(Number(e.currentTarget.value))}
          />
        <button
          id="slider__next-button"
          className="slider__next"
          type="button"
          onClick={(e) => {
            let newVal = Number(this.props.year) + 1;
            if (newVal > maxYear) {
              newVal = maxYear;
            }

            this.props.modifyYear(newVal);
          }}
          value="->"
          >
          Next
        </button>
      </div>
    );
  }
}

export default SliderComponent;
