export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/api/',
        },
        sitemap: 'https://habbit-tracker-red.vercel.app/sitemap.xml',
    }
}
