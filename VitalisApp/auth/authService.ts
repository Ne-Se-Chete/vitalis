import axios from 'axios';

const keycloakURL = 'https://keycloak.vitalis.nesechete.com/realms/nesechete/protocol/openid-connect/token'; // Your Keycloak URL

interface TokenResponse {
  access_token: string;
}

// Function to get the initial access token
export const getAccessToken = async (username: string, password: string): Promise<string> => {
  const postData = new URLSearchParams();
  postData.append('grant_type', 'password');
  postData.append('client_id', process.env.CLIENT_ID); // Use the environment variable for client_id
  postData.append('username', username);
  postData.append('password', password);

  try {
    const response = await axios.post<TokenResponse>(keycloakURL, postData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token; // Return the access token
  } catch (error) {
    console.error('Token request failed:', error);
    throw new Error('Token request failed');
  }
};

// Function to exchange the access token for another token (e.g., for API access)
export const exchangeToken = async (subject_token: string): Promise<string> => {
  const postData = new URLSearchParams();
  postData.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
  postData.append('client_id', process.env.CLIENT_ID); // Use the environment variable for client_id
  postData.append('subject_token', subject_token); // Use the access token from the previous step

  if (process.env.AUDIENCE) {
    postData.append('audience', process.env.AUDIENCE); // If an audience is provided, add it to the request
  }

  try {
    const response = await axios.post<TokenResponse>(keycloakURL, postData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token; // Return the exchanged access token
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw new Error('Token exchange failed');
  }
};

// Function to handle the entire flow: get access token and then exchange it
export const getExchangedToken = async (username: string, password: string): Promise<string> => {
  try {
    // Step 1: Get the access token
    const accessToken = await getAccessToken(username, password);

    // Step 2: Exchange the access token for another token
    const exchangedToken = await exchangeToken(accessToken);

    return exchangedToken; // Return the final exchanged token
  } catch (error) {
    console.error('Failed to get exchanged token:', error);
    throw new Error('Failed to get exchanged token');
  }
};
