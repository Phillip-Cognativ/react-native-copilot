// @flow
import React, { Component } from 'react';

import type { CopilotContext } from '../types';

type Props = {
  name: string,
  text: string,
  order: number,
  highlightOffset: object,
  active?: boolean,
  _copilot: CopilotContext,
  children: React$Element
};

class ConnectedCopilotStep extends Component<Props> {
  static defaultProps = {
    active: true,
  };

  componentDidMount() {
    if (this.props.active) {
      this.register();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active !== this.props.active) {
      if (nextProps.active) {
        this.register();
      } else {
        this.unregister();
      }
    }
  }

  componentWillUnmount() {
    this.unregister();
  }

  setNativeProps(obj) {
    this.wrapper.setNativeProps(obj);
  }

  register() {
    this.props._copilot.registerStep({
      name: this.props.name,
      text: this.props.text,
      order: this.props.order,
      target: this,
      wrapper: this.wrapper,
    });
  }

  unregister() {
    this.props._copilot.unregisterStep(this.props.name);
  }

  measure() {
    if (typeof __TEST__ !== 'undefined' && __TEST__) { // eslint-disable-line no-undef
      return new Promise(resolve => resolve({
        x: 0, y: 0, width: 0, height: 0,
      }));
    }

    return new Promise((resolve, reject) => {
      const measure = () => {
        // Wait until the wrapper element appears
        if (this.wrapper && this.wrapper.measure) {

          this.wrapper.measure(
            ((ox, oy, width, height, x, y) => {

              let xOffest = 0;
              let yOffest = 0;
              let widthOffest = 0;
              let heightOffest = 0;

              if(this.props.highlightOffset){
                if(this.props.highlightOffset.x){ xOffest = this.props.highlightOffset.x; }
                if(this.props.highlightOffset.y){ yOffest = this.props.highlightOffset.y; }
                if(this.props.highlightOffset.width){ widthOffest = this.props.highlightOffset.width; }
                if(this.props.highlightOffset.height){ heightOffest = this.props.highlightOffset.height; }
              }

              resolve({ x: x + xOffest, y: y + yOffest, width: width + widthOffest, height: height + heightOffest });

            }).bind(this),
            reject,
          );
        } else {
          requestAnimationFrame(measure);
        }
      };

      requestAnimationFrame(measure);
    });
  }

  render() {
    const copilot = {
      ref: (wrapper) => { this.wrapper = wrapper; },
      onLayout: () => { }, // Android hack
    };

    return React.cloneElement(this.props.children, { copilot });
  }
}

export default ConnectedCopilotStep;
