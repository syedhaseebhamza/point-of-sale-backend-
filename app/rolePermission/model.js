const mongoose = require("mongoose");

const usersPermissionSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const UsersPermission = mongoose.model(
  "UsersPermission",
  usersPermissionSchema
);
module.exports = UsersPermission;
