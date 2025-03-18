const config = {
  apiPath: 'http://localhost:3000',
  headers: () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
};
export default config;
