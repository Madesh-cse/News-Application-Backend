import type { GNewsArticle } from "../types/newsApi.types.js";
import type { NormalizedNewsArticle } from "../types/normalizedArticle.types.js";

const cleanText = ( value: string | null | undefined): string |  null => {
    if (typeof value !== "string"){
        return null;
    }
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : null;
};

const isValidHttpUrl = ( value: string | null): value is string =>{
    if(!value){
        return false;
    }
    try{
        const url = new URL(value);
        return( url.protocol === "http:" || url.protocol === "https:")
    }
    catch(error:any){
        return false;
    }
};

export const normalizeGNewsArticle = (article: GNewsArticle): NormalizedNewsArticle | null =>{
    const title = cleanText(article.title);
    const articleUrl = cleanText(article.url);
    const sourceName = cleanText(article.source?.name);
    const sourceUrl = cleanText(article.source?.url);

    if(!title || !articleUrl || !sourceName || !sourceUrl){
        return null;
    }
    if(!isValidHttpUrl(articleUrl) || !isValidHttpUrl(sourceUrl)){
        return null;
    }
    const publishedAt = new Date(article.publishedAt);
    if(Number.isNaN(publishedAt.getTime())){
        return null;
    }
    const image = cleanText(article.image);
    // Clean description and content
    const originalDescription = cleanText(article.description);
    const content = cleanText(article.content);
    const description = originalDescription || (content ? content.slice(0, 500) : null);
    if (!description) {
      return null;
    }
    return {
        provider: "gnews",
        providerArticleId: cleanText(article.id),
        title,
        description,
        content: cleanText(article.content),
        articleUrl,
        coverImage: isValidHttpUrl(image) ? image : null,
        publishedAt,
        language: cleanText(article.lang),
        source:{
            providerId: cleanText(article.source?.id),
            name: sourceName,
            websiteUrl: sourceUrl,
            country: cleanText(article.source?.country),
        }

    }
}