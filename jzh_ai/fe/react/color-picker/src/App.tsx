import * as React from 'react';
import ColorBrower from './components/ColorBrower';
import type { Color } from './model/color';
import { useState } from 'react';
import ColorPicker from './components/ColorPicker';
import MemberTable from './components/MemberTable';



const App: React.FC = () => {
  const [color, setColor] = useState<Color>({
    red: 20,
    green: 40,
    blue: 180,
  });
  return (
    <>
      <ColorBrower color={color} />
      <ColorPicker color={color} onClorUpdated={setColor} />
      <MemberTable />
    </>
  )
}

export default App;
