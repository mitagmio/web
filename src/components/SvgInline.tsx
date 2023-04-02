import React, { useEffect, useState } from 'react'

export const SvgInline = (props) => {
  const [svg, setSvg] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  useEffect(() => {
    setIsLoaded(false)
    fetch(props.url, { mode: 'no-cors' })
      .then((res) => res.text())
      .then(setSvg)
      .catch(setIsErrored)
      .then(() => setIsLoaded(true))
  }, [props.url])

  return (
    <div
      className={`svgInline svgInline--${isLoaded ? 'loaded' : 'loading'} ${isErrored ? 'svgInline--errored' : ''}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
