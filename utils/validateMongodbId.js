const mongoose = require('mongoose');
const validateMongoDbId = (id) => {
    console.log(`Validating ID: ${id}`);
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error("This is not valid");
};

module.exports = validateMongoDbId;