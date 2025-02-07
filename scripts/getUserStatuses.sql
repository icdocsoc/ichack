SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    CASE
        WHEN t.id IS NOT NULL THEN concat('https://my.ichack.org/register?token=', t.id)
        END AS user_url
FROM public.users u
LEFT JOIN public.token t ON u.id = t.user_id AND t.type = 'registration_link';