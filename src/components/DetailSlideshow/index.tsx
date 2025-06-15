'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/keyboard'
import { Pagination, Keyboard } from 'swiper/modules'
import Image from 'next/image'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Media } from '@butelkawineshop/types'
import { ReactNode } from 'react'

interface Slide {
  content: ReactNode
  className?: string
  media?: Media | null
}

interface DetailSlideshowProps {
  title: string
  media?: (number | Media)[]
  slides: Slide[]
}

export const DetailSlideshow: React.FC<DetailSlideshowProps> = ({ title, media, slides }) => {
  const firstMedia =
    media?.[0] && typeof media[0] === 'object' && 'url' in media[0] ? media[0] : null

  return (
    <div className="relative flex min-h-[50vh] w-full h-full flex-col items-center justify-center overflow-hidden md:rounded-2xl text-center">
      <div className="absolute inset-0">
        <Swiper
          modules={[Pagination, Keyboard]}
          slidesPerView={1}
          spaceBetween={10}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          direction="horizontal"
          keyboard={true}
          className="w-full h-full cursor-grab"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
              <div className="relative w-full h-full">
                {slide.media ? (  
                  <Image
                    src={getMediaUrl(slide.media.url, slide.media.updatedAt, 'winecards')}
                    alt={title}
                    fill
                    priority={index === 0}
                    quality={100}
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : index === 0 && firstMedia ? (
                  <Image
                    src={getMediaUrl(firstMedia.url, firstMedia.updatedAt, 'winecards')}
                    alt={title}
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
                <div
                  className={`relative z-10 overflow-auto flex flex-col w-full h-full items-center text-shadow-lg justify-center text-white [&_p]:[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%),_0_2px_4px_rgb(0_0_0_/_40%),_0_4px_8px_rgb(0_0_0_/_40%)] [&_a]:[text-shadow:_0_1px_2px_rgb(0_0_0_/_40%),_0_2px_4px_rgb(0_0_0_/_40%),_0_4px_8px_rgb(0_0_0_/_40%)] ${slide.className || ''}`}
                >
                  {slide.content}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
