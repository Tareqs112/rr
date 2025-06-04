import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import driverService from '../../services/drivers';

const DriverForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isEditMode = Boolean(id);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone number is required'),
    license_number: Yup.string().required('License number is required'),
    languages: Yup.string(),
    status: Yup.string().oneOf(['available', 'off'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      license_number: '',
      languages: '',
      status: 'available'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await driverService.updateDriver(id, values);
          setSuccess('Driver updated successfully');
        } else {
          await driverService.createDriver(values);
          setSuccess('Driver created successfully');
          formik.resetForm();
        }
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/drivers');
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    const fetchDriver = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await driverService.getDriverById(id);
          const driver = response.driver;
          
          formik.setValues({
            name: driver.name || '',
            phone: driver.phone || '',
            license_number: driver.license_number || '',
            languages: driver.languages || '',
            status: driver.status || 'available'
          });
        } catch (err) {
          setError('Failed to fetch driver details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDriver();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Driver' : 'Add New Driver'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                variant="outlined"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                variant="outlined"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="license_number"
                name="license_number"
                label="License Number"
                variant="outlined"
                value={formik.values.license_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.license_number && Boolean(formik.errors.license_number)}
                helperText={formik.touched.license_number && formik.errors.license_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="languages"
                name="languages"
                label="Languages (comma separated)"
                variant="outlined"
                value={formik.values.languages}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.languages && Boolean(formik.errors.languages)}
                helperText={formik.touched.languages && formik.errors.languages}
                placeholder="English, Spanish, French"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="off">Off</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/drivers')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Driver' : 'Add Driver'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverForm;
