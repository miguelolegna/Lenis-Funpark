const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/Home'),
  '/parque': () => import('../pages/OParque'),
  '/festas': () => import('../pages/Festas'),
  '/contactos': () => import('../pages/Contactos'),
  '/admin/login': () => import('../pages/admin/Login'),
};

const routeImages: Record<string, string[]> = {
  '/': ['/Fotos/OverView.webp', '/logos/Logo-sem_fundo1.png'],
  '/parque': [
    '/Fotos/trampolins2.webp',
    '/Fotos/playground.webp',
    '/Fotos/parent.webp',
    '/Fotos/futebol.webp',
    '/Fotos/matraquilos.webp',
    '/Fotos/escorrega_ondas.webp',
    '/Fotos/team/ines.webp',
    '/Fotos/team/helena.webp',
    '/Fotos/team/ana.webp',
    '/Fotos/team/tatiana.webp'
  ],
  '/festas': [
    '/Fotos/zona_de_bolo.webp',
    '/Fotos/feliz_aniversário.webp',
    '/Fotos/ball_pitt.webp',
    '/Fotos/escorrega_grande.webp'
  ],
  '/contactos': ['/logos/Logo-sem_fundo1.png']
};

const preloadedRoutes = new Set<string>();

export function preloadRoute(path: string) {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (preloadedRoutes.has(cleanPath)) return;
  preloadedRoutes.add(cleanPath);

  // Pré-carrega o chunk JavaScript da rota
  const importer = routeImports[cleanPath];
  if (importer) {
    importer().catch(() => {});
  }

  // Pré-carrega as imagens críticas da rota na cache do navegador
  const images = routeImages[cleanPath];
  if (images && typeof window !== 'undefined') {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }
}

export function preloadAllPublicRoutes() {
  if (typeof window === 'undefined') return;
  const idleCallback =
    window.requestIdleCallback ||
    ((cb: IdleRequestCallback) => setTimeout(cb, 600));

  idleCallback(() => {
    Object.keys(routeImports).forEach((route) => {
      preloadRoute(route);
    });
  });
}
