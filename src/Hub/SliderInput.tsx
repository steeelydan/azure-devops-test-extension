import * as React from 'react';
import { Slider } from '@material-ui/core';
import './SliderInput.scss';

interface SliderInputProps {
    label: string;
    value: number;
    name: string;
    onChange: Function;
    disabled: boolean;
}

const SliderInput: React.SFC<SliderInputProps> = props => {
    return (
        <div className="slider-wrapper">
            <div className="slider-label">
                <label> {props.label}</label>
            </div>
            <div className="slider-input">
                <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={props.value}
                    onChange={(event, value) => {
                        props.onChange(props.name, value);
                    }}
                    disabled={props.disabled}
                ></Slider>
            </div>
            <div className="slider-value">{props.value}</div>
        </div>
    );
};

export default SliderInput;
