const config = {
  apiPath: 'http://45.76.148.88:3000',
  headers: () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
};
export default config;
