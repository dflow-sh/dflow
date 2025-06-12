import { getAllBanners } from '@/actions/banners'

import BannerComponent from './ui/banner'

export default async function Home() {
  const banners = await getAllBanners()

  return <BannerComponent banners={banners?.data ?? []} />
}
