import { useState } from 'react'
import { FAQ_ITEMS } from '../seoContent'

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
})

export function SeoSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="seo-section" id="faq" aria-labelledby="faq-heading">
      <div className="seo-intro">
        <h2 className="section-title">یادآور چک و مدیریت چک، ساده و رایگان</h2>
        <p>
          چکینو یک <strong>یادآور چک</strong> رایگان است که به شما در{' '}
          <strong>مدیریت چک</strong>‌های پرداختی و دریافتی کمک می‌کند. تاریخ سررسید هر
          چک را ثبت کنید تا پیش از سررسید نوتیفیکیشن یادآوری دریافت کنید و هیچ چکی از
          قلم نیفتد.
        </p>
      </div>

      <h2 className="section-title" id="faq-heading">
        سوالات متداول
      </h2>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div className="faq-item" key={item.question}>
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {item.question}
                <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && <p className="faq-answer">{item.answer}</p>}
            </div>
          )
        })}
      </div>

      <script type="application/ld+json">{FAQ_JSON_LD}</script>
    </section>
  )
}
