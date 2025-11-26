import { getPublicBanners } from "@core/actions/banners"

import BannerComponent from "@core/components/ui/banner"

export default async function Home() {
  const banners = await getPublicBanners()

  return <BannerComponent banners={banners?.data ?? []} />
}
