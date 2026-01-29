const { dbConnection } = require('../connections/index');
const createError = require('http-errors');
const { ObjectId } = require('bson');
const Joi = require('joi');

const POST_PER_PAGE = parseInt(process.env.POST_PER_PAGE) || 10;


const getPageCount = (filter = {}) => {
    return new Promise((resolve, reject) => {
        dbConnection('news', async (db) => {
            try {
                const count = await db.countDocuments(filter);
                const pages = Math.ceil(count / POST_PER_PAGE);
                resolve(pages);
            } catch (err) {
                reject(err);
            }
        });
    });
};

/**
 * جلب الأخبار مع pagination + sorting + search
 */
const getNews = async (req, res, next) => {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        search: Joi.string().trim().max(100).allow(''),
        orderBy: Joi.string().valid('asc', 'desc').default('desc')
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
        return next(createError(400, error.details[0].message));
    }

    let { page, search, orderBy } = value;

    try {
        let filter = {};
        if (search) {
            filter = { $text: { $search: search } };
        }

        const totalPages = await getPageCount(filter);
        if (page > totalPages) page = totalPages || 1;

        const skip = (page - 1) * POST_PER_PAGE;
        const sortOrder = orderBy === 'asc' ? 1 : -1;

        dbConnection('news', async (db) => {
            try {
                const news = await db
                    .find(filter)
                    .sort({ date: sortOrder })
                    .skip(skip)
                    .limit(POST_PER_PAGE)
                    .toArray();

                res.status(200).json({
                    status: true,
                    page,
                    totalPages,
                    count: news.length,
                    data: news
                });
            } catch (err) {
                next(createError(500, err.message));
            }
        });

    } catch (err) {
        next(createError(500, err.message));
    }
};

/**
 * جلب خبر واحد
 */
const getNewsById = (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().hex().length(24).required()
    });

    const { error } = schema.validate(req.params);
    if (error) {
        return next(createError(400, "Invalid ID format"));
    }

    const _id = new ObjectId(req.params.id);

    dbConnection('news', async (db) => {
        try {
            const news = await db.findOne({ _id });
            if (!news) {
                return next(createError(404, "News not found"));
            }

            res.status(200).json({
                status: true,
                data: news
            });
        } catch (err) {
            next(createError(500, err.message));
        }
    });
};

module.exports = {
    getNews,
    getNewsById
};
