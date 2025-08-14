var express = require('express');
var router = express.Router();

const Admin = require('../models/admin');
const multer = require('multer');
const Product = require('../models/products');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/product-images'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  }
  else {
    res.redirect('/admin/admin-login')
  }
}

router.get('/', verifyAdminLogin,async (req, res) => {
  try {
    const products = await Product.find({}).lean(); 
     

    res.render('admin/view-products', { admin: true, products });
  } catch (err) {
    console.error('❌ Failed to load products:', err);
    res.status(500).send('Failed to load products');
  }
});

router.get('/view-products',verifyAdminLogin, async (req, res) => {
  try {
    const products = await Product.find().lean() ; 
     
    res.render('admin/view-products', { admin: true, products });
  } catch (err) {
    console.error('❌ Failed to load products:', err);
    res.status(500).send('Failed to load products');
  }
});

router.get('/add-product',verifyAdminLogin,(req,res)=>{
  res.render('admin/add-product',{admin:true})
})
router.post('/add-product', upload.single('image'), async (req, res) => {
  const  { name, category, desc, price } = req.body;
  const image = req.file ? '/product-images/' + req.file.filename : '';

  try {
    await Product.create({
      name,
      category,     
      desc,
      price,
      image
    });
    res.redirect('/admin/view-products');
  }catch (err) {
  console.error('Error saving product:', err); 
  res.status(500).send('Failed to add product');
}

  
});

router.get('/delete-product/',verifyAdminLogin,async(req,res)=>{
  let proId=req.query.id
  await Product.findByIdAndDelete({_id:proId});
    res.redirect('/admin/view-products');
  })

router.get('/edit-product/',verifyAdminLogin,async(req,res)=>{
  let prdts = await Product.findById(req.query.id).lean()  ;
  console.log(prdts)
  res.render('admin/edit-product',{prdts,admin:true})
})
router.post('/edit-product/:id', upload.single('image'), async (req, res) => {
  const { name, category, price, desc, existingImage } = req.body;
  const updateData = { name, category, price, desc };

  if (req.file) {
    updateData.image = '/product-images/' + req.file.filename;
  } else {
    updateData.image = existingImage;
  }

  try {
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/view-products');
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).send('Failed to update product');
  }
});
router.get('/admin-login',(req,res)=>{
  if (req.session.admin) {
    return res.redirect('/admin')
  }
  else {
    res.set('Cache-Control', 'no-store');


    res.render('admin/admin-login', { loginErr: req.session.userLoginErr })
    req.session.LoginErr = false
  }

})
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).lean();
    if (admin && await bcrypt.compare(password, admin.password)) {
      
      req.session.admin = admin; // or JWT if you're using that
      req.session.admin.loggedIn=true;
      res.redirect('/admin'); // example
    } else {
      req.session.LoginErr = true
      res.redirect('/admin-login');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Login failed');
  }
});
router.get('/admin-orders',verifyAdminLogin,async (req,res)=>{
  const ordersList=await Order.find().lean()
  res.render('admin/admin-orders',{ordersList,admin: true})
})
 router.get('/admin-view-order-products/',verifyAdminLogin,async(req,res)=>{
  const orderProducts= await Order.findById(req.query.id).populate('products.productId').lean()
  console.log(orderProducts)
  res.render('admin/admin-view-order-products', { orderProducts,admin: true });
 })
module.exports = router;
