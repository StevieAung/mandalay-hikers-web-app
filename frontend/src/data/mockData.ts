
const localImageBase = `${(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')}/storage/trails/mock`

const localImage = (name: string) => `${localImageBase}/${name}.jpg`

export const IMG = {
  hero: localImage('hero'),
  mandalayRidge: localImage('mandalayRidge'),
  deeDoke: localImage('deeDoke'),
  boots: localImage('boots'),
  lunch: localImage('lunch'),
  stars: localImage('hero'),
  topoTable: localImage('topoTable'),
  trailA: localImage('trailA'),
  trailB: localImage('trailB'),
  trailC: localImage('trailC'),
  trailD: localImage('trailD'),
  trailE: localImage('trailE'),
  trailF: localImage('trailF'),
  detailHero: localImage('detailHero'),
  detailGallery1: localImage('detailGallery1'),
  detailGallery2: localImage('detailGallery2'),
  detailGallery3: localImage('detailGallery3'),
  detailMap: localImage('detailMap'),
  eventHero: localImage('eventHero'),
  eventForest: localImage('eventForest'),
  auth: localImage('auth'),
  avatar: localImage('avatar'),
  guide: localImage('guide'),
}

