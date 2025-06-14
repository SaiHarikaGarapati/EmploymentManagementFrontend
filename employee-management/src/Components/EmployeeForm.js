// src/components/EmployeeForm.js
import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid, InputLabel, FormControl, Select
} from '@mui/material';
import { getStates, getEmployees, createEmployee } from '../Services/api';
import 'jquery-validation/dist/jquery.validate.min.js'; 

export default function EmployeeForm({ open, handleClose, handleSave, initialData }) {
  const [form, setForm] = useState(initialData || {});
  const [states, setStates] = useState([]);

  useEffect(() => {
    getStates().then(res => setStates(res.data));
    setForm(initialData || {});
  }, [initialData]);

  useEffect(() => {
    $("#empForm").validate({
      rules: {
        Name: "required",
        Designation: "required",
        DOB: "required",
        DOJ: "required",
        Salary: "required"
      },
      messages: {
        Name: "Please enter name"
      },
      submitHandler: () => handleSave(form)
    });
  }, [form]);

  const calculateAge = (DOB) => {
    const birth = new Date(DOB);
    const age = new Date().getFullYear() - birth.getFullYear();
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{form?.Id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <form id="empForm">
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth name="Name" label="Name" value={form.Name || ''} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth name="Designation" label="Designation" value={form.Designation || ''} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="date" name="DOB" label="DOB" InputLabelProps={{ shrink: true }}
                value={form.DOB || ''} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Age" value={form.Age || ''} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="date" name="DOJ" label="Date of Joining" InputLabelProps={{ shrink: true }}
                value={form.DOJ || ''} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" name="Salary" label="Salary" value={form.Salary || ''} onChange={handleChange} required />
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
                  {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
    </Dialog>
  );
}
