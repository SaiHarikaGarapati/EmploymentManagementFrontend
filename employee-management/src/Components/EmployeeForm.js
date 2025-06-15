// src/components/EmployeeForm.js
import React, { useEffect, useState, useRef } from 'react';
import $ from 'jquery';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, InputLabel, FormControl, Select
} from '@mui/material';
import { getStates } from '../Services/api';
import 'jquery-validation/dist/jquery.validate.min.js';
import { Snackbar, Alert } from '@mui/material';
export default function EmployeeForm({ open, handleClose, handleSave, initialData, employees }) 
 {
  const [form, setForm] = useState(initialData || {});
  const [states, setStates] = useState([]);
  const formRef = useRef();
const [duplicateOpen, setDuplicateOpen] = useState(false);
const handleDuplicateClose = () => {
  setDuplicateOpen(false);
};

  useEffect(() => {
    getStates().then(res => setStates(res.data));
    setForm(initialData || {});
  }, [initialData]);

  useEffect(() => {
    if (open) {
      const $form = $("#empForm");

      $form.validate({
        rules: {
          Name: "required",
          Designation: "required",
          DOB: "required",
          DOJ: "required",
          Salary: {
            required: true,
            number: true
          },
          Gender: "required",
          State: "required"
        },
        messages: {
          Name: "Please enter name",
        },
        submitHandler: function () {
  const isDuplicate = employees?.some(emp =>
    emp.Name.trim().toLowerCase() === form.Name?.trim().toLowerCase() &&
    emp.DOB?.substring(0, 10) === form.DOB?.substring(0, 10) &&
    (!form.Id || emp.Id !== form.Id)
  );

  if (isDuplicate) {
    setTimeout(() => setDuplicateOpen(true), 0);

    return;
  }

  handleSave({
    ...form,
    Salary: parseFloat(form.Salary) || 0,
    DOB: form.DOB?.toString(),
    DOJ: form.DOJ?.toString()
  });
}


      });
    }

    return () => {
      $("#empForm").off(); // remove validation on unmount
    };
  }, [form, open]);

  const calculateAge = (DOB) => {
    const birth = new Date(DOB);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    if (name === 'DOB') {
      newForm.Age = calculateAge(value);
    }
    setForm(newForm);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{form?.Id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <form id="empForm" ref={formRef}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth name="Name" label="Name" value={form.Name || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth name="Designation" label="Designation" value={form.Designation || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="date" name="DOB" label="DOB" InputLabelProps={{ shrink: true }}
                value={form.DOB || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Age" value={form.Age || ''} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="date" name="DOJ" label="Date of Joining" InputLabelProps={{ shrink: true }}
                value={form.DOJ || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" name="Salary" label="Salary" value={form.Salary || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="Gender" value={form.Gender || ''} onChange={handleChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select name="State" value={form.State || ''} onChange={handleChange}>
                  {states.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Save</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </form>
      <Snackbar open={duplicateOpen} autoHideDuration={4000} onClose={handleDuplicateClose}>
  <Alert onClose={handleDuplicateClose} severity="warning" sx={{ width: '100%' }}>
    Employee with the same Name and DOB already exists.
  </Alert>
</Snackbar>

    </Dialog>
  );
}
