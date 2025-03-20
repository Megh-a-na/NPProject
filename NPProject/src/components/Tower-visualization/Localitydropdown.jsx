// // import React, { useState } from 'react';

// // function SimpleDropdown() {
// //   // Set initial state to an empty string so that the placeholder is shown.
// //   const [selected, setSelected] = useState('');

// //   const handleChange = (event) => {
// //     setSelected(event.target.value);
// //   };

// //   return (
// //     <div style={{ position: 'relative', padding: '1rem', width: '100%' }}>
// //       <select 
// //         value={selected} 
// //         onChange={handleChange}
// //         style={{
// //           width: '700px',         // sets the width
// //           height: '40px',          // sets the height
// //           margin: '1px',          // adds margin around the dropdown
// //           padding: '5px',          // inner spacing
// //           fontSize: '16px',        // font size for the text
// //           border: '1px solid #ccc',// border style
// //           borderRadius: '4px',     // rounded corners
// //           position: 'absolute',    // allows you to position it using top/left/right/bottom
// //           top: '5px',             // 50px from the top of the parent container
// //           left: '5px'             // 50px from the left of the parent container
// //         }}>
// //         {/* This option serves as the placeholder */}
// //         <option value="" disabled>
// //           Select Locality
// //         </option>
// //         {/* Other selectable options */}
// //         <option value="option1">Option 1</option>
// //         <option value="option2">Option 2</option>
// //         <option value="option3">Option 3</option>
// //       </select>
// //     </div>
// //   );
// // }


// // export default SimpleDropdown;


// import React, { useState } from 'react';

// function SimpleDropdown() {
//   const [selected, setSelected] = useState('');

//   const handleChange = (event) => {
//     setSelected(event.target.value);
//   };

//   return (
//     <div style={{ position: 'relative', padding: '1rem', width: '100%' }}>
//       <select 
//         value={selected} 
//         onChange={handleChange}
//         style={{
//           width: '87vw',         // 50% of the viewport width
//           height: '5vh',          // 5% of the viewport height
//           margin: '1%',
//           padding: '1%',
//           fontSize: '15px',        // relative to viewport width
//           border: '1px solid #ccc',
//           borderRadius: '4px',
//           position: 'absolute',
//           top: '5%',              // 5% from the top of the container (or viewport if using fixed positioning)
//           left: '5%'              // 5% from the left side
//         }}>
//         <option value="" disabled>
//           Select Locality
//         </option>
//         <option value="option1">Option 1</option>
//         <option value="option2">Option 2</option>
//         <option value="option3">Option 3</option>
//       </select>
//     </div>
//   );
// }

// export default SimpleDropdown;
// 


import React, { useState } from 'react';

function SimpleDropdown({value,onChange}) {

  return (
    <>
    <div>
      <h4 style={{ marginBottom: '1px', textAlign: 'center' }}>
         Enter number of towers
       </h4>
    </div>
    <div>
    <select 
      value={value} 
      onChange={onChange}
      style={{
        width: '87vw',          // take full width of the container
        height: '6.5vh',           // height relative to viewport height
        padding: '1%',
        fontSize: '1rem',        // relative font size
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    >
      <option value="" disabled>
        Select Locality
      </option>
      <option value="Whitefield">Whitefield</option>
      <option value="Andheri">Andheri</option>
      <option value="Gurgaon">Gurgaon</option>
      <option value="Salt Lake">Salt Lake</option>
    </select>
    </div>
    </>
  );
}

export default SimpleDropdown;
