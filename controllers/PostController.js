import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 1, rating, last, tag } = req.query;
    const count = await PostModel.countDocuments();
    const sort = rating ? { viewsCount: rating } : { createdAt: last };
    const hashTag = tag ? { tags: tag } : null;
    const data = await PostModel.find(hashTag)
      .populate('user')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort)
      .exec();

    res.json({ data, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: 'Не удалось вернуть статью' });
        }

        if (!doc) {
          return res.status(404).json({ message: 'Статья не найдена' });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: 'Не удалось удалить статью' });
        }

        if (!doc) {
          return res.status(404).json({ message: 'Статья не найдена' });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить статьи' });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать статью' });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags.split(','),
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось обновить статью' });
  }
};
