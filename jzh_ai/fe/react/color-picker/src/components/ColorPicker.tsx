import * as React from 'react';
import type { Color } from '../model/color';
interface Props {
  color: Color;
  onClorUpdated:(color:Color) => void;
}
const ColorPicker: React.FC<Props> = (props) => {
  return (
    <div>
      <input type="range" min={0} max={255}  value={props.color.red} onChange={
        event=>{
          props.onClorUpdated({
            ...props.color,
            red: Number(event.target.value),
          })
        }
      }/>
      {props.color.red}
      <br />
      <input type="range" min={0} max={255}  value={props.color.green} onChange={
        event=>{
          props.onClorUpdated({
            ...props.color,
            green: Number(event.target.value),
          })
        }
      }/>
      {props.color.green}
      <br />
      <input type="range" min={0} max={255}  value={props.color.blue} onChange={
        event=>{
          props.onClorUpdated({
            ...props.color,
            blue: Number(event.target.value),
          })
        }
      }/>
      {props.color.blue}
      <br />
    </div>
  )
}
export default ColorPicker;