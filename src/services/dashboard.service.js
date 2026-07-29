const mongoose = require("mongoose");

const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Supplier = require("../models/supplier.model");
const Expense = require("../models/expense.model");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthRange = () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
};

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

const getDashboardSummary = async () => {
  const { start: todayStart, end: todayEnd } = getTodayRange();

  const { start: monthStart, end: monthEnd } = getMonthRange();

  const [
    todaySalesResult,
    monthlyRevenueResult,
    totalRevenueResult,
    totalExpenseResult,

    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,

    totalCustomers,
    totalProducts,
    totalSuppliers,
    lowStockProducts,
  ] = await Promise.all([
    /*
    |--------------------------------------------------------------------------
    | Today's Sales
    |--------------------------------------------------------------------------
    */

    Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]),

    /*
    |--------------------------------------------------------------------------
    | Monthly Revenue
    |--------------------------------------------------------------------------
    */

    Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: {
            $gte: monthStart,
            $lt: monthEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]),

    /*
    |--------------------------------------------------------------------------
    | Total Revenue
    |--------------------------------------------------------------------------
    */

    Order.aggregate([
      {
        $match: {
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]),

    /*
    |--------------------------------------------------------------------------
    | Total Expenses
    |--------------------------------------------------------------------------
    */

    Expense.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    /*
    |--------------------------------------------------------------------------
    | Orders Count
    |--------------------------------------------------------------------------
    */

    Order.countDocuments(),

    Order.countDocuments({
      status: "PENDING",
    }),

    Order.countDocuments({
      status: "COMPLETED",
    }),

    Order.countDocuments({
      status: "CANCELLED",
    }),

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    User.countDocuments({
      role: "CUSTOMER",
    }),

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    Product.countDocuments({
      isActive: true,
    }),

    /*
    |--------------------------------------------------------------------------
    | Suppliers
    |--------------------------------------------------------------------------
    */

    Supplier.countDocuments(),

    /*
    |--------------------------------------------------------------------------
    | Low Stock
    |--------------------------------------------------------------------------
    |
    | Currently stock <= 10
    | Later you can replace with minimumStock
    |--------------------------------------------------------------------------
    */

    Product.countDocuments({
      stock: {
        $lte: 10,
      },
      isActive: true,
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Extract Aggregation Results
  |--------------------------------------------------------------------------
  */

  const todaySales =
    todaySalesResult.length > 0
      ? todaySalesResult[0].total
      : 0;

  const monthlyRevenue =
    monthlyRevenueResult.length > 0
      ? monthlyRevenueResult[0].total
      : 0;

  const totalRevenue =
    totalRevenueResult.length > 0
      ? totalRevenueResult[0].total
      : 0;

  const totalExpenses =
    totalExpenseResult.length > 0
      ? totalExpenseResult[0].total
      : 0;

  const netProfit = totalRevenue - totalExpenses;

  return {
    success: true,

    data: {
      sales: {
        today: todaySales,
        monthly: monthlyRevenue,
        total: totalRevenue,
      },

      expenses: {
        total: totalExpenses,
      },

      profit: {
        net: netProfit,
      },

      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },

      customers: {
        total: totalCustomers,
      },

      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },

      suppliers: {
        total: totalSuppliers,
      },
    },
  };
};

/*
|--------------------------------------------------------------------------
| Monthly Sales Chart
|--------------------------------------------------------------------------
*/

const getMonthlySales = async () => {
  const currentYear = new Date().getFullYear();

  const sales = await Order.aggregate([
    {
      $match: {
        status: "COMPLETED",
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1),
        },
      },
    },

    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt",
          },
        },
        sales: {
          $sum: "$totalAmount",
        },
      },
    },

    {
      $sort: {
        "_id.month": 1,
      },
    },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedData = months.map((month, index) => {
    const found = sales.find(
      (item) => item._id.month === index + 1
    );

    return {
      month,
      sales: found ? found.sales : 0,
    };
  });

  return {
    success: true,
    data: formattedData,
  };
};

/*
|--------------------------------------------------------------------------
| Top Selling Products
|--------------------------------------------------------------------------
*/

const getTopProducts = async (limit = 10) => {
  const products = await Order.aggregate([
    {
      $match: {
        status: "COMPLETED",
      },
    },

    {
      $unwind: "$items",
    },

    {
      $group: {
        _id: "$items.product",

        product: {
          $first: "$items.name",
        },

        quantitySold: {
          $sum: "$items.quantity",
        },

        revenue: {
          $sum: "$items.total",
        },
      },
    },

    {
      $sort: {
        quantitySold: -1,
      },
    },

    {
      $limit: limit,
    },

    {
      $project: {
        _id: 0,
        product: 1,
        quantitySold: 1,
        revenue: 1,
      },
    },
  ]);

  return {
    success: true,
    count: products.length,
    data: products,
  };
};


/*
|--------------------------------------------------------------------------
| Low Stock Products
|--------------------------------------------------------------------------
*/

const getLowStockProducts = async () => {
  const LOW_STOCK_LIMIT = 10;

  const products = await Product.find(
    {
      isActive: true,
      stock: { $lte: LOW_STOCK_LIMIT },
    },
    {
      name: 1,
      category: 1,
      stock: 1,
      price: 1,
      _id: 1,
    }
  )
    .sort({ stock: 1 })
    .lean();

  const data = products.map((product) => ({
    id: product._id,
    name: product.name,
    category: product.category,
    stock: product.stock,
    price: product.price,
    minimumStock: LOW_STOCK_LIMIT,
  }));

  return {
    success: true,
    count: data.length,
    data,
  };
};

module.exports = {
  getDashboardSummary,
  getMonthlySales,
  getTopProducts,
  getLowStockProducts,
};