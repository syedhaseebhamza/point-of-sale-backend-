const mongoose = require("mongoose");

const usersPermissionSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  actionIds: [
    {
      type: Array,
      required: true,
    },
  ],
});

const UsersPermission = mongoose.model(
  "UsersPermission",
  usersPermissionSchema
);
module.exports = UsersPermission;
