import { Helmet } from "react-helmet"

export default function SEO({title, description}) {

  return (
    <Helmet>

      <title>{title}</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

    </Helmet>
  )

}
