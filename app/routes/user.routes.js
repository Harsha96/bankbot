const db = require("../models");
const User = db.user; // Adjust this based on your actual model name
const Transaction=db.transaction;
module.exports = (app) => {
  var router = require("express").Router();

  router.post("/", async (req, res) => {
    try {
      console.log("Received user details:", req.body);

      if (!req.body) {
        return res.status(400).json({ error: "Request body is empty" });
      }

      const newUser = new User({
        // Adjust these fields based on your user model structure
        username: req.body.username,
        email: req.body.email,
        accountId: req.body.accountId,
        accountType: req.body.accountType, // Example: 1 for savings, 2 for checking, etc.
        userAddress: req.body.userAddress,
        accountBalance: req.body.accountBalance,
        // Other user details...
      });

      const savedUser = await newUser.save();

      console.log("Saved user details:", savedUser);
      res.status(201).json(savedUser);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/", async (req, res) => {
    try {
      // Retrieve all users
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const accountId = req.params.id;

      // Retrieve user by id
      const user = await User.find({ accountId });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const userId = req.params.id;

      // Delete a user by id
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  const generateRandomId = () => {
    // Assuming you want a random string of length 8
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
    }
  
    return randomId;
  }
  
  router.put("/:accountId", async (req, res) => {
    try {
      const userAccountId = req.params.accountId;
      const { transactionType, accountBalance } = req.body;
  
      if (!transactionType || !accountBalance) {
        return res.status(400).json({ error: "Transaction details are incomplete" });
      }
  
      // Find the user based on the accountId
      const user = await User.findOne({ accountId: userAccountId });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Update the account balance based on the transaction type
      if (transactionType === "credit") {
        user.accountBalance += parseFloat(accountBalance);
      } else if (transactionType === "debit") {
        user.accountBalance -= parseFloat(accountBalance);
      } else {
        return res.status(400).json({ error: "Invalid transaction type" });
      }
  
      // Save the updated user
      const updatedUser = await user.save();
      const beneficiaryId = generateRandomId();

      // Create a new transaction record
      const newTransaction = await Transaction.create({
        accountId: userAccountId,
        transactionType: transactionType,
        amount: parseFloat(accountBalance),
        beneficiaryId: beneficiaryId,

        // Add other transaction fields as needed
      });
      res.status(200).json({ user: updatedUser, transaction: newTransaction });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  app.use("/api/users", router);
};
