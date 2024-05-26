const mongoose = require('mongoose');
const validateMongoDbId = (id) => {
    const inValid = mongoose.Types.ObjectId.isValid(id);
    if (!inValid) throw new Error("This is not valid");
};

module.exports = {validateMongoDbId};