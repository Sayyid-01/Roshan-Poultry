const Inquiry = require('../models/inquiry.model');
const Testimonial = require('../models/testimonial.model');
const Blog = require('../models/blog.model');
const Gallery = require('../models/gallery.model');
const models = { testimonials: Testimonial, blogs: Blog, gallery: Gallery };

exports.createInquiry = async (req,res) => { try { const inquiry = await Inquiry.create(req.body); res.status(201).json({success:true,message:'Thanks — we will be in touch shortly.',inquiry}); } catch(e) {res.status(400).json({success:false,message:e.message});} };
exports.getInquiries = async (_req,res) => { try {res.json({success:true,inquiries:await Inquiry.find().sort({createdAt:-1})});} catch(e){res.status(500).json({success:false,message:e.message});} };
exports.updateInquiry = async (req,res) => { try {res.json({success:true,inquiry:await Inquiry.findByIdAndUpdate(req.params.id,req.body,{new:true})});} catch(e){res.status(400).json({success:false,message:e.message});} };
exports.listPublic = async (req,res) => { const Model=models[req.params.type]; if(!Model)return res.status(404).json({success:false,message:'Unknown content type'}); try {const items=await Model.find({isPublished:true}).sort({publishedAt:-1,createdAt:-1});res.json({success:true,items});}catch(e){res.status(500).json({success:false,message:e.message});} };
exports.listAdmin = async (req,res) => { const Model=models[req.params.type]; if(!Model)return res.status(404).json({success:false,message:'Unknown content type'}); try {res.json({success:true,items:await Model.find().sort({createdAt:-1})});}catch(e){res.status(500).json({success:false,message:e.message});} };
exports.createContent = async (req,res) => { const Model=models[req.params.type]; if(!Model)return res.status(404).json({success:false,message:'Unknown content type'}); try {const item=await Model.create({...req.body,slug:req.body.slug||req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),publishedAt:req.body.publishedAt||new Date()});res.status(201).json({success:true,item});}catch(e){res.status(400).json({success:false,message:e.message});} };
exports.updateContent = async (req,res) => { const Model=models[req.params.type]; if(!Model)return res.status(404).json({success:false,message:'Unknown content type'}); try {res.json({success:true,item:await Model.findByIdAndUpdate(req.params.id,req.body,{new:true})});}catch(e){res.status(400).json({success:false,message:e.message});} };
exports.deleteContent = async (req,res) => { const Model=models[req.params.type]; if(!Model)return res.status(404).json({success:false,message:'Unknown content type'}); try {await Model.findByIdAndDelete(req.params.id);res.json({success:true});}catch(e){res.status(400).json({success:false,message:e.message});} };
