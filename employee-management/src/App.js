import React, { useState } from 'react';
import EmployeeForm from './Components/EmployeeForm';
import EmployeeTable from './Components/EmployeeTable';
import { Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DesignationSalaryChart from "./Components/SalaryDesignationChart";
import axios from 'axios';


function App() {
  const [openForm, setOpenForm] = useState(false);
  const handleSave = async (formData) => {
    try {
      const response = await axios.post('https://localhost:7295/api/Employee', formData);
      console.log('Employee saved:', response.data);
      setOpenForm(false); // Close dialog after saving
      // Optionally: refresh the employee list here
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Employee Management</h2>
      <Button variant="contained" onClick={() => setOpenForm(true)}>Add Employee</Button>
      <EmployeeForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        handleSave={handleSave}></EmployeeForm>
        <EmployeeTable/>
      <DesignationSalaryChart />
    </div>
  );
}


export default App;
