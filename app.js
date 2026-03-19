// const express = require('express');
// const bodyParser = require('body-parser');
// const { MongoClient, ObjectId } = require('mongodb');

// const app = express();
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// const url = 'mongodb://0.0.0.0:27017';
// const client = new MongoClient(url);
// const dbName = 'project-nosql';

// async function connectDB() {
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db(dbName).collection('products');
// }

// // หน้าแรก - แสดงสินค้าทั้งหมด
// app.get('/', async (req, res) => {
//     const collection = await connectDB();
//     const category = req.query.category;

//     var query = {};
//     if (category) query.category = category;

//     const products = await collection.find(query).toArray();
//     const categories = await collection.distinct('category');
//     res.render('list', { products, categories, selectedCategory: category });
// });

// // หน้าฟอร์มเพิ่มสินค้า
// app.get('/insert', (req, res) => {
//     res.render('insert', { error: null });
// });

// // บันทึกสินค้าใหม่
// app.post('/insert', async (req, res) => {
//     const collection = await connectDB();
//     await collection.insertOne({
//         name: req.body.name,
//         category: req.body.category,
//         price: parseFloat(req.body.price),
//         stock: parseInt(req.body.stock),
//         unit: req.body.unit,
//         description: req.body.description,
//         createdAt: new Date(),
//         updatedAt: new Date()
//     });
//     res.redirect('/');
// });

// // หน้าแก้ไขสินค้า
// app.get('/update/:id', async (req, res) => {
//     const collection = await connectDB();
//     const product = await collection.findOne({ _id: new ObjectId(req.params.id) });
//     res.render('update', { product });
// });

// // บันทึกการแก้ไข
// app.post('/update', async (req, res) => {
//     const collection = await connectDB();
//     await collection.updateOne(
//         { _id: new ObjectId(req.body.id) },
//         {
//             $set: {
//                 name: req.body.name,
//                 category: req.body.category,
//                 price: parseFloat(req.body.price),
//                 stock: parseInt(req.body.stock),
//                 unit: req.body.unit,
//                 description: req.body.description,
//                 updatedAt: new Date()
//             }
//         }
//     );
//     res.redirect('/');
// });

// // ลบสินค้า
// app.get('/delete/:id', async (req, res) => {
//     const collection = await connectDB();
//     await collection.deleteOne({ _id: new ObjectId(req.params.id) });
//     res.redirect('/');
// });

// app.listen(3000, () => {
//     console.log('Server started at http://localhost:3000');
// });

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const url = 'mongodb://0.0.0.0:27017';
const client = new MongoClient(url);
const dbName = 'project-nosql';

async function connectDB() {
    await client.connect();
    return client.db(dbName).collection('products');
}

// หน้าแรก - แสดงสินค้าทั้งหมด
app.get('/', async (req, res) => {
    const collection = await connectDB();
    const category = req.query.category;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    var query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // เรียงสต็อกต่ำขึ้นก่อน
    const products = await collection.find(query)
        .sort({ stock: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

    const categories = await collection.distinct('category');

    res.render('list', {
        products,
        categories,
        selectedCategory: category,
        search: search,
        currentPage: page,
        totalPages: totalPages,
        total: total
    });
});

// หน้าฟอร์มเพิ่มสินค้า
app.get('/insert', (req, res) => {
    res.render('insert', { error: null });
});

// บันทึกสินค้าใหม่
app.post('/insert', async (req, res) => {
    const collection = await connectDB();
    await collection.insertOne({
        name: req.body.name,
        category: req.body.category,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        unit: req.body.unit,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    res.redirect('/');
});

// หน้าแก้ไขสินค้า
app.get('/update/:id', async (req, res) => {
    const collection = await connectDB();
    const product = await collection.findOne({ _id: new ObjectId(req.params.id) });
    res.render('update', { product });
});

// บันทึกการแก้ไข
app.post('/update', async (req, res) => {
    const collection = await connectDB();
    await collection.updateOne(
        { _id: new ObjectId(req.body.id) },
        {
            $set: {
                name: req.body.name,
                category: req.body.category,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock),
                unit: req.body.unit,
                description: req.body.description,
                imageUrl: req.body.imageUrl,
                updatedAt: new Date()
            }
        }
    );
    res.redirect('/');
});

// ลบสินค้า
app.get('/delete/:id', async (req, res) => {
    const collection = await connectDB();
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});