import axiosClient from '../lib/api/axiosClient';

const testService = {
    ping: () => axiosClient.get('/test'),
};

export default testService;
