import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://keycloak.vitalis.nesechete.com/realms/nesechete/protocol/openid-connect/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export default apiClient;
