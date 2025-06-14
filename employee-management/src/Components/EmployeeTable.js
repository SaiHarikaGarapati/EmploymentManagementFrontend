import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getEmployees } from '../Services/api';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox, TextField
} from '@mui/material';
import $ from 'jquery';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';





function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const recordsPerPage = 5;
const [employeeToEdit, setEmployeeToEdit] = useState(null);
const [reportOpen, setReportOpen] = useState(false);


  const [formData, setFormData] = useState({
  Id: '',
  Name: '',
  DOB: '',
  DOJ: '',
  Designation: '',
  Salary: '',
  Gender: '',
  State: ''
});
const [editMode, setEditMode] = useState(false);
const downloadPDF = () => {
  const doc = new jsPDF();

  doc.text("Employee List", 14, 15);

  const tableColumn = ["Name", "Email", "Mobile", "Address", "Designation", "Gender", "DOB", "Salary"];
  const tableRows = [];

  employees.forEach(emp => {
    const row = [
      emp.Name,
      emp.Email,
      emp.Mobile,
      emp.Address,
      emp.Designation,
      emp.Gender,
      emp.DOB,
      emp.Salary
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save("employee_list.pdf");
};



  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
  getEmployees()
    .then(res => {
      setEmployees(res.data);
      setTimeout(() => calculateTotalSalary(), 100); // Delay to ensure DOM is updated
    })
    .catch(err => console.error('Error fetching employees', err));

};


  const handleDelete = () => {
    axios.delete(`https://localhost:7295/api/employee/${employeeToDelete.Id}`)
      .then(() => {
        alert("Employee deleted successfully!");
        setDeleteDialogOpen(false);
        loadEmployees();
      })
      .catch(err => {
        console.error("Delete failed", err);
        alert("Failed to delete employee.");
      });
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      const allIds = filteredEmployees.map(emp => emp.id);
      setSelectedIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

const clearForm = () => {
  setFormData({
    Id: '',
    Name: '',
    DOB: '',
    DOJ: '',
    Designation: '',
    Salary: '',
    Gender: '',
    State: ''
  });
};

const openEditDialog = (emp) => {
  setFormData({
    id: emp.Id,
    name: emp.Name || '',
    dob: emp.DOB?.substring(0, 10) || '',
    doj: emp.DOJ?.substring(0, 10) || '',
    designation: emp.Designation || '',
    salary: emp.Salary || '',
    gender: emp.Gender || '',
    state: emp.State || ''
  });
  setEditMode(true);
};

const closeEditDialog = () => {
  clearForm();
  setEditMode(false);
};

const handleUpdate = () => {
  axios.put(`https://localhost:7295/api/employee/${formData.id}`, formData)
    .then(() => {
      alert('Employee updated successfully!');
      closeEditDialog();
      loadEmployees();
    })
    .catch(err => {
      console.error("Update failed", err);
      alert("Failed to update employee.");
    });
};


  const filteredEmployees = employees.filter(emp =>
    (emp.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField]?.toString().toLowerCase();
    const valB = b[sortField]?.toString().toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedEmployees.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(sortedEmployees.length / recordsPerPage);
  useEffect(() => {
  calculateTotalSalary();
}, [currentRecords]);

const calculateTotalSalary = () => {
  setTimeout(() => {
    let total = 0;
    $('.salary-cell').each(function () {
      const value = parseFloat($(this).text()) || 0;
      total += value;
    });
    $('#totalSalaryValue').text(total.toFixed(2));
  }, 0);
};

  return (
    <Paper style={{ marginTop: '20px', padding: '16px' }}>
      <Typography variant="h6" gutterBottom>Employee List</Typography>
      <TextField
        label="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox checked={selectAll} onChange={handleSelectAll} />
            </TableCell>
            {['name', 'dob', 'doj', 'designation', 'salary', 'gender', 'state'].map(col => (
              <TableCell key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
                {col.toUpperCase()}
              </TableCell>
            ))}
            <TableCell align="center">DELETE</TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {currentRecords.map(emp => (
            <TableRow key={emp.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => handleCheckboxChange(emp.id)}
                />
              </TableCell>
              <TableCell style={{ cursor: 'pointer', color: 'blue' }} onClick={() => openEditDialog(emp)}>
  {emp.Name}
</TableCell>

              <TableCell>{emp.DOB ? new Date(emp.DOB).toLocaleDateString() : 'N/A'}</TableCell>
<TableCell>{emp.DOJ ? new Date(emp.DOJ).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell>{emp.Designation}</TableCell>
<TableCell className="salary-cell">{emp.Salary}</TableCell>
<TableCell>{emp.Gender}</TableCell>
<TableCell>{emp.State}</TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setEmployeeToDelete(emp);
                    setDeleteDialogOpen(true);
                  }}
                >
                  DELETE
                </Button>
              </TableCell>
              
            </TableRow>
          ))}
          <TableRow>
    <TableCell colSpan={4} style={{ fontWeight: 'bold' }} id="totalSalaryCell">
      Total Salary: ₹ <span id="totalSalaryValue">0</span>
    </TableCell>
    <TableCell> <Button
  variant="outlined"
  color="secondary"
  onClick={downloadPDF}
  style={{ marginLeft: '10px' }}>
Download PDF</Button>
</TableCell>
<TableCell><Button
  variant="contained"
  color="primary"
  style={{ marginBottom: '16px' }}
  onClick={() => setReportOpen(true)}
>
  View Report
</Button>
</TableCell>

  </TableRow>
        </TableBody>
      </Table>
      

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >Previous</Button>
        <Typography>Page {currentPage} of {totalPages}</Typography>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >Next</Button>
      </div>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{employeeToDelete?.Name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">No</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Yes</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editMode} onClose={closeEditDialog}>
  <DialogTitle>Edit Employee</DialogTitle>
  <DialogContent>
    <TextField
      margin="dense"
      label="Name"
      fullWidth
      value={formData.Name}
      onChange={(e) => handleChange('name', e.target.value)}
    />
    <TextField
      margin="dense"
      label="DOB"
      type="date"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={formData.DOB}
      onChange={(e) => handleChange('dob', e.target.value)}
    />
    <TextField
      margin="dense"
      label="DOJ"
      type="date"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={formData.DOJ}
      onChange={(e) => handleChange('doj', e.target.value)}
    />
    <TextField
      margin="dense"
      label="Designation"
      fullWidth
      value={formData.Designation}
      onChange={(e) => handleChange('designation', e.target.value)}
    />
    <TextField
      margin="dense"
      label="Salary"
      type="number"
      fullWidth
      value={formData.Salary}
      onChange={(e) => handleChange('salary', e.target.value)}
    />
    <TextField
      margin="dense"
      label="Gender"
      fullWidth
      value={formData.Gender}
      onChange={(e) => handleChange('gender', e.target.value)}
    />
    <TextField
      margin="dense"
      label="State"
      fullWidth
      value={formData.State}
      onChange={(e) => handleChange('state', e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={clearForm} color="secondary">Clear Form</Button>
    <Button onClick={closeEditDialog} color="primary">Cancel</Button>
    <Button onClick={handleUpdate} color="success" variant="contained">Update</Button>
  </DialogActions>
</Dialog>
<Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="lg">
  <DialogTitle>Employee Report</DialogTitle>
  <DialogContent>
    <iframe
      src="https://localhost:7295/api/employee/report"
      width="100%"
      height="600px"
      title="Employee Report"
      frameBorder="0"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setReportOpen(false)} color="primary">Close</Button>
  </DialogActions>
</Dialog>


    </Paper>
  );
}

export default EmployeeTable;
