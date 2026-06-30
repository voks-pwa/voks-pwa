import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { AudioPlayerCard } from '@/components/player/AudioPlayerCard'
import { CurrentShowCard } from '@/components/programs/CurrentShowCard'
import { useAnnouncers } from '@/hooks/useAnnouncers'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { FeaturedPrograms } from '@/components/programs/FeaturedPrograms'
import { useOwncastStatus } from '@/hooks/useOwncastStatus'
import { useVoksPlus } from '@/hooks/useVoksPlus'
import { FaPlay } from 'react-icons/fa'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { TodayScheduleWidget } from '@/components/programs/TodayScheduleWidget'
import { MissionWidget } from "@/features/missions/components/MissionWidget";

// Impor ikon dari lucide-react untuk komponen profil dan quick access
import { ChevronRight, Radio, Calendar, Mic2, Bell } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

import 'swiper/css'
import { useAuth } from '@/features/auth/useAuth'

export function HomePage() {
  const { user, loading } = useAuth()
  const { data: profile } = useProfile()

  console.log('LOADING', loading)
  console.log('USER', user)
  console.log('METADATA', user?.user_metadata)

  const { data: voksPlus } = useVoksPlus()
  const { data: announcers } = useAnnouncers()
  const { data: owncast } = useOwncastStatus()

  return (
    <AppLayout>
          <Header />

          {/* USER PROFILE CARD (JIKA SUDAH LOGIN) */}
          {!loading && user && (
            <Link
              to="/profile"
              className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div>
                  <p className="font-bold text-gray-800">{profile?.display_name}</p>
                  <p className="text-xs text-gray-400 font-medium">{profile?.badge_name || 'Member'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          )}

          {/* BANNER TRANSFORMATION */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[32px]
              bg-gradient-to-br
              from-[#4E523C]
              via-[#726743]
              to-[#bda752]
              p-8
              text-white
              shadow-sm
              mb-8
            "
          >
            <div className="relative z-10">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-white/70
                "
              >
                VOKS NEXT
              </p>

              <h1
                className="
                  mt-3
                  text-4xl
                  font-black
                  leading-tight
                "
              >
                New Experience
                <br />
                Transformation
              </h1>

              <p
                className="
                  mt-4
                  max-w-xs
                  text-white/80
                "
              >
                Listen. Watch. Discover. Connect.
              </p>
            </div>

            <div
              className="
                absolute
                -right-8
                -top-8
                h-40
                w-40
                rounded-full
                bg-white/10
                blur-2xl
              "
            />

            <div
              className="
                absolute
                -bottom-10
                -left-10
                h-48
                w-48
                rounded-full
                bg-white/10
                blur-3xl
              "
            />
          </section>

          <div className="flex w-full flex-col gap-6">
            {owncast?.online && (
              <Link
                to="/live"
                className="
                  overflow-hidden
                  rounded-3xl
                  bg-[#5B5B3F]
                  p-5
                  text-white
                  shadow
                  transition
                  hover:opacity-95
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
                      🔴 LIVE STUDIO NOW
                    </p>

                    <h2 className="text-xl font-bold">
                      Watch Voks Visual Radio
                    </h2>

                    <p className="mt-1 text-sm text-white/80">
                      Join the live video stream from our studio
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-red-600
                      text-lg
                      font-bold
                      animate-pulse
                    "
                  >
                    LIVE
                  </div>
                </div>
              </Link>
            )}

            
            
            <NotificationCenter />
            <MissionWidget />
            
            {/* QUICK ACCESS SECTION DENGAN IKON YANG SUDAH DIPERBAIKI */}
            <section>
              <h2
                className="
                  mb-3
                  px-1
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-400
                "
              >
                Quick Access
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <Link
                  to="/programs"
                  className="rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/60 hover:shadow-md transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 mb-2 transition-colors group-hover:bg-indigo-100">
                    <Radio size={22} />
                  </div>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Programs</p>
                </Link>

                <Link
                  to="/schedule"
                  className="rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/60 hover:shadow-md transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 mb-2 transition-colors group-hover:bg-orange-100">
                    <Calendar size={22} />
                  </div>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Schedule</p>
                </Link>

                <Link
                  to="/announcers"
                  className="rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/60 hover:shadow-md transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500 mb-2 transition-colors group-hover:bg-cyan-100">
                    <Mic2 size={22} />
                  </div>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Hosts</p>
                </Link>

                <Link
                  to="/notifications"
                  className="rounded-2xl bg-white p-4 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/60 hover:shadow-md transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 mb-2 transition-colors group-hover:bg-amber-100">
                    <Bell size={22} />
                  </div>
                  <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900">Alerts</p>
                </Link>
              </div>
            </section>
            
            <AudioPlayerCard />
            <CurrentShowCard />
            
            <section className="rounded-3xl bg-white p-6 shadow">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#bda752]">
                    Premium Content
                  </p>
                  <h2 className="text-2xl font-bold">Voks+</h2>
                </div>

                <Link to="/plus" className="text-sm font-medium text-primary">
                  View All
                </Link>
              </div>

              <Swiper modules={[Autoplay]} spaceBetween={16} slidesPerView={1.15}>
                {voksPlus?.map((item) => {
                  const image =
                    item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url ??
                    item._embedded?.['wp:featuredmedia']?.[0]?.source_url

                  return (
                    <SwiperSlide key={item.id}>
                      <Link to={`/plus/${item.slug}`} className="block">
                        <div className="overflow-hidden rounded-3xl bg-gray-50">
                          <div className="relative">
                            {image && (
                              <img
                                src={image}
                                alt={item.title.rendered}
                                className="aspect-video w-full object-cover"
                              />
                            )}

                            <div className="absolute inset-0 bg-black/20" />

                            <div className="absolute left-4 top-4">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                                {item.acf?.content_type}
                              </span>
                            </div>

                            <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                              <FaPlay />
                            </div>
                          </div>

                          <div className="p-4">
                            <h3 className="line-clamp-2 text-lg font-bold">
                              {item.title.rendered}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">{item.acf?.guest_name}</p>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">
                                {item.acf?.duration}
                              </span>
                              <span className="text-xs font-semibold text-primary">
                                Watch Now
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </section>
            
            <section className="rounded-3xl bg-white p-6 shadow">
              <TodayScheduleWidget />
            </section>
            
            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#bda752]">
                  Discover
                </p>
                <h2 className="text-2xl font-bold">Featured Programs</h2>
              </div>
              <FeaturedPrograms />
            </section>
            
            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Voks Personalities
              </h2>

              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={3.2}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
              >
                {announcers?.map((announcer) => {
                  const image =
                    announcer._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium_large?.source_url ??
                    announcer._embedded?.['wp:featuredmedia']?.[0]?.source_url

                  return (
                    <SwiperSlide key={announcer.id}>
                      <Link to={`/announcers/${announcer.slug}`} className="block">
                        <img
                          src={image}
                          alt={announcer.title.rendered}
                          className="aspect-square w-full rounded-full object-cover border-4 border-[#bda752]"
                        />
                        <p className="mt-2 text-center text-sm font-medium">
                          {announcer.title.rendered}
                        </p>
                      </Link>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </section>
          </div>

        </AppLayout>
    )
}
