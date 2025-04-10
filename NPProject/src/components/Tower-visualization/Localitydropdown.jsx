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
         Choose Locality
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
      <option value="Andheri">Andheri</option>
      <option value="Anna Nagar">Anna Nagar</option>
      <option value="Banashankari">Banashankari</option>
      <option value="Bandra">Bandra</option>
      <option value="Banjara Hills">Banjara Hills</option>
      <option value="BTM Layout">BTM Layout</option>
      <option value="Chandni Chowk">Chandni Chowk</option>
      <option value="Colaba">Colaba</option>
      <option value="Connaught Place">Connaught Place</option>
      <option value="Dadar">Dadar</option>
      <option value="Dwarka">Dwarka</option>
      <option value="Gurgaon">Gurgaon</option>
      <option value="Greater Kailash">Greater Kailash</option>
      <option value="Hebbal">Hebbal</option>
      <option value="HSR Layout">HSR Layout</option>
      <option value="Indiranagar">Indiranagar</option>
      <option value="Jayanagar">Jayanagar</option>
      <option value="Jubilee Hills">Jubilee Hills</option>
      <option value="Khar">Khar</option>
      <option value="Koramangala">Koramangala</option>
      <option value="Lajpat Nagar">Lajpat Nagar</option>
      <option value="Malleshwaram">Malleshwaram</option>
      <option value="Mulund">Mulund</option>
      <option value="Noida Sector 18">Noida Sector 18</option>
      <option value="Parel">Parel</option>
      <option value="Rohini">Rohini</option>
      <option value="Salt Lake">Salt Lake</option>
      <option value="Secunderabad">Secunderabad</option>
      <option value="Sector 18">Sector 18</option>
      <option value="South Extension">South Extension</option>
      <option value="Vashi">Vashi</option>
      <option value="Viman Nagar">Viman Nagar</option>
      <option value="Whitefield">Whitefield</option>


    </select>
    </div>
    </>
  );
}

export default SimpleDropdown;
