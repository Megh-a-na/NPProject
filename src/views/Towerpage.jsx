import React, {useState} from 'react';
import SimpleDropdown from '../components/Tower-visualization/Localitydropdown';
import EntryBox from '../components/Tower-visualization/Towerentry';
import MyForm from '../components/Tower-visualization/SubmitButton';
import MyFormClear from '../components/Tower-visualization/cleartower';

function Towerpagefn() {
    const [dropdownvalue, setDropDownValue] = useState("");
    const [towervalue, setTowerValue] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Process the form data here
        console.log("Dropdown Value:", dropdownvalue);
        console.log("Tower Entry Value:", towervalue);

        // You can perform additional actions such as sending data to an API here.
      };

    const handleClear = (e) => {
        e.preventDefault();
        setTowerValue("");
        setDropDownValue("");
        console.log("Tower value cleared");
      };

    return (
        <form
        style={{
            position: 'fixed',           // fixed relative to the viewport
            top: '10vh',                 // start 10% from the top of the viewport
            left: '50%',                 // center horizontally
            transform: 'translateX(-50%)', // adjust for true centering
            width: '90vw',               // container width is 90% of viewport width
            maxWidth: '600px',           // limit maximum width
            display: 'flex',
            flexDirection: 'column',     // stack elements vertically
            alignItems: 'center',
            gap: '5px'                  // fixed gap between elements (50px)
        }}
    >
      <SimpleDropdown 
        value = {dropdownvalue}
        onChange={(e) => setDropDownValue(e.target.value)} 
      />
      <EntryBox 
        value = {towervalue}
        onChange={(e) => setTowerValue(e.target.value)}
      />
      <div
      style={{display: 'flex',
      flexDirection: 'row'}}
      >
        <MyForm
            onClick={handleSubmit}
        />
        <MyFormClear
            onClick={handleClear}
        />
      </div>
      
    </form>
    );
}

export default Towerpagefn;