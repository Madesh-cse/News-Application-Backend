import type { Request, Response, NextFunction } from "express";
import articleService from "../services/article.service.js";

export const createArticle = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const article = await articleService.createArticle(req.body);
        return res.status(201).json({
            success: true,
            message: "Article created successfully",
            data: article,
        })
    }
    catch(error:any){
        next(error)
    }
}

export const getArticle = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const { category, source, q, from, to, sort, page, limit} = res.locals.validatedQuery;;
        const articles = await articleService.getArticlesByFilters({
            category: category as string | undefined,
            source: source as string,
            q: q as string | undefined,
            from: from as string | undefined,
            to: to as string | undefined,
            sort: sort as "newest" | "oldest" | "popular" | "leastPopular" | undefined,
            page: page as number,
            limit: limit as number,
        });
        const result = await articleService.getArticlesByFilters({category,source,q,from,to,sort,page,limit,})
        return res.status(200).json({
            success: true,
            count: result.articles.length,
            data: result.articles,
            pagination: result.pagination,
        })
    }
    catch(err:any){
        next(err)
    }
}

export const getArticleById = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
        const articles = await articleService.getarticleById(id);
        return res.status(200).json({
            success: true,
            data: articles,
        })
    }
    catch(err:any){
        next(err)
    }
}

export const getArticleBySlug = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const slug = typeof req.params.slug === "string" ? req.params.slug : req.params.slug[0];
        const article = await articleService.getBySlug(slug);
        return res.status(200).json({
            success: true,
            data: article,
        })
    }
    catch(err:any){
        next(next)
    }
}

export const getLatestArticles = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const articles = await articleService.getLatestArticle();
       return res.status(200).json({
          success: true,
          count: Array.isArray(articles) ? articles.length : 0,
          data: articles,
       });
    }
    catch(err:any){
        next(err)
    }
}

export const getArticlesByCategory = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        const categoryId = typeof req.params.categoryId === "string" ? req.params.categoryId : req.params.categoryId[0];
        const articles = await articleService.getArticleByCategory(categoryId);
        return res.status(200).json({
          success: true,
          count: articles.length,
          data: articles,
        });
    }
    catch(err:any){
        next(err)
    }
}

// update a Controller
export const updateArticle = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const article = await articleService.updateArticle(id,req.body);
    return res.status(200).json({
      success: true,
      message: "Article updated successfully",
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    await articleService.deleteArticle(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// search controller
export const searchArticles = async (req: Request,res: Response,next: NextFunction) => {
    try{
        const query = req.query.q as string;
        const articles = await articleService.searchArticles(query);
        return res.status(200).json({
            success: true,
            count: articles.length,
            data: articles,
        })
    }
    catch(err:any){
        next(err)
    }
}

// Trending Articles
export const getTrendingArticles = async (req: Request,res: Response,next: NextFunction) =>{
    try{
        const articles = await articleService.getTrendingArticles();
        return res.status(200).json({
            success: true,
            count: articles.length,
            data: articles,
        })
    }
    catch(err:any){
        next(err)
    }
}

// Featured Articles
export const getFeaturedArticles = async (req: Request,res: Response,next: NextFunction) =>{
    try{
        const articles = await articleService.getFeaturedArticles();
         return res.status(200).json({
            success: true,
            count: articles.length,
            data: articles,
         })
    }
    catch(err:any){
        next(err)
    }
}