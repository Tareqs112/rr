import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import customerService from '../../services/customers';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const isEditMode = Boolean(id);

  const validationSchema = Yup.object({
    full_name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone number is required'),
    nationality: Yup.string(),
    whatsapp: Yup.string(),
    company_name: Yup.string(),
    is_vip: Yup.boolean(),
    is_repeat_customer: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      full_name: '',
      phone: '',
      nationality: '',
      whatsapp: '',
      company_name: '',
      is_vip: false,
      is_repeat_customer: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await customerService.updateCustomer(id, values);
          setSuccess('Customer updated successfully');
        } else {
          await customerService.createCustomer(values);
          setSuccess('Customer created successfully');
          formik.resetForm();
        }
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/customers');
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await customerService.getCustomerById(id);
          const customer = response.customer;
          
          formik.setValues({
            full_name: customer.full_name || '',
            phone: customer.phone || '',
            nationality: customer.nationality || '',
            whatsapp: customer.whatsapp || '',
            company_name: customer.company_name || '',
            is_vip: customer.is_vip || false,
            is_repeat_customer: customer.is_repeat_customer || false
          });
        } catch (err) {
          setError('Failed to fetch customer details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomer();
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
        {isEditMode ? 'Edit Customer' : 'Add New Customer'}
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
                id="full_name"
                name="full_name"
                label="Full Name"
                variant="outlined"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                helperText={formik.touched.full_name && formik.errors.full_name}
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
                id="nationality"
                name="nationality"
                label="Nationality"
                variant="outlined"
                value={formik.values.nationality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nationality && Boolean(formik.errors.nationality)}
                helperText={formik.touched.nationality && formik.errors.nationality}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="whatsapp"
                name="whatsapp"
                label="WhatsApp Number (if different)"
                variant="outlined"
                value={formik.values.whatsapp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.whatsapp && Boolean(formik.errors.whatsapp)}
                helperText={formik.touched.whatsapp && formik.errors.whatsapp}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="company_name"
                name="company_name"
                label="Company/Agency Name"
                variant="outlined"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                helperText={formik.touched.company_name && formik.errors.company_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    id="is_vip"
                    name="is_vip"
                    checked={formik.values.is_vip}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label="VIP Customer"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    id="is_repeat_customer"
                    name="is_repeat_customer"
                    checked={formik.values.is_repeat_customer}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label="Repeat Customer"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/customers')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Add Customer'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CustomerForm;
