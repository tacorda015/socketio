const axios = require('axios');
const io = require("socket.io")(3000, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected.');

    let interval = null;

    const fetchData = async (type) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/output-monitorings/${type}`);
            const data = response.data.data;
            socket.emit('update', data);
            console.log(`Emitted ${type} data to client`);
        } catch (error) {
            console.error('Error fetching data from backend:', error);
        }
    };

    socket.on('fetchData', (type) => {
        console.log(`Received fetchData event with type: ${type}`);

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        fetchData(type);
        interval = setInterval(() => {
            fetchData(type);
        }, 50000);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected.');
        clearInterval(interval);
    });
});

console.log('Server is running on port 3000');
