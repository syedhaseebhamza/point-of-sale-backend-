const Sales = require("./model");
const mongoose = require("mongoose");
const Categories = require("../catagary/model");
const Items = require("../item/model");
const generateOrderId= require("../../utils/generateOrderID")

// Handle to Place Order
async function handlePlaceOrder(req, res) {
  const user = await req.user;
  const { categoryData, productData, totalPrice, discount, isDraft } = req.body;
  const orderId = generateOrderId()

  if (
    !categoryData ||
    !Array.isArray(categoryData) ||
    categoryData.length === 0
  ) {
    return res.status(400).json({ message: "Invalid or empty categoryData" });
  }

  const categoryIds = categoryData?.map((category) => category.categoryId);
  const invalidCategoryIds = categoryIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidCategoryIds.length > 0) {
    return res.status(400).json({
      message: `Invalid CategoryId(s): ${invalidCategoryIds.join(", ")}`,
    });
  }

  const existingCategories = await Categories.find({
    _id: { $in: categoryIds },
  });

  const existingCategoryIds = existingCategories.map((category) =>
    category._id.toString()
  );
  const notFoundCategoryIds = categoryIds.filter(
    (id) => !existingCategoryIds.includes(id)
  );

  if (notFoundCategoryIds.length > 0) {
    return res.status(404).json({
      message: `CategoryId(s) not found: ${notFoundCategoryIds.join(", ")}`,
    });
  }

  const transformedCategoryData = existingCategories.map((category) => ({
    categoryId: category._id,
    categoryName: category.name,
  }));

  if (!productData || !Array.isArray(productData) || productData.length === 0) {
    return res.status(400).json({ message: "Invalid or empty productData" });
  }

  const productIds = productData.map((product) => product.productId);
  const invalidProductIds = productIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidProductIds.length > 0) {
    return res.status(400).json({
      message: `Invalid ProductId(s): ${invalidProductIds.join(", ")}`,
    });
  }

  const existingItems = await Items.find({
    _id: { $in: productIds },
  });

  const existingItemIds = existingItems.map((item) => item._id.toString());

  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];

    if (!product.productName) {
      return res
        .status(400)
        .json({ message: `ProductName is required for product ${i + 1}` });
    }

    if (!product.productPrice) {
      return res
        .status(400)
        .json({ message: `ProductPrice is required for product ${i + 1}` });
    }

    if (typeof product.productQuantity !== "number") {
      return res.status(400).json({
        message: `ProductQuantity must be a number for product ${i + 1}`,
      });
    }
  }

  if (typeof totalPrice !== "number" || totalPrice == null) {
    return res
      .status(400)
      .json({ message: "TotalPrice must be a valid number" });
  }

  if (typeof discount !== "number") {
    return res.status(400).json({ message: "Discount must be a number" });
  }

  try {
    const newOrder = new Sales({
      categoryData: transformedCategoryData,
      productData,
      totalPrice,
      discount,
      isDraft,
      orderId,
      createdBy: user.userId,
    });
    await newOrder.save();
    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    return res.status(500).json({ message: "Error placing order", error });
  }
}

// Handle to Get Draft Orders
async function handelGetAllDraftOrders(req, res) {
  const { isDraft } = req.query;
  const user = await req.user;
  try {
    const query = isDraft ? { isDraft: true, isDeleted: false, createdBy: user.userId } : {
      isDeleted: false,
      createdBy: user.userId,
      isDraft: false
    };
    const orders = await Sales.find(query);
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
}

// Handle to Get All Orders
async function handelGetAllOrders(req, res) {
  const { isDraft, date, page = 1, limit = 10 } = req.query;
  const user = await req.user;

  try {
    const query = isDraft
      ? { isDraft: true, isDeleted: false, createdBy: user.userId }
      : {
          isDeleted: false,
          createdBy: user.userId,
          isDraft: false,
        };

    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setUTCHours(23, 59, 59, 999);
      
      const startDatePKT = new Date(startDate.getTime() + 5 * 60 * 60 * 1000);
      const endDatePKT = new Date(endDate.getTime() + 5 * 60 * 60 * 1000);
      
      query.createdAt = {
        $gte: startDatePKT,
        $lte: endDatePKT,
      };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Sales.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

      const querySale = {
          isDeleted: false,
          createdBy: user.userId,
          isDraft: false,
          status:"delivered"
        };

        if (date) {
          const startDate = new Date(date);
          startDate.setUTCHours(0, 0, 0, 0);
          
          const endDate = new Date(startDate);
          endDate.setUTCHours(23, 59, 59, 999);
          
          const startDatePKT = new Date(startDate.getTime() + 5 * 60 * 60 * 1000);
          const endDatePKT = new Date(endDate.getTime() + 5 * 60 * 60 * 1000);
          
          querySale.createdAt = {
            $gte: startDatePKT,
            $lte: endDatePKT,
          };
        }
      
    const totalOrders = await Sales.find(querySale).sort({createdAt: -1});
    const totalSale = Math.round(totalOrders.reduce((sum, order) => sum + order.totalPrice, 0) * 100) / 100; 
    const countOrders = await Sales.find(querySale).countDocuments();

    const totalCount = totalOrders.length;
    const totalPages = Math.ceil(totalCount / limitNumber);

    const formatTimeInPKT = (date) => {
      const options = { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true,
          timeZone: 'Asia/Karachi'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  
  const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      orderTime: formatTimeInPKT(order.createdAt),
  }));

  const formattedExportOrders = totalOrders.map(order => ({
    ...order.toObject(),
    orderTime: formatTimeInPKT(order.createdAt),
}));

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: formattedOrders,
      forExport:formattedExportOrders,
      totalSale,
      countOrders,
      currentPage: pageNumber,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching orders", error });
  }
}


// Handle to Update the Order
async function handleUpdateOrder(req, res) {
  const { id } = req.params;

  try {
    const updatedSale = await Sales.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({ message: "Sale updated successfully", updatedSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Handle to Delete draft Order
async function handleDeleteOrder(req, res) {
  const { id } = req.params;
  try {
    const order = await Sales.findByIdAndUpdate(
      id,
      { isDeleted: true },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting order", error });
  }
}

module.exports = {
  handlePlaceOrder,
  handelGetAllDraftOrders,
  handelGetAllOrders,
  handleUpdateOrder,
  handleDeleteOrder,
};
