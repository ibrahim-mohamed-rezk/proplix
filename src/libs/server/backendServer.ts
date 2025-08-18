import axios from "axios";

// Create an Axios instance
const backendServer = axios.create({
  baseURL: "https://proplix.shop/api/v1/",

  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Example of a GET request
export const getData = async (
  endpoint: string,
  params?: any,
  headers?: any
) => {
  try {
    const response = await backendServer.get(endpoint, { params, headers });
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Example of a POST request
export const postData = async <T = any>(endpoint: string, data: any, headers?: any): Promise<T> => {
  try {
    const response = await backendServer.post(endpoint, data, {
      headers: { ...headers },
    });
    return response.data as T;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const deleteData = async <T = any>(
  endpoint: string,
  headers?: any
): Promise<T> => {
  try {
    const response = await backendServer.delete(endpoint, {
      headers: { ...headers },
    });
    return response.data as T;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export default backendServer;
