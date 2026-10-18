-- Apply AFTER src/lib/supabase-schema.sql. Additive; preserves existing orders.
begin;
alter table public.orders
  add column if not exists checkout_key uuid unique,
  add column if not exists request_fingerprint text,
  add column if not exists amount_paise integer,
  add column if not exists subtotal_paise integer,
  add column if not exists shipping_paise integer,
  add column if not exists payment_mode text,
  add column if not exists payment_status text not null default 'legacy',
  add column if not exists razorpay_order_id text unique,
  add column if not exists razorpay_payment_id text unique,
  add column if not exists paid_at timestamptz,
  add column if not exists fulfilment_status text not null default 'pending';

-- Only the server service role can invoke these functions. Anonymous clients
-- cannot create orders or mark payments paid by invoking PostgREST directly.
create or replace function public.gamana_create_checkout(p_order jsonb, p_items jsonb)
returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  existing public.orders;
  new_id uuid;
  item_total integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_order->>'checkout_key'));
  select * into existing from public.orders where checkout_key=(p_order->>'checkout_key')::uuid;
  if found then
    if existing.request_fingerprint is distinct from p_order->>'request_fingerprint' then
      raise exception 'Checkout key already used for different details';
    end if;
    return existing.id;
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then raise exception 'Invalid items'; end if;
  select sum(round((item->>'unit_price')::numeric*100)::integer*(item->>'quantity')::integer)
    into item_total from jsonb_array_elements(p_items) item;
  if item_total is null or item_total <= 0 or item_total <> (p_order->>'subtotal_paise')::integer
    or item_total + (p_order->>'shipping_paise')::integer <> (p_order->>'amount_paise')::integer
    or p_order->>'payment_mode' not in ('test','live') then raise exception 'Invalid totals'; end if;
  insert into public.orders (checkout_key,request_fingerprint,order_number,email,full_name,phone,address1,address2,city,province,zip,country_code,payment_gateway,total_order_value,status,amount_paise,subtotal_paise,shipping_paise,payment_mode,payment_status)
  values ((p_order->>'checkout_key')::uuid,p_order->>'request_fingerprint',p_order->>'order_number',p_order->>'email',p_order->>'full_name',p_order->>'phone',p_order->>'address1',p_order->>'address2',p_order->>'city',p_order->>'province',p_order->>'zip','IN',p_order->>'payment_gateway',(p_order->>'amount_paise')::numeric/100,case when p_order->>'payment_gateway'='COD' then 'placed' else 'payment-pending' end,(p_order->>'amount_paise')::integer,(p_order->>'subtotal_paise')::integer,(p_order->>'shipping_paise')::integer,p_order->>'payment_mode',case when p_order->>'payment_gateway'='COD' then 'cod' else 'pending' end)
  returning id into new_id;
  insert into public.order_items(order_id,product_id,product_slug,product_name,line,sku,size,color,quantity,unit_price)
  select new_id,i.product_id,i.product_slug,i.product_name,i.line,i.sku,i.size,i.color,i.quantity,i.unit_price
  from jsonb_to_recordset(p_items) as i(product_id text,product_slug text,product_name text,line text,sku text,size text,color text,quantity integer,unit_price numeric);
  return new_id;
end $$;
revoke all on function public.gamana_create_checkout(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.gamana_create_checkout(jsonb,jsonb) to service_role;

create or replace function public.gamana_mark_payment_paid(p_order_id uuid,p_payment_id text,p_amount integer,p_currency text)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare o public.orders;
begin
  select * into strict o from public.orders where id=p_order_id for update;
  if o.payment_gateway <> 'Prepaid' or o.razorpay_order_id is null or p_currency <> 'INR'
    or o.amount_paise is distinct from p_amount then raise exception 'Payment mismatch'; end if;
  if o.razorpay_payment_id is not null and o.razorpay_payment_id <> p_payment_id then raise exception 'Payment already linked'; end if;
  if o.payment_status='paid' then return; end if;
  if o.payment_status <> 'pending' then raise exception 'Order cannot accept payment'; end if;
  update public.orders set payment_status='paid',razorpay_payment_id=p_payment_id,paid_at=now(),status='paid' where id=p_order_id;
end $$;
revoke all on function public.gamana_mark_payment_paid(uuid,text,integer,text) from public, anon, authenticated;
grant execute on function public.gamana_mark_payment_paid(uuid,text,integer,text) to service_role;
commit;
