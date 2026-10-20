// Sur GitHub Pages, le site vit dans un sous-dossier (https://pseudo.github.io/nom-du-depot/).
// Le workflow GitHub définit BASE_PATH ; en local, il est vide et l'app reste sur http://localhost:3000.
const basePath = process.env.BASE_PATH || undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Génère un site 100 % statique dans le dossier `out/` (HTML, CSS, JS).
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
