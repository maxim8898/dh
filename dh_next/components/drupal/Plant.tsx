"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import type { DrupalProduct } from "@/types"

interface PlantProps {
  node: DrupalProduct
}

export function Plant({ node, ...props }: PlantProps) {
  const hasMultipleImages = node.images && node.images.length > 1

  return (
    <article
      {...props}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-12"
    >
      <h1 className="mb-6 text-5xl md:text-6xl font-extrabold text-green-900 leading-tight tracking-tight">
        {node.title}
      </h1>

      {node.images?.length > 0 && (
        <figure className="mb-8 overflow-hidden rounded-2xl shadow-sm">
          {hasMultipleImages ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,       // 3 секунды между слайдами
                disableOnInteraction: false, // продолжать автоплей после взаимодействия
              }}
              loop
              className="rounded-2xl"
            >
              {node.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image.url}
                    alt={image.alt || ""}
                    width={768}
                    height={480}
                    className="w-full h-auto object-cover"
                    priority={index === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Image
              src={node.images[0].url}
              alt={node.images[0].alt || ""}
              width={768}
              height={480}
              className="w-full h-auto object-cover"
              priority
            />
          )}
        </figure>
      )}

      {node.body?.processed && (
        <div
          className="prose prose-lg prose-green max-w-none font-light text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: node.body.processed }}
        />
      )}
    </article>
  )
}
