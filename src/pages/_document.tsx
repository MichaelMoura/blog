import Document, {Html,Main,NextScript, Head} from 'next/document';

export default class MyDocument extends Document {
  render() {
    return(
      <Html lang='pt-br'>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='true' />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    )
  }
}