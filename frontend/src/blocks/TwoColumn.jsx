import React from 'react'

// Resolve image URL: relative paths and localhost backend URLs become NEXT_PUBLIC_PAYLOAD_URL-based; S3/external stay as-is
function getImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || ''
  if (rawUrl.startsWith('http://localhost') || rawUrl.startsWith('http://127.0.0.1')) {
    const path = rawUrl.replace(/^https?:\/\/[^/]+/, '')
    return `${baseUrl}${path}`
  }
  if (rawUrl.startsWith('http')) return rawUrl
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${cleanBase}${path}`
}

export default function TwoColumn({ heading, text, direction, image }) {
  const isReverse = direction === "reverse"
  const imageUrl = image?.url ? getImageUrl(image.url) : null

  return (
    <section className="bg-white py-16 md:py-24">
      <div
        className={`max-w-7xl mx-auto px-6 flex flex-col items-center gap-12 md:gap-20 ${
          isReverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Content Column */}
        <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {heading && (
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              {heading}
            </h2>
          )}
          {text && (
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
              {text}
            </p>
          )}
        </div>

        {/* Image Column */}
        {imageUrl && (
          <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img
                src={imageUrl}
                alt={image?.alt || heading || "Two column image"}
                className="relative w-full h-auto rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
