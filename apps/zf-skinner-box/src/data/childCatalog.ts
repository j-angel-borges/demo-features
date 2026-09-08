import type { SkinnerVideoItem } from '../types/skinner.types.js';
import catalogJson from './videoCatalog.json';

export const CHILD_CATALOG: SkinnerVideoItem[] = (catalogJson.childVideos as unknown as SkinnerVideoItem[]);
export default CHILD_CATALOG;
