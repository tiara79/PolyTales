// /routes/postRouter.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts');
const { authenticate } = require('../middlewares/auth');
const { uploadMultiple } = require('../middlewares/upload');

// 게시글 CRUD
router.post('/', authenticate, uploadMultiple, postController.createPost);
router.get('/', postController.findPosts);
router.get('/:id', postController.findPost);
router.put('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

// 댓글 CRUD
router.post('/:postId/comments', postController.createComment);
router.get('/:postId/comments', postController.findComments);
router.put('/:postId/comments/:id', postController.updateComment);
router.delete('/:postId/comments/:id', postController.deleteComment);

module.exports = router;
