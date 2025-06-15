// src/components/EmployeeForm.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, InputLabel, FormControl, Select, FormHelperText
} from '@mui/material';
import { getStates } from '../Services/api';

export default function EmployeeForm({ open, handleClose, handleSave, initialData }) {
  const [form, setForm] = useState(initialData || {});
  const [states, setStates] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getStates().then(res => setStates(res.data));
    setForm(initialData || {});
    setErrors({});
  }, [initialData, open]);

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
    const updatedForm = { ...form, [name]: value };
    if (name === 'DOB') {
      updatedForm.Age = calculateAge(value);
    }
    setForm(updatedForm);
    setErrors((prev) => ({ ...prev, [name]: '' })); // clear error
  };

  const validate = () => {
    const newErrors = {};
    if (!form.Name) newErrors.Name = 'Name is required';
    if (!form.Designation) newErrors.Designation = 'Designation is required';
    if (!form.DOB) newErrors.DOB = 'Date of Birth is required';
    if (!form.DOJ) newErrors.DOJ = 'Date of Joining is required';
    if (!form.Salary || isNaN(form.Salary)) newErrors.Salary = 'Valid salary is required';
    if (!form.Gender) newErrors.Gender = 'Gender is required';
    if (!form.State) newErrors.State = 'State is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;
    handleSave({
      ...form,
      Salary: parseFloat(form.Salary),
      DOB: form.DOB?.toString(),
      DOJ: form.DOJ?.toString()
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{form?.Id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Name" name="Name"
              value={form.Name || ''} onChange={handleChange}
              error={!!errors.Name} helperText={errors.Name}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Designation" name="Designation"
              value={form.Designation || ''} onChange={handleChange}
              error={!!errors.Designation} helperText={errors.Designation}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth type="date" name="DOB" label="DOB"
              InputLabelProps={{ shrink: true }}
              value={form.DOB || ''} onChange={handleChange}
              error={!!errors.DOB} helperText={errors.DOB}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Age" value={form.Age || ''} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth type="date" name="DOJ" label="Date of Joining"
              InputLabelProps={{ shrink: true }}
              value={form.DOJ || ''} onChange={handleChange}
              error={!!errors.DOJ} helperText={errors.DOJ}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth type="number" name="Salary" label="Salary"
              value={form.Salary || ''} onChange={handleChange}
              error={!!errors.Salary} helperText={errors.Salary}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.Gender}>
              <InputLabel>Gender</InputLabel>
              <Select name="Gender" value={form.Gender || ''} onChange={handleChange}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
              <FormHelperText>{errors.Gender}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.State}>
              <InputLabel>State</InputLabel>
              <Select name="State" value={form.State || ''} onChange={handleChange}>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.State}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSave}>Save</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
