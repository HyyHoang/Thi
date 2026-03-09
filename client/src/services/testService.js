import axiosClient from '../api/axiosClient';

const testService = {
    ping: () => axiosClient.get('/test')
};

export default testService;