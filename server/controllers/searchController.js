const searchService = require('../services/searchService');

exports.search = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter q is required' });

        const results = await searchService.search(q);
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

exports.suggest = async (req, res, next) => {
    try {
        const { q } = req.query;
        const suggestions = await searchService.suggest(q);
        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        next(error);
    }
};
