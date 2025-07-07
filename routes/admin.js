var express = require('express');
var router = express.Router();


const multer = require('multer');
const Product = require('../models/products');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/product-images'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).lean(); 
     

    res.render('admin/view-products', { admin: true, products });
  } catch (err) {
    console.error('❌ Failed to load products:', err);
    res.status(500).send('Failed to load products');
  }
});

router.get('/view-products', async (req, res) => {
  try {
    const products = await Product.find().lean() ; 
     
    res.render('admin/view-products', { admin: true, products });
  } catch (err) {
    console.error('❌ Failed to load products:', err);
    res.status(500).send('Failed to load products');
  }
});

router.get('/add-product',(req,res)=>{
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

router.get('/delete-product/',async(req,res)=>{
  let proId=req.query.id
  await Product.findByIdAndDelete({_id:proId});
    res.redirect('/admin/view-products');
  })

router.get('/edit-product/',async(req,res)=>{
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

module.exports = router;
