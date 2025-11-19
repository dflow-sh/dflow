import { getPublicBanners } from '@/actions/banners'

import BannerComponent from './ui/banner'

export default async function Home() {
  const banners = await getPublicBanners()

  return <BannerComponent banners={banners?.data ?? []} />
}
