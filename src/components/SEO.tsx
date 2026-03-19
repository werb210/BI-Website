import { Helmet } from "react-helmet"

type SEOProps = {
  title: string
  description: string
}

export default function SEO({ title, description }: SEOProps) {

  return (
    <Helmet>

      <title>{title}</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

    </Helmet>
  )

}
