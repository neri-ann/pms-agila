const Item = require("../Models/item");
const procReqest = require("../Models/procReqest");

exports.create = async (req, res) => {
    const { username, itemName, AssetsClass, AssetsSubClass, itemDescription, cost, quantityAvailable } = req.body;
  
    try {
      // Check if item name already exists
      const existingItem = await Item.findOne({ itemName: itemName.trim() });
      if (existingItem) {
        return res.status(400).json({ error: 'Item name must be unique. An item with this name already exists.' });
      }

      const newItem = new Item({ 
        username, 
        itemName: itemName.trim(), 
        AssetsClass, 
        AssetsSubClass, 
        itemDescription,
        cost: parseFloat(cost),
        quantityAvailable: parseInt(quantityAvailable) || 0
      });
      
      const savedItem = await newItem.save();
      return res.status(201).json({ item: savedItem });
    } catch (error) {
      console.error('Error saving item:', error);
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Item name must be unique. An item with this name already exists.' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Get all items with calculated quantity available
exports.viewItem = async (req, res) => {
  try {
    const items = await Item.find();
    
    // For each item, calculate the actual quantity available from approved procurement requests
    const itemsWithCalculatedQuantity = await Promise.all(items.map(async (item) => {
      // Find all approved procurement requests that contain this item
      const approvedRequests = await procReqest.find({
        status: 'Approved',
        'items.itemName': item.itemName
      });
      
      // Calculate total quantity from approved requests for this item
      let totalApprovedQuantity = 0;
      approvedRequests.forEach(request => {
        request.items.forEach(requestItem => {
          if (requestItem.itemName === item.itemName) {
            totalApprovedQuantity += requestItem.qtyRequired || 0;
          }
        });
      });
      
      // Update the item's calculated quantity
      const itemObj = item.toObject();
      itemObj.calculatedQuantityAvailable = totalApprovedQuantity;
      
      return itemObj;
    }));
    
    res.json(itemsWithCalculatedQuantity);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View details of a particular item
exports.previewItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    /* if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid item ID' });
        } */

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ status: "Item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ status: "Error with getting item", error: err.message });
  }
};

// Update item details
exports.updateItem = async (req, res) => {
  const itemId = req.params.id;
  const { username, itemName, AssetsClass, AssetsSubClass, itemDescription, cost, quantityAvailable } = req.body;

  try {
    // Check if the new item name is unique (excluding the current item)
    if (itemName) {
      const existingItem = await Item.findOne({ 
        itemName: itemName.trim(),
        _id: { $ne: itemId }
      });
      if (existingItem) {
        return res.status(400).json({ error: 'Item name must be unique. An item with this name already exists.' });
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { 
        username, 
        itemName: itemName?.trim(), 
        AssetsClass, 
        AssetsSubClass,
        itemDescription,
        cost: cost ? parseFloat(cost) : undefined,
        quantityAvailable: quantityAvailable !== undefined ? parseInt(quantityAvailable) : undefined
      },
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ status: "Item not found" });
    }

    res.status(200).json({ status: "Item updated", Item: updatedItem });
  } catch (err) {
    console.error("Error updating item:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Item name must be unique. An item with this name already exists.' });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  const itemId = req.params.id;

  try {
   /*  if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid item ID" });
    } */

    const deletedItem = await Item.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ status: "Item not found" });
    }

    res.status(200).json({ status: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
