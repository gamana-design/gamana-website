export type ProductLine = "URBAN" | "CORE";
export type ProductCategory = "T-Shirts" | "Hoodies" | "Performance" | "Accessories";
export interface ProductVariant { size:string; color:string; sku:string; printTypeId:number; stock:"in"|"low"|"out"; }
export interface Product { id:string; slug:string; name:string; line:ProductLine; category:ProductCategory; price:number; compareAt?:number; image:string; gallery:string[]; blurb:string; description:string; details:string[]; tags:string[]; badge?:string; featured?:boolean; isNew?:boolean; variants:ProductVariant[]; }
export const categories:ProductCategory[]=["T-Shirts","Hoodies","Performance","Accessories"];
export function resolveSku(productSlug:string,fallback:string):string{const raw=process.env.QIKINK_SKU_MAP;if(!raw)return fallback;try{const map=JSON.parse(raw) as Record<string,string>;return map[productSlug]??fallback;}catch{return fallback;}}
