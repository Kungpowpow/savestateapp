export type IGDBImageSize = 
  | 'thumb' 
  | 'cover_small' 
  | 'screenshot_med' 
  | 'cover_big' 
  | 'logo_med' 
  | 'screenshot_big' 
  | 'screenshot_huge' 
  | 'thumb' 
  | 'micro' 
  | '720p' 
  | '1080p';

export class IGDBImageHelper {
  /**
   * Transforms an IGDB image URL to use a specific size
   * @param originalUrl - The original IGDB image URL
   * @param size - The desired image size
   * @returns The transformed URL with the specified size
   */
  static getImageUrl(originalUrl: string, size: IGDBImageSize = 'cover_big'): string {
    if (!originalUrl) return '';
    
    return originalUrl
      .replace('thumb', size)
      .replace('//images', 'https://images');
  }

  /**
   * Gets a cover image URL with the specified size
   * @param coverUrl - The cover URL from IGDB
   * @param size - The desired size (default: cover_big)
   * @returns The transformed cover URL
   */
  static getCoverUrl(coverUrl: string, size: IGDBImageSize = 'cover_big'): string {
    return this.getImageUrl(coverUrl, size);
  }

  /**
   * Gets a screenshot URL with the specified size
   * @param screenshotUrl - The screenshot URL from IGDB
   * @param size - The desired size (default: screenshot_big)
   * @returns The transformed screenshot URL
   */
  static getScreenshotUrl(screenshotUrl: string, size: IGDBImageSize = 'screenshot_big'): string {
    return this.getImageUrl(screenshotUrl, size);
  }

  /**
   * Gets a logo URL with the specified size
   * @param logoUrl - The logo URL from IGDB
   * @param size - The desired size (default: logo_med)
   * @returns The transformed logo URL
   */
  static getLogoUrl(logoUrl: string, size: IGDBImageSize = 'logo_med'): string {
    return this.getImageUrl(logoUrl, size);
  }

  /**
   * Gets a video thumbnail URL with the specified size
   * @param videoUrl - The video URL from IGDB
   * @param size - The desired size (default: thumb)
   * @returns The transformed video thumbnail URL
   */
  static getVideoThumbnailUrl(videoUrl: string, size: IGDBImageSize = 'thumb'): string {
    return this.getImageUrl(videoUrl, size);
  }
}

// Convenience functions for common use cases
export const getCoverImage = (coverUrl: string, size: IGDBImageSize = 'cover_big') => 
  IGDBImageHelper.getCoverUrl(coverUrl, size);

export const getScreenshotImage = (screenshotUrl: string, size: IGDBImageSize = 'screenshot_big') => 
  IGDBImageHelper.getScreenshotUrl(screenshotUrl, size);

export const getLogoImage = (logoUrl: string, size: IGDBImageSize = 'logo_med') => 
  IGDBImageHelper.getLogoUrl(logoUrl, size);

export const getVideoThumbnail = (videoUrl: string, size: IGDBImageSize = 'thumb') => 
  IGDBImageHelper.getVideoThumbnailUrl(videoUrl, size); 