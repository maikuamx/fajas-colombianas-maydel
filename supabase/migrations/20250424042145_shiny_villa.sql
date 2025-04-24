/*
  # E-commerce Database Schema

  1. New Tables
    - `categories` - Product categories hierarchy
    - `products` - Main product information
    - `product_variants` - Different versions of products (size, color, etc.)
    - `product_images` - Images associated with products
    - `inventory` - Stock tracking for products
    - `users` - Extended user profile information
    - `carts` - Shopping carts for users
    - `cart_items` - Items in shopping carts
    - `orders` - Customer orders
    - `order_items` - Items in customer orders
    - `reviews` - Product reviews from customers
    - `discounts` - Promotional discounts and coupons
    - `payment_methods` - Saved payment methods for users
    - `shipping_addresses` - Saved shipping addresses for users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public access to product information
    - Add admin-only policies for inventory management
*/

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  compare_at_price decimal(10, 2),
  cost_price decimal(10, 2),
  sku text UNIQUE,
  barcode text,
  category_id uuid REFERENCES categories(id),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sku text UNIQUE,
  price decimal(10, 2),
  compare_at_price decimal(10, 2),
  cost_price decimal(10, 2),
  weight decimal(10, 2),
  weight_unit text,
  options jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  position integer DEFAULT 0,
  is_thumbnail boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  warehouse_location text,
  reorder_point integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT product_or_variant_required CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL) OR
    (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Extended User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  email_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Shopping Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_session_required CHECK (
    (user_id IS NOT NULL) OR (session_id IS NOT NULL)
  )
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL DEFAULT 1,
  price_at_add decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10, 2) NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax_amount decimal(10, 2) DEFAULT 0,
  shipping_amount decimal(10, 2) DEFAULT 0,
  discount_amount decimal(10, 2) DEFAULT 0,
  shipping_address jsonb,
  billing_address jsonb,
  payment_method text,
  payment_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  discount_amount decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  description text,
  discount_type text NOT NULL,
  discount_value decimal(10, 2) NOT NULL,
  minimum_purchase decimal(10, 2) DEFAULT 0,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_type text NOT NULL,
  provider text NOT NULL,
  account_number text,
  expiry_date text,
  is_default boolean DEFAULT false,
  billing_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Shipping Addresses Table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Row Level Security Policies

-- Categories - Public read access, admin write access
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

-- Products - Public read access for active products, admin write access
CREATE POLICY "Active products are viewable by everyone" 
  ON products FOR SELECT 
  USING (is_active = true);

-- Product Variants - Public read access for active variants, admin write access
CREATE POLICY "Active product variants are viewable by everyone" 
  ON product_variants FOR SELECT 
  USING (is_active = true);

-- Product Images - Public read access, admin write access
CREATE POLICY "Product images are viewable by everyone" 
  ON product_images FOR SELECT 
  USING (true);

-- Inventory - Admin only access
CREATE POLICY "Inventory is viewable by admins only" 
  ON inventory FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ));

-- User Profiles - Users can view and edit their own profiles
CREATE POLICY "Users can view their own profile" 
  ON user_profiles FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON user_profiles FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Carts - Users can view and manage their own carts
CREATE POLICY "Users can view their own carts" 
  ON carts FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert into their own carts" 
  ON carts FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own carts" 
  ON carts FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own carts" 
  ON carts FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Cart Items - Users can view and manage items in their own carts
CREATE POLICY "Users can view items in their own carts" 
  ON cart_items FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert items into their own carts" 
  ON cart_items FOR INSERT 
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update items in their own carts" 
  ON cart_items FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items from their own carts" 
  ON cart_items FOR DELETE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  ));

-- Orders - Users can view their own orders, admins can manage all orders
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ));

-- Order Items - Users can view items in their own orders
CREATE POLICY "Users can view items in their own orders" 
  ON order_items FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ));

-- Reviews - Public read access, authenticated users can create reviews
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can create their own reviews" 
  ON reviews FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" 
  ON reviews FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

-- Discounts - Public read access for active discounts, admin write access
CREATE POLICY "Active discounts are viewable by everyone" 
  ON discounts FOR SELECT 
  USING (is_active = true);

-- Payment Methods - Users can view and manage their own payment methods
CREATE POLICY "Users can view their own payment methods" 
  ON payment_methods FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment methods" 
  ON payment_methods FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods" 
  ON payment_methods FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods" 
  ON payment_methods FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Shipping Addresses - Users can view and manage their own shipping addresses
CREATE POLICY "Users can view their own shipping addresses" 
  ON shipping_addresses FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own shipping addresses" 
  ON shipping_addresses FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shipping addresses" 
  ON shipping_addresses FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own shipping addresses" 
  ON shipping_addresses FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create a function to update inventory when orders are placed
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory for product or variant
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE inventory
    SET quantity = quantity - NEW.quantity,
        reserved_quantity = reserved_quantity + NEW.quantity
    WHERE variant_id = NEW.variant_id;
  ELSE
    UPDATE inventory
    SET quantity = quantity - NEW.quantity,
        reserved_quantity = reserved_quantity + NEW.quantity
    WHERE product_id = NEW.product_id AND variant_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update inventory when order items are created
CREATE TRIGGER update_inventory_on_order_trigger
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_inventory_on_order();

-- Create a function to generate a unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                      lpad(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger to generate order number on insert
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE generate_order_number();