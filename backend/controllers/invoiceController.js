const Invoice = require('../models/Invoice');

//@desc create new invoice
//@route POST/api/invoices
//@access Private
exports.createInvoice = async (req,res) => {
  try{
    const user = req.user;
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
    } = req.body;

    //subtotal calculations
    let subTotal = 0;
    let taxTotal = 0;
    items.forEach((item)=>{
      const itemBaseTotal = item.unitPrice * item.quantity;
      const itemTax = (itemBaseTotal * (item.taxPercent || 0)) / 100;
      item.total = itemBaseTotal + itemTax;

      subTotal += itemBaseTotal;
      taxTotal += itemTax;
    });

    const total = subTotal  + taxTotal;

    const invoice = new Invoice({
      user: req.user._id,
      invoiceNumber,
      invoiceDate,
      dueDate: dueDate === "" ? undefined : dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      subTotal,
      taxTotal,
      total,
      status: req.body.status || "Unpaid"
    });

    await invoice.save();
    res.status(201).json(invoice);

  }catch(error){
    console.error("CREATE INVOICE ERROR:", error);
    res.status(500).json({message : "Error creating invoices",error:error.message});
  }
};

//@desc get all invoices of logged in user 
//@route GET/api/invoices
//@access Private
exports.getInvoices = async (req,res) => {
  try{
    const invoices = await Invoice.find({ user: req.user._id }).populate("user","name email");
    res.json(invoices);

  }catch(error){
    res.status(500).json({message : "Error fetching invoices",error:error.message});
  }
};

//@desc get single invoice by id
//@route GET/api/invoices
//@access Private
exports.getInvoiceById = async (req,res) => {
  try{
    const invoice = await Invoice.findById(req.params.id).populate("user","name email");
    if(!invoice) return res.status(404).json({message : "Invoice not found"});
    res.json(invoice);
  }catch(error){
    res.status(500).json({message : "Error fetching invoices",error:error.message});
  }
};


//@desc update invoice
//@route PUT/api/invoices
//@access Private
exports.updateInvoice = async (req,res) => {
  try{
     const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
    } = req.body;

    //recalculate if items changes
    let subTotal = 0;
    let taxTotal = 0;
    if(items && items.length>0){
      items.forEach((item)=>{
        const itemBaseTotal = item.unitPrice * item.quantity;
        const itemTax = (itemBaseTotal * (item.taxPercent || 0)) / 100;
        item.total = itemBaseTotal + itemTax;

        subTotal += itemBaseTotal;
        taxTotal += itemTax;
      });
    }

    const total = subTotal + taxTotal;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,{
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
      subTotal,
      taxTotal,
      total,
      }, {new : true}
    );

    if(!updatedInvoice) return res.status(404).json({message : " invoice not found"});

    res.json(updatedInvoice);

  }catch(error){
    res.status(500).json({message : "Error updating invoices",error:error.message});
  }
};

//@desc Delete Invoice
//@route DELETE/api/invoices
//@access Private
exports.deleteInvoice = async (req,res) => {
  try{
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if(!invoice) return res.status(404).json({message : "invoice not found"});
    res.json({message : "Invoice deteleted successfully"});
  }catch(error){
    res.status(500).json({message : "Error deleting invoices",error:error.message});
  }
};

