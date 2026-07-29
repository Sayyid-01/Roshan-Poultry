const router=require('express').Router(); const c=require('../controllers/content.controller');
router.post('/inquiries',c.createInquiry); router.get('/inquiries',c.getInquiries); router.patch('/inquiries/:id',c.updateInquiry);
router.get('/:type',c.listPublic); router.get('/:type/admin/all',c.listAdmin); router.post('/:type',c.createContent); router.patch('/:type/:id',c.updateContent); router.delete('/:type/:id',c.deleteContent);
module.exports=router;
