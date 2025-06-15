'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import Image from 'next/image'
import RichText from '@/components/RichText'
import type { Slideshow } from '@butelkawineshop/types'
import 'swiper/css'
import 'swiper/css/effect-fade'

interface ContentSlideshowProps {
  slides: Slideshow['slides']
}

export default function ContentSlideshow({ slides }: ContentSlideshowProps) {
  return (
    <div className="relative w-full flex h-[500px] cursor-grab">
      <Swiper
        effect="fade"
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="w-full h-full md:rounded-xl"
      >
        {slides.map((slide, index) => {
          const media = typeof slide.media === 'number' ? null : slide.media
          return (
            <SwiperSlide key={slide.id || index} className="relative">
              <div className=" absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent z-10" />
              {media && (
                <Image
                  src={media.url || ''}
                  alt={media.alt || slide.headline}
                  fill
                  className="object-cover"
                  priority={slide.order === 1}
                />
              )}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h2 className="text-xl md:text-4xl font-accent mb-4">{slide.headline}</h2>
                  {slide.tagline && <p className="text-base md:text-xl mb-6">{slide.tagline}</p>}
                  {slide.content && (
                    <div className="prose prose-invert prose-sm md:prose-lg">
                      <RichText content={JSON.stringify(slide.content)} />
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
