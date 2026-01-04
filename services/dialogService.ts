import Swal from 'sweetalert2';

export const DialogService = {
  success: (message: string) => {
    return Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 3000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  },

  error: (message: string) => {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 3000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  },

  warning: (message: string) => {
    return Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: message,
      timer: 3000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  },

  confirm: (message: string, title: string = 'Are you sure?', useHtml: boolean = false) => {
    return Swal.fire({
      title,
      [useHtml ? 'html' : 'text']: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    });
  }
};