// import React, { useState } from 'react';

// function EntryBox() {
//   const [value, setValue] = useState('');

//   const handleChange = (event) => {
//     setValue(event.target.value);
//   };

//   return (
//     <>
//     <div
//       style={{
//         position: 'fixed',         // Position relative to the viewport
//         top: '5%',                 // 5% down from the top of the viewport
//         left: '40%',               // Center horizontally at 50%
//         transform: 'translateX(-60%)', // Shift left by 50% of the container's width for perfect centering
//         width: '40vw',             // 90% of the viewport width
//         height: '15vh',
//         maxWidth: '600px',         // Optionally limit the maximum width
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center'
//       }}
//     >
//       <p style={{ marginBottom: '50px', textAlign: 'center' }}>
//         Enter number of towers
//       </p>
//       <input
//         type="text"
//         value={value}
//         onChange={handleChange}
//         placeholder="Enter text here"
//         style={{
//           width: '85vw',         // 50% of the viewport width
//           height: '10px',          // 5% of the viewport height
//           margin: '1%',
//           padding: '1%',
//           fontSize: '15px',
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           position: 'absolute',
//           top: '50%',              // 5% from the top of the container (or viewport if using fixed positioning)
//           left: '26%'   
//         }}
//       />
//     </div>
//     </>
//   );
// }

// export default EntryBox;

import React, { useState } from 'react';

function EntryBox({value, onChange}) {

  // const handleChange = (event) => {
  //   setValue(event.target.value);
  // };
  

  return (
    <>
    <div style={{display: 'flex',
        flexDirection: 'column',     // stack elements vertically
        alignItems: 'center',
        gap: '1px'}}>
    <h4 style={{ marginBottom: '5px', textAlign: 'center' }}>
         Enter number of towers
       </h4>
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder="Enter number of towers here"
      style={{
        width: '85vw',          // take full width of the container
        height: '2vh',           // height relative to viewport height
        padding: '1%',
        fontSize: '1rem',        // relative font size
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    />
    </div>
    </>
  );
}

export default EntryBox;
