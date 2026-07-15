import Nav from './components/Nav'
import Hero from './sections/Hero'
import Manifesto from './sections/Manifesto'
import Sessions from './sections/Sessions'
import Artists from './sections/Artists'
import Historia from './sections/Historia'
import Archive from './sections/Archive'
import Editorial from './sections/Editorial'
import Socials from './sections/Socials'
import Footer from './sections/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Sessions />
        <Artists />
        <Historia />
        <Archive />
        <Editorial />
        <Socials />
      </main>
      <Footer />
    </>
  )
}
