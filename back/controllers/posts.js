// back/controllers/posts.js
const models = require("../models");

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "인증된 사용자만 작성할 수 있습니다." });
    }

    let attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } else if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
    }

    const post = await models.Post.create({
      title,
      content,
      userId,
      attachments,
    });

    res.status(201).json({ message: "ok", data: post });
  } catch (error) {
    console.error("게시글 생성 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

const findPosts = async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      include: [
        {
          model: models.User,
          attributes: ["userName"], // 작성자 이름 포함
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "ok", data: posts });
  } catch (error) {
    console.error("게시글 목록 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await models.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 삭제 : 작성자와 현재 유저가 다른 경우
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: "본인만 삭제할 수 있습니다." });
    }

    await post.destroy();

    res.status(200).json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("게시글 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// router.get('/', postController.findPosts);        // GET /posts → 전체 조회
// router.get('/:id', postController.findPost);      // GET /posts/1 → 특정 게시글
const findPost = (req, res) => {
  console.log("findPost 호출됨");
  res.status(200).end();
};
const updatePost = (req, res) => {
 console.log("updatePost 호출됨");
  res.status(200).end();
};
const createComment = (req, res) => {
 console.log("createComment 호출됨");
  res.status(200).end();
};
const findComments = (req, res) => {
 console.log("findComments 호출됨");
  res.status(200).end();
};
const updateComment = (req, res) => {
 console.log("updateComment 호출됨");
  res.status(200).end();
};
const deleteComment = (req, res) => {
 console.log("deleteComment 호출됨");
  res.status(200).end();
};

module.exports = {
  createPost,
  findPosts,
  findPost,
  updatePost,
  deletePost,
  createComment,
  findComments,
  updateComment,
  deleteComment,
};
