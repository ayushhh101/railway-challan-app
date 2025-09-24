import toast from 'react-hot-toast';

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  let message = defaultMessage;
  
  // Extract error message from different response structures
  if (error?.response?.data?.error?.message) {
    // Your new consistent error structure
    message = error.response.data.error.message;
  } else if (error?.response?.data?.message) {
    // Legacy error structure
    message = error.response.data.message;
  } else if (error?.message) {
    // Direct error message
    message = error.message;
  }
  
  toast.error(message);
  return message;
};

export const handleApiSuccess = (data, defaultMessage = 'Success') => {
  const message = data?.message || defaultMessage;
  toast.success(message);
  return message;
};