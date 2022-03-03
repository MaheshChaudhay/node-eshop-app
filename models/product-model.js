const mongodb = require("mongodb");

const db = require("./../data/database");

class Product {
  constructor(productData) {
    this.title = productData.title;
    this.price = +productData.price;
    this.summary = productData.summary;
    this.description = productData.description;
    this.image = productData.image;
    this.updateImageData();
    if (productData._id) {
      this.id = productData._id.toString();
    }
  }

  async save() {
    const productDocument = {
      title: this.title,
      price: this.price,
      summary: this.summary,
      description: this.description,
      image: this.image,
    };

    if (this.id) {
      const prodId = new mongodb.ObjectId(this.id);

      if (!this.image) {
        delete productDocument.image;
      }

      await db
        .getDb()
        .collection("products")
        .updateOne({ _id: prodId }, { $set: productDocument });
    } else {
      await db.getDb().collection("products").insertOne(productDocument);
    }
  }

  static async fetchProducts() {
    const products = await db.getDb().collection("products").find().toArray();
    return products.map(function (productDocument) {
      return new Product(productDocument);
    });
  }

  static async findById(productId) {
    let prodId;
    try {
      prodId = new mongodb.ObjectId(productId);
    } catch (error) {
      error.code = 404;
      throw error;
    }

    const product = await db
      .getDb()
      .collection("products")
      .findOne({ _id: prodId });
    if (!product) {
      const error = new Error("Could not find product with the given id.");
      error.code = 404;
      throw error;
    }
    return new Product(product);
  }

  static async findMultiple(ids) {
    const productIds = ids.map(function (id) {
      return new mongodb.ObjectId(id);
    });

    const products = await db
      .getDb()
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    return products.map(function (productDocument) {
      return new Product(productDocument);
    });
  }

  updateImageData() {
    this.imagePath = `product-data/images/${this.image}`;
    this.imageUrl = `/products/assets/images/${this.image}`;
  }

  async replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }

  remove() {
    const prodId = new mongodb.ObjectId(this.id);
    return db.getDb().collection("products").deleteOne({ _id: prodId });
  }
}

module.exports = Product;
