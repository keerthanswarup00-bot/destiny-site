"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SITE, whatsappUrl } from "@/lib/constants";

const photos = [
  { src: "/media/work/weddings/wedding-001-800.webp", alt: "Wedding story, captured by Destiny" },
  { src: "/media/work/weddings/wedding-002-800.webp", alt: "Wedding photography by Destiny" },
  { src: "/media/work/weddings/wedding-003-800.webp", alt: "A candid wedding moment" },
  { src: "/media/work/weddings/wedding-004-800.webp", alt: "A celebration preserved in photographs" },
  { src: "/media/work/weddings/wedding-005-800.webp", alt: "A beautiful moment from a wedding story" },
];

function Icon({ name }: { name: "whatsapp" | "phone" | "mail" | "instagram" | "globe" | "download" }) {
  const paths: Record<typeof name, ReactNode> = {
    whatsapp: <><path d="M20 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.2-4.3A8.4 8.4 0 1 1 20 11.5Z" /><path d="M8.5 8.2c.4 2.7 2.2 4.5 4.9 5" /></>,
    phone: <path d="M6.6 3.5 9.5 7l-1.8 2.2a14 14 0 0 0 7.1 7.1l2.2-1.8 3.5 2.9-.8 3c-.2.7-.9 1.1-1.6 1C9.6 18.2 5.8 14.4 4.6 6.9c-.1-.7.3-1.4 1-1.6Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 7 9 6 9-6" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M4 16v4h16v-4" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function DestinyConnectClient() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.controls = false;
    video.removeAttribute("controls");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.controlsList.add("nodownload", "noplaybackrate", "noremoteplayback");
    const play = () => {
      if (document.visibilityState !== "visible") return;
      video.play().catch(() => {
        // iOS may defer autoplay until the browser permits muted playback.
      });
    };
    video.addEventListener("canplay", play, { once: true });
    document.addEventListener("visibilitychange", play);
    if (video.readyState >= 2) play();
    return () => {
      video.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  const whatsapp = whatsappUrl("Hi Destiny, I'd like to enquire about photography or an event.");

  return (
    <div className="destiny-nfc-page">
      <div className="nfc-shell">
        <header className="nfc-topline">
          <a className="nfc-wordmark" href="/" aria-label="Destiny home">Destiny</a>
          <span>Events + Photography</span>
        </header>

        <section className="nfc-hero" aria-label="Destiny Events and Photography introduction">
          <img src="/media/hero.jpg" alt="A wedding couple at their ceremony" fetchPriority="high" />
          <div className="nfc-hero-copy">
            <div className="nfc-eyebrow">Weddings · Events · Films</div>
            <h1>Every moment.<br />A story worth keeping.</h1>
            <p>Your dream, our passion.</p>
          </div>
        </section>

        <section className="nfc-intro">
          <p>We bring photography, filmmaking and event production together to preserve the moments that matter. From weddings and celebrations to corporate and brand stories, every detail is handled with creativity, care and purpose.</p>
          <div className="nfc-since">A new chapter in a legacy since 1972</div>
        </section>

        <nav className="nfc-actions" aria-label="Quick links">
          <a className="nfc-action nfc-primary" href={whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" />Enquire on WhatsApp</a>
          <a className="nfc-action" href="tel:+919108727795"><Icon name="phone" />Call the Studio</a>
          <a className="nfc-action" href="/destiny-contact.vcf" download><Icon name="download" />Save Contact</a>
          <a className="nfc-action" href={SITE.instagram} target="_blank" rel="noopener noreferrer"><Icon name="instagram" />Instagram</a>
          <a className="nfc-action nfc-wide" href={SITE.url} target="_blank" rel="noopener noreferrer"><Icon name="globe" />Visit Website</a>
        </nav>

        <section aria-labelledby="nfc-services-title">
          <div className="nfc-section-head"><h2 id="nfc-services-title">What we create</h2><span>Our work</span></div>
          <div className="nfc-services">
            <span>Wedding Photography</span><span>Wedding Films</span><span>Pre-wedding</span><span>Engagements</span><span>Events & Celebrations</span><span>Corporate Events</span><span>Brand & Product</span><span>Fashion & Portraits</span><span>Academic & Cultural</span>
          </div>
        </section>

        <section className="nfc-film-section" aria-labelledby="nfc-film-title">
          <div className="nfc-section-head"><h2 id="nfc-film-title">A glimpse of our films</h2><span>Watch</span></div>
          <div className="nfc-video-frame">
            <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/media/wedding-film-poster.jpg" aria-label="Destiny featured wedding film">
              <source src="/media/wedding-film-720.mp4" type="video/mp4" />
              <source src="/media/wedding-film.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="nfc-film-label"><span>Stories, beautifully captured</span><small>Featured film</small></div>
        </section>

        <section className="nfc-gallery-section" aria-labelledby="nfc-gallery-title">
          <div className="nfc-section-head"><h2 id="nfc-gallery-title">Selected moments</h2><span>Photography</span></div>
          <div className="nfc-photo-grid">
            {photos.map((photo) => <a className="nfc-photo" href={photo.src} key={photo.src} aria-label={photo.alt}>
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            </a>)}
          </div>
          <a className="nfc-gallery-link" href={SITE.url + "/work"} target="_blank" rel="noopener noreferrer">Explore the full portfolio <span aria-hidden="true">↗</span></a>
        </section>

        <section className="nfc-contact" aria-labelledby="nfc-contact-title">
          <h2 id="nfc-contact-title">Let’s make something memorable.</h2>
          <a className="nfc-contact-row" href="tel:+919108727795"><Icon name="phone" /><div><span>Call us</span>+91 91087 27795</div></a>
          <a className="nfc-contact-row" href="mailto:destinyeventsandphotography@gmail.com"><Icon name="mail" /><div><span>Email</span>destinyeventsandphotography@gmail.com</div></a>
          <a className="nfc-contact-row" href={SITE.instagram} target="_blank" rel="noopener noreferrer"><Icon name="instagram" /><div><span>Instagram</span>@destinyeventsandphotography</div></a>
          <a className="nfc-contact-row" href={SITE.url} target="_blank" rel="noopener noreferrer"><Icon name="globe" /><div><span>Website</span>destinyeventsandphotography.com</div></a>
        </section>

        <footer className="nfc-footer"><span>DESTINY · EVENTS + PHOTOGRAPHY</span><a href={SITE.url} target="_blank" rel="noopener noreferrer">Visit full website ↗</a></footer>
      </div>

      <style jsx global>{`
        body:has(.destiny-nfc-page) > header,
        body:has(.destiny-nfc-page) > footer { display: none !important; }
        body:has(.destiny-nfc-page) { background: #0B0B0C; }
        body:has(.destiny-nfc-page) > main { margin: 0; padding: 0; }
        .destiny-nfc-page { min-height: 100svh; background:#0B0B0C; color:#F3F1EC; font-family:var(--font-manrope),system-ui,sans-serif; -webkit-font-smoothing:antialiased; line-height:1.55; overflow-x:hidden; }
        .destiny-nfc-page * { box-sizing:border-box; }
        .destiny-nfc-page a { color:inherit; text-decoration:none; }
        .nfc-shell { width:min(100% - 28px,480px); margin:0 auto; padding:env(safe-area-inset-top) 0 calc(28px + env(safe-area-inset-bottom)); }
        .nfc-topline { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:23px 2px 18px; font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#9C9A96; border-bottom:1px solid rgb(243 241 236 / .12); margin-bottom:16px; }
        .nfc-wordmark { font-family:var(--font-fraunces),Georgia,serif; font-size:21px; letter-spacing:.02em; color:#F3F1EC; text-transform:none; }
        .nfc-hero { position:relative; overflow:hidden; background:#141416; aspect-ratio:4/4.7; isolation:isolate; }
        .nfc-hero > img { width:100%; height:100%; object-fit:cover; display:block; opacity:.93; animation:nfc-hero-settle 1.1s cubic-bezier(.2,.7,.2,1) both; }
        .nfc-hero:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(11,11,12,.02) 25%,rgba(11,11,12,.82) 100%); z-index:0; }
        .nfc-hero-copy { position:absolute; z-index:1; left:23px; right:23px; bottom:24px; animation:nfc-copy-rise .8s .12s cubic-bezier(.2,.7,.2,1) both; }
        .nfc-eyebrow { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:#C9A15A; font-weight:700; }
        .nfc-hero h1 { font-family:var(--font-fraunces),Georgia,serif; font-weight:400; font-size:clamp(36px,9.5vw,51px); line-height:1.02; letter-spacing:-.025em; margin:12px 0 11px; }
        .nfc-hero-copy p { margin:0; color:#D8D6D2; font-size:13px; line-height:1.6; }
        .nfc-intro { padding:25px 3px 23px; border-bottom:1px solid rgb(243 241 236 / .12); animation:nfc-copy-rise .7s .18s both; }
        .nfc-intro p { font-size:13px; line-height:1.85; color:#D8D6D2; margin:0; }
        .nfc-since { display:inline-flex; align-items:center; gap:9px; margin-top:15px; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:#C9A15A; }
        .nfc-since:before { content:""; width:24px; height:1px; background:#C9A15A; }
        .nfc-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:21px 0; }
        .nfc-action { min-height:54px; display:flex; align-items:center; justify-content:center; gap:9px; padding:13px 9px; border:1px solid rgb(243 241 236 / .32); border-radius:1px; font-size:11px; font-weight:700; text-align:center; transition:background .25s ease,color .25s ease,border-color .25s ease,transform .25s ease; }
        .nfc-action.nfc-primary { background:#C9A15A; color:#0B0B0C; border-color:#C9A15A; }
        .nfc-action svg { width:16px; height:16px; flex:none; }
        .nfc-action.nfc-wide { grid-column:1 / -1; }
        @media(hover:hover){.nfc-action:hover{background:#F3F1EC;color:#0B0B0C;border-color:#F3F1EC}.nfc-action.nfc-primary:hover{background:#b58c45;border-color:#b58c45}}
        .nfc-action:active { transform:scale(.985); }
        .nfc-section-head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin:12px 0 13px; }
        .nfc-section-head h2,.nfc-contact h2 { font:400 27px/1.15 var(--font-fraunces),Georgia,serif; margin:0; letter-spacing:-.025em; }
        .nfc-section-head > span { font-size:9px; color:#9C9A96; letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; }
        .nfc-services { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:25px; }
        .nfc-services span { font-size:10px; padding:9px 10px; border:1px solid rgb(243 241 236 / .2); color:#D8D6D2; }
        .nfc-video-frame { overflow:hidden; background:#141416; aspect-ratio:16/9; }
        .nfc-video-frame video { display:block; width:100%; height:100%; object-fit:cover; background:#0B0B0C; pointer-events:none; appearance:none; -webkit-appearance:none; }
        .nfc-video-frame video::-webkit-media-controls,.nfc-video-frame video::-webkit-media-controls-enclosure,.nfc-video-frame video::-webkit-media-controls-panel,.nfc-video-frame video::-webkit-media-controls-overlay-play-button,.nfc-video-frame video::-webkit-media-controls-start-playback-button { display:none!important; -webkit-appearance:none!important; opacity:0!important; visibility:hidden!important; }
        .nfc-film-label { display:flex; justify-content:space-between; gap:10px; align-items:center; font-size:11px; margin:12px 2px 23px; border-bottom:1px solid rgb(243 241 236 / .12); padding-bottom:14px; }
        .nfc-film-label small { font-size:9px; color:#9C9A96; letter-spacing:.12em; text-transform:uppercase; }
        .nfc-gallery-section { margin-top:28px; }
        .nfc-photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:start; }
        .nfc-photo { display:block; overflow:hidden; align-self:start; background:#141416; }
        .nfc-photo img { display:block; width:100%; height:auto; object-fit:contain; transition:transform .6s ease; }
        @media(hover:hover){.nfc-photo:hover img{transform:scale(1.035)}}
        .nfc-gallery-link { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgb(243 241 236 / .12); padding:15px 2px; margin-top:8px; font-size:12px; color:#C9A15A!important; }
        .nfc-contact { background:#141416; border:1px solid rgb(243 241 236 / .12); padding:19px; margin-top:25px; }
        .nfc-contact h2 { font-size:25px; margin-bottom:17px; }
        .nfc-contact-row { display:flex; gap:12px; align-items:center; padding:12px 0; border-top:1px solid rgb(243 241 236 / .12); font-size:11px; overflow-wrap:anywhere; }
        .nfc-contact-row svg { width:16px; height:16px; color:#C9A15A; flex:none; }
        .nfc-contact-row span { color:#9C9A96; display:block; font-size:9px; margin-bottom:4px; letter-spacing:.1em; text-transform:uppercase; }
        .nfc-footer { display:flex; justify-content:space-between; gap:12px; margin-top:25px; color:#9C9A96; font-size:9px; letter-spacing:.06em; }
        .nfc-footer a { color:#C9A15A; white-space:nowrap; }
        @keyframes nfc-copy-rise { from {opacity:0;transform:translateY(12px)} to {opacity:1;transform:translateY(0)} }
        @keyframes nfc-hero-settle { from {opacity:.6;transform:scale(1.025)} to {opacity:.93;transform:scale(1)} }
        @media(min-width:520px){.nfc-shell{padding-top:8px}.nfc-topline{padding-top:28px}.nfc-hero{aspect-ratio:4/4.4}}
        @media(prefers-reduced-motion:reduce){.nfc-photo img{transition:none}.nfc-hero > img,.nfc-hero-copy{animation:none!important}}
      `}</style>
    </div>
  );
}
