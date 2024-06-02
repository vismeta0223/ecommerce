const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

// create a product or add a product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

//find a product

const getProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const findaProduct = await Product.findById(id);
        res.json(findaProduct);
    } catch (error) {
        throw new Error(error);
    }
    
});

//get all products on the list
const getAllProduct = asyncHandler(async (req,res) => {
    try {
        //Filtering
        const queryObj = {...req.query};
        const excludeFields =["page", "limit", "fields", "sort"];
        excludeFields.forEach(el => delete queryObj[el]);
        console.log(queryObj);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        //Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }else{
            query = query.sort("-createdAt");
        }

        //Limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        }else{
            query = query.select("-__v");
        }

        //Pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("Page Not Found");
        }
        console.log(page, limit, skip);

        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});

// Update a Product
const updateProduct = asyncHandler(async(req, res) => {
    const {id} = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate({_id: id}, req.body, {
            new: true,
        });
        res.json(updateProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a product
const deleteProduct = asyncHandler(async(req, res) => {
    const {id} = req.params;
    try {
        const deleteProduct = await Product.findOneAndDelete({_id: id}
        );
        res.json(deleteProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = {createProduct, getProduct, getAllProduct, updateProduct, deleteProduct};