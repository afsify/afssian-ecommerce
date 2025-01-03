# Afssian E-Commerce - Electronics Store

Afssian E-Commerce is a full-stack electronics e-commerce platform offering a seamless shopping experience with a responsive design and user-friendly interface. This project is designed to simplify online shopping with features like a secure wallet, multiple payment options, and efficient order management.

## Features

### User-Focused Features
- **Wallet**: Securely store funds and use them for seamless transactions.
- **Payment Through Razorpay**: Enjoy safe and quick online payment options.
- **Simplified Checkout**: Hassle-free purchase process for an effortless experience.
- **Order Tracking**: Monitor the status of your orders in real time.
- **Coupon Offers**: Redeem discounts and exclusive deals to save on purchases.

### Admin-Focused Features
- **Stock Management**: Admin can efficiently track and manage product inventory.
- **Multer for Image Uploads**: Easily upload product images for the product catalog.

### Technical Features
- **AJAX for Cart**: Instant updates to the cart without page reloads.

## Technologies Used

- **Frontend**:
  - HTML
  - CSS
  - JavaScript
  - EJS
  - Bootstrap

- **Backend**:
  - Node.js
  - Express.js

- **Database**:
  - MongoDB

## Setup Instructions

To set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/afsify/afssian-ecommerce.git
   ```

2. **Navigate to the Project Directory**:
   ```bash
   cd afssian-ecommerce
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
    MONGO_URL = mongo-atlas-url
    EMAIL = smtp-gmail-email
    KEY_ID = razorpay-secret-key
    PASSWORD = smtp-gmail-password
    KEY_SECRET = session-secret-key
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```

6. **Access the Application**:
   Open your browser and go to `http://localhost:5000`.

## Future Enhancements

- Adding user reviews and ratings for products.
- Enhancing search and filter functionalities.
- Implementing email notifications for order updates.
