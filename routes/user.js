var express = require('express');
var router = express.Router();

const User = require('../models/user'); // Mongoose user model
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const Product = require('../models/products');

const Cart = require('../models/cart')

const Order = require('../models/order');

const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async (req, res, next) => {
  let user = req.session?.user || null;
  let cartCount=null
  const products = await Product.find({}).lean();
  
  if(user){
    let cart=await  Cart.findOne({userId:user._id})
    if (cart && cart.products) {
        cartCount = cart.products.length;
      }
  }

  res.render('user/view-products', { user, products, admin: false ,cartCount});
});





router.post('/add-product', (req, res) => {
  const { name, category, desc, price } = req.body;
  const image = req.files?.image;

  const product = { name, category, desc, price };

  if (image) {
    const imagePath = 'public/product-images/' + image.name;
    image.mv(imagePath, (err) => {
      if (err) {
        console.error("Image upload failed:", err);
        return res.status(500).send("Image upload failed.");
      }
      product.image = '/images/' + image.name;
      productHelpers.addProduct(product, (success) => {
        if (success) {
          res.redirect('/');
        } else {
          res.status(500).send("Failed to add product.");
        }
      });
    });
  } else {
    productHelpers.addProduct(product, (success) => {
      if (success) {
        res.redirect('/');
      } else {
        res.status(500).send("Failed to add product.");
      }
    });
  }
});

router.get('/login', async (req, res,) => {
  if (req.session.admin){
    return res.render('../admin/view-products')
   } 
  else if (req.session.user) {
    return res.redirect('/')
  }
  
  else {
    res.set('Cache-Control', 'no-store');


    res.render('user/login', { loginErr: req.session.userLoginErr })
    req.session.useLoginErr = false
  }


})
router.get('/signup', async (req, res,) => {
  if (req.session.user) {
    return res.redirect('/');
  } else {
    res.render('user/signup')
  }

})

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {

    return res.send("All fields are required.");


  }

  const hashedPwd = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hashedPwd });
    res.redirect('/login');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Signup failed');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();
    if (user && await bcrypt.compare(password, user.password)) {
      
      req.session.user = user; // or JWT if you're using that
      req.session.user.loggedIn=true;
      res.redirect('/'); // example
    } else {
      req.session.useLoginErr = true
      res.redirect('/login');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Login failed');
  }
});

router.get('/logout', (req, res) => {
  req.session.user=null;
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;

  const cartItems = await Cart.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        _id: 0,
        productId: '$products.productId',
        quantity: '$products.quantity',
        name: '$productDetails.name',
        price: '$productDetails.price',
        image: '$productDetails.image',
        total: { $multiply: ['$products.quantity', '$productDetails.price'] } // ✅ New field
      }
    }
  ]);

  // Calculate grand total
  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.render('user/cart', {
    cartItems,
    user: req.session.user,
    totalAmount
  });
});


router.get('/add-to-cart/:id', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const productId = new mongoose.Types.ObjectId(req.params.id);

  // Try to increment quantity if product exists
  const result = await Cart.updateOne(
    {
      userId,
      'products.productId': productId
    },
    {
      $inc: { 'products.$.quantity': 1 }
    }
  );

  // If not matched, push new product
  if (result.matchedCount === 0) {
    await Cart.updateOne(
      { userId },
      {
        $push: { products: { productId, quantity: 1 } }
      },
      { upsert: true }
    );
  }

  // Get updated cart count
  const userCart = await Cart.findOne({ userId });
  const cartCount = userCart.products.reduce((sum, item) => sum + item.quantity, 0);

  res.json({ status: true, cartCount });
});
// Increment quantity
router.post('/cart/increment/:id', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const productId = new mongoose.Types.ObjectId(req.params.id);

  await Cart.updateOne(
    { userId, 'products.productId': productId },
    { $inc: { 'products.$.quantity': 1 } }
  );

  res.json({ success: true });
});

// Decrement quantity (and remove if it hits 0)
router.post('/cart/decrement/:id', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const productId = new mongoose.Types.ObjectId(req.params.id);

  const cart = await Cart.findOne({ userId });
  const item = cart.products.find(p => p.productId.equals(productId));

  if (item.quantity > 1) {
    await Cart.updateOne(
      { userId, 'products.productId': productId },
      { $inc: { 'products.$.quantity': -1 } }
    );
  } 

  res.json({ success: true });
});
router.post('/cart/delete/:id', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;
  const productId = new mongoose.Types.ObjectId(req.params.id);

  await Cart.updateOne(
    { userId },
    { $pull: { products: { productId } } }
  );

  res.json({ success: true });
});


router.get('/place-order', verifyLogin, async (req, res) => {
  const userId = req.session.user._id;

  const cartItems = await Cart.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        _id: 0,
        quantity: '$products.quantity',
        price: '$productDetails.price',
        total: { $multiply: ['$products.quantity', '$productDetails.price'] }
      }
    }
  ]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.render('user/place-order', { user: req.session.user, totalAmount });
});

router.post('/place-order',verifyLogin,async(req,res)=>{
  const userId = req.session.user._id;
  const { address, pincode, mobile, paymentMethod } = req.body;

  const userCart = await Cart.findOne({ userId }).populate('products.productId');

  if (!userCart || userCart.products.length === 0) {
    return res.redirect('/cart');
  }

  const products = userCart.products.map(p => ({
    productId: p.productId._id,
    quantity: p.quantity
  }));

  const totalAmount = userCart.products.reduce((sum, item) => {
    return sum + (item.productId.price * item.quantity);
  }, 0);

  // Create and save the order
  await Order.create({
  userId,
  deliveryDetails: { address, pincode, mobile },
  paymentMethod,
  products,
  totalAmount,
  status: paymentMethod === 'COD' ? 'Placed' : 'Pending'
});
  // Clear the user's cart
  await Cart.deleteOne({ userId });

  res.redirect('/order-success');
})
router.get('/order-success', async (req, res) => {
  const order = await Order.findOne({ userId: req.session.user._id }).sort({ _id: -1 }).lean();

  res.render('user/order-success', {
    order,
    isPlaced: order.status === 'Placed',
    user: req.session.user
  });
});

 
router.get('/orders-list',verifyLogin,async (req,res)=>{
  const ordersList=await Order.find({userId:req.session.user._id}).lean()
  res.render('user/orders-list',{ordersList})
})
 router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  const orderProducts= await Order.findById(req.params.id).populate('products.productId').lean()
  console.log(orderProducts)
   res.render('user/view-order-products', { orderProducts });
 })
module.exports = router;