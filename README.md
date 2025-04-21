# 🛍️ E-Shop Frontend

A modern, responsive e-commerce frontend built with React, Vite, and TailwindCSS that connects to the E-Shop API backend.

![React](https://img.shields.io/badge/React-19.0.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.2.0-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0.9-teal)
![React Router](https://img.shields.io/badge/React%20Router-7.2.0-red)
![React Query](https://img.shields.io/badge/React%20Query-5.67.2-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Backend API](#backend-api)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

This project serves as the frontend for the E-Shop e-commerce platform. It provides a seamless shopping experience with interactive product browsing, cart management, secure checkout, user authentication, and order tracking features.

## ✨ Features

- **Responsive Design** - Fully responsive across all device sizes
- **User Authentication** - Registration, login, and profile management
- **Product Catalog** - Browse products with filtering and search
- **Shopping Cart** - Add/remove items with real-time updates
- **Checkout Process** - Streamlined payment flow with Stripe integration
- **Order Management** - Track order status and history
- **Admin Dashboard** - Sales analytics and inventory management

## 💻 Tech Stack

- **[React 19](https://react.dev/)** - Latest React version with improved performance
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** - Declarative routing for React
- **[React Query](https://tanstack.com/query/latest)** - Data fetching and state management
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Vitest](https://vitest.dev/)** - Next-generation testing framework

## 🏗️ Project Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── components/     # Reusable UI components
│   ├── common/     # Shared components (buttons, inputs, etc.)
│   ├── layout/     # Layout components (header, footer, etc.)
│   └── [feature]/  # Feature-specific components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and services
├── pages/          # Route-level page components
├── services/       # API service modules
├── styles/         # Global styles and TailwindCSS config
├── App.jsx         # Main application component
└── main.jsx        # Application entry point
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0097eo/frontera.git
   cd eshop-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173/
   ```

## ▶️ Available Scripts

In the project directory, you can run:

- **Development Server**
  ```bash
  npm run dev
  ```
  Runs the app in development mode at [http://localhost:5173](http://localhost:5173)

- **Build for Production**
  ```bash
  npm run build
  ```
  Builds the app for production to the `dist` folder

- **Preview Production Build**
  ```bash
  npm run preview
  ```
  Previews the production build locally

- **Linting**
  ```bash
  npm run lint
  ```
  Runs ESLint to check for code quality issues

- **Run Tests**
  ```bash
  npm run test
  ```
  Runs Vitest in watch mode

- **Test Coverage**
  ```bash
  npm run test:coverage
  ```
  Generates test coverage report

- **UI Tests**
  ```bash
  npm run test:ui
  ```
  Runs Vitest with UI interface

## 🧪 Testing

This project uses Vitest and React Testing Library for testing:

- **Unit Tests** - Test individual components and functions

Run tests with:
```bash
npm run test
```

View test coverage with:
```bash
npm run test:coverage
```

## 🌐 Deployment

### Building for Production

1. Update environment variables for production
2. Build the project
   ```bash
   npm run build
   ```
3. The `dist` folder will contain optimized files ready for deployment

### Deployment Options

- **Netlify/Vercel**
  - Connect your GitHub repository
  - Set build command to `npm run build`
  - Set publish directory to `dist`

- **Traditional Hosting**
  - Upload the contents of the `dist` folder to your server
  - Configure server to handle SPA routing

## 🔌 Backend API

This frontend connects to the [E-Shop API](https://github.com/0097eo/eshop) backend using Axios.

Key API endpoints:

```
# Authentication
POST /api/accounts/register/
POST /api/accounts/login/

# Products
GET /api/products/
GET /api/products/{id}/

# Cart & Orders
GET /api/orders/cart/
POST /api/orders/cart/items/
POST /api/orders/

# Payments
POST /api/payments/process/
```

## 🖥️ User Interface

### Pages

- **Home** - Featured products and promotions
- **Product Catalog** - Browse all products with filters
- **Product Detail** - View product information and add to cart
- **Cart** - Review items and update quantities
- **Wishlist** - Add or remove products from the wishlist
- **Checkout** - Shipping, billing, and payment
- **Account** - User profile and order history

### Key Components

- **Header** - Navigation, search, user menu, and cart icon
- **ProductCard** - Display product with image, title, price
- **CartSidebar** - Slide-in cart view with items and totals
- **Checkout Flow** - Multi-step checkout process
- **Auth Forms** - Login and registration forms
- **OrderSummary** - Order details and status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License 

---

Built with ❤️ using React, Vite, and TailwindCSS