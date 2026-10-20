-- Additive migration: keep existing SKUs/order behaviour intact. No products are imported.
begin;
alter table public.gamana_products add column if not exists qikink_product_id text;
alter table public.gamana_products add column if not exists qikink_product_type text;
alter table public.gamana_product_variants add column if not exists product_sku text;
alter table public.gamana_product_variants add column if not exists design_sku text;
alter table public.gamana_product_variants add column if not exists store_sku text;
alter table public.gamana_product_variants add column if not exists product_cost numeric(10,2) check (product_cost >= 0);

-- Supplier costs and reference codes are admin-only. App server uses service_role.
alter table public.gamana_products enable row level security;
alter table public.gamana_product_variants enable row level security;
revoke all on public.gamana_products, public.gamana_product_variants from anon, authenticated;
grant select, insert, update, delete on public.gamana_products, public.gamana_product_variants to service_role;

create or replace function public.gamana_save_product(p_product jsonb, p_variants jsonb, p_id uuid default null)
returns uuid language plpgsql set search_path = public as $$
declare target_id uuid; v jsonb; idx integer := 0;
begin
  if jsonb_typeof(p_variants) <> 'array' then raise exception 'Variations must be an array'; end if;
  if p_id is null then
    insert into public.gamana_products(slug, name) values(p_product->>'slug', p_product->>'name') returning id into target_id;
  else
    select id into target_id from public.gamana_products where id = p_id for update;
    if target_id is null then raise exception 'Product not found'; end if;
  end if;
  update public.gamana_products set
    slug=p_product->>'slug', name=p_product->>'name', line=p_product->>'line', category=p_product->>'category',
    price=(p_product->>'price')::numeric, compare_at=(p_product->>'compare_at')::numeric,
    image=p_product->>'image', gallery=p_product->'gallery', blurb=p_product->>'blurb', description=p_product->>'description',
    details=p_product->'details', tags=p_product->'tags', badge=p_product->>'badge',
    featured=(p_product->>'featured')::boolean, is_new=(p_product->>'is_new')::boolean, active=(p_product->>'active')::boolean,
    print_type_id=(p_product->>'print_type_id')::integer, sku_prefix=p_product->>'sku_prefix',
    design_code=p_product->>'design_code', design_url=p_product->>'design_url', mockup_url=p_product->>'mockup_url',
    placement_sku=p_product->>'placement_sku', width_inches=(p_product->>'width_inches')::numeric, height_inches=(p_product->>'height_inches')::numeric,
    qikink_product_id=p_product->>'qikink_product_id', qikink_product_type=p_product->>'qikink_product_type', updated_at=now()
  where id=target_id;
  delete from public.gamana_product_variants where product_id=target_id;
  for v in select value from jsonb_array_elements(p_variants) loop
    insert into public.gamana_product_variants(product_id,size,color,sku,print_type_id,stock,position,product_sku,design_sku,store_sku,product_cost)
    values(target_id,v->>'size',v->>'color',v->>'sku',(v->>'print_type_id')::integer,v->>'stock',idx,v->>'product_sku',v->>'design_sku',v->>'store_sku',(v->>'product_cost')::numeric);
    idx := idx + 1;
  end loop;
  return target_id;
end;
$$;
revoke all on function public.gamana_save_product(jsonb,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.gamana_save_product(jsonb,jsonb,uuid) to service_role;
commit;
