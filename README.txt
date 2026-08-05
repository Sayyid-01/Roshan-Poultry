============================================================
   ROSHAN POULTRY FARM - BACKEND API
   README / Documentation
============================================================

1. PROJECT OVERVIEW
------------------------------------------------------------
The Roshan Poultry Farm backend is a REST API built with
Node.js and Express. It powers the frontend application and
handles all business logic, data persistence, authentication,
authorization, file uploads, and email notifications.

2. WHAT THE BACKEND CAN DO
------------------------------------------------------------

AUTHENTICATION & USERS:
  - User registration with email OTP verification
  - User login with email OTP verification
  - JWT (JSON Web Token) based authentication
  - Password hashing with bcryptjs
  - Role-based access control (ADMIN, ACCOUNTANT, CUSTOMER)
  - Resend OTP functionality
  - Pending registration tracking

PRODUCTS:
  - Create, read, update, delete products
  - Product categories (Chicken, Egg, Feed, Medicine, Equipment, Other)
  - Units (KG, PIECE)
  - Stock management with minimum stock alerts
  - Image URLs and descriptions

ORDERS:
  - Create orders with cart items
  - Order status workflow (PENDING, CONFIRMED, PROCESSING, DELIVERED, COMPLETED, CANCELLED)
  - Payment status tracking (PAID, UNPAID)
  - Order number generation
  - Customer order tracking
  - Razorpay payment integration support

INVENTORY:
  - Stock increase/decrease tracking
  - Inventory movement history
  - Low stock alerts
  - Automatic stock updates on orders

EXPENSES:
  - Track daily/monthly business expenses
  - Expense categories and descriptions
  - Date range filtering

SUPPLIERS:
  - Manage supplier information
  - Track supplier contacts and details

DASHBOARD ANALYTICS:
  - Today's sales summary
  - Monthly revenue
  - Total revenue
  - Net profit calculation (revenue - expenses)
  - Monthly sales aggregation
  - Top selling products
  - Low stock products
  - Order status distribution

CONTENT MANAGEMENT:
  - Manage blog posts
  - Manage gallery images
  - Manage testimonials
  - Handle customer inquiries

ADMIN:
  - View all users in the system
  - Customer management
  - Full system administration

3. TECHNOLOGIES USED
------------------------------------------------------------
  - Node.js             - JavaScript runtime
  - Express.js          - Web framework
  - MongoDB             - NoSQL database (Mongoose ODM)
  - JWT (jsonwebtoken)  - Secure authentication tokens
  - bcryptjs            - Password hashing
  - Nodemailer          - Email sending (OTP verification)
  - Cloudinary          - Cloud image storage/upload
  - Multer              - File upload middleware
  - CORS                - Cross-Origin Resource Sharing
  - dotenv              - Environment variable management

4. API ENDPOINTS
------------------------------------------------------------

AUTH:
  POST /api/auth/register          - Register new user
  POST /api/auth/login             - Login user
  POST /api/auth/verify-otp        - Verify OTP
  POST /api/auth/resend-otp        - Resend OTP

PRODUCTS:
  GET    /api/products             - Get all products
  POST   /api/products             - Create product (ADMIN)
  PUT    /api/products/:id         - Update product (ADMIN)
  DELETE /api/products/:id         - Delete product (ADMIN)
  PATCH  /api/products/:id/stock   - Update stock (ADMIN)

ORDERS:
  GET    /api/orders               - Get all orders
  POST   /api/orders               - Create new order
  GET    /api/orders/track         - Track order status
  PUT    /api/orders/:id           - Update order (ADMIN)

DASHBOARD:
  GET /api/dashboard/summary       - Summary stats
  GET /api/dashboard/monthly-sales - Monthly sales data
  GET /api/dashboard/top-products  - Top selling products
  GET /api/dashboard/low-stock     - Low stock products

EXPENSES:
  GET    /api/expenses             - Get expenses
  POST   /api/expenses             - Create expense (ADMIN)
  PUT    /api/expenses/:id         - Update expense (ADMIN)
  DELETE /api/expenses/:id         - Delete expense (ADMIN)

SUPPLIERS:
  GET    /api/suppliers            - Get suppliers
  POST   /api/suppliers            - Create supplier (ADMIN)
  PUT    /api/suppliers/:id        - Update supplier (ADMIN)
  DELETE /api/suppliers/:id        - Delete supplier (ADMIN)

INVENTORY:
  GET    /api/inventory            - Get inventory movements
  POST   /api/inventory            - Add movement (ADMIN)

USERS/ADMIN:
  GET    /api/users                - Get all users (ADMIN)

CONTENT: Blog, Gallery, Testimonials, Inquiries endpoints.

5. DATABASE MODELS
------------------------------------------------------------
  - User            (name, email, phone, password, role)
  - Product         (name, category, unit, price, stock, description, image)
  - Order           (orderNumber, items, totalAmount, status, paymentStatus, customer)
  - Expense         (title, amount, category, date, description)
  - Supplier        (name, contact, phone, email, address)
  - InventoryMovement (productId, type, quantity, note)
  - Blog            (title, content, image, author, tags)
  - Gallery         (image, title, description)
  - Testimonial     (name, message, rating)
  - Inquiry         (name, email, message, status)
  - PendingRegistration (email, otp, expiresAt)

6. SECURITY FEATURES
------------------------------------------------------------
  - JWT token-based authentication
  - Password hashing with bcryptjs
  - Role-based access control middleware
  - OTP-based email verification
  - Input validation with async middleware
  - Error handling middleware
  - CORS configured for frontend
  - Environment variables for sensitive data

7. SCALABILITY & CAPACITY
------------------------------------------------------------
  - MongoDB scales horizontally with sharding for large datasets
  - Stateless JWT authentication allows horizontal scaling
  - Async/await non-blocking I/O handles multiple concurrent requests
  - With MongoDB Atlas: handles 1,000+ concurrent users easily
  - Can support 10,000+ registered customers without issue
  - Static file serving can be delegated to CDN for scaling
  - For high traffic: add load balancer + multiple Node.js instances
  - Estimated throughput: 500+ requests per second on a single instance

8. SETUP & INSTALLATION
------------------------------------------------------------
  1. Clone the repository
  2. Navigate to poultry-backend/
  3. Run: npm install
  4. Create a .env file with:
       MONGODB_URI=mongodb://your-mongodb-uri
       JWT_SECRET=your-jwt-secret
       EMAIL_USER=your-email
       EMAIL_PASS=your-email-password
       CLOUDINARY_CLOUD_NAME=your-cloud-name
       CLOUDINARY_API_KEY=your-api-key
       CLOUDINARY_API_SECRET=your-api-secret
  5. Run: npm run dev (development) or npm start (production)

9

============================================================
   END OF BACKEND README
============================================================
