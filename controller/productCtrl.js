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
        const getAllProduct = await Product.find();
        res.json(getAllProduct);
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