// Ensure we clean up connections after all tests are done
const mongoose = require('mongoose');

afterAll(async () => {
    // Await database connection closure to prevent jest from hanging
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});