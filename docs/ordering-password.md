# Temporarily protect checkout with a password

The checkout asks for a password before showing delivery and payment. The server also checks the password session before it creates an order, so the page cannot be bypassed with a direct request. The private session uses the site's existing `ADMIN_SESSION_SECRET`; if that setting is missing, checkout stays paused.

## Set the password privately in Vercel

1. Open the **gamana** project in Vercel.
2. Open **Settings → Environment Variables**.
3. Add a new variable named `ORDER_PASSWORD` and choose **Production** only.
4. Use a private password with **12 to 128 characters**. Save it in a password manager. Do not send it in chat or add it to a project file.
5. Redeploy the production website so the new setting takes effect.

Once set, enter that password on the checkout page. Access lasts for up to one hour in that browser. The password is not saved in the browser or in the order record.

## Pause orders again

If `ORDER_PASSWORD` is missing or shorter than 12 characters, checkout stays paused. Changing the password makes earlier checkout sessions stop working. Apply environment-variable changes with a new production deployment.

The password does not hide products or prices; it only blocks checkout and order creation. Shop visitors can still see the products and their prices.
