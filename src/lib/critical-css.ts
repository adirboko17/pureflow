/** Above-the-fold CSS inlined in <head> so FCP does not wait on the full stylesheet.
 *  Includes critical @font-face + metric-matched fallbacks so fonts start with first paint. */
export const CRITICAL_CSS = `
@font-face{font-family:"Manrope";font-style:normal;font-weight:400;font-display:swap;src:url("/fonts/manrope-latin-400-normal.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Manrope Fallback";font-style:normal;font-weight:400;src:local("Arial");ascent-override:102.74%;descent-override:28.91%;line-gap-override:0%;size-adjust:103.76%}
@font-face{font-family:"Sora";font-style:normal;font-weight:800;font-display:swap;src:url("/fonts/sora-latin-800-normal.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Sora Fallback";font-style:normal;font-weight:800;src:local("Arial Bold");ascent-override:89%;descent-override:26.61%;line-gap-override:0%;size-adjust:108.98%}
:root{
  --radius:.5rem;
  --background:oklch(0.985 0.008 230);
  --foreground:oklch(0.22 0.03 250);
  --primary:oklch(0.42 0.07 245);
  --primary-foreground:oklch(0.98 0.01 230);
  --muted-foreground:oklch(0.36 0.035 245);
  --border:oklch(0.88 0.02 235);
  --ink:oklch(0.22 0.03 250);
  --ink-foreground:oklch(0.97 0.01 230);
  --flow:oklch(0.72 0.06 240);
  --font-sans:"Manrope","Manrope Fallback",ui-sans-serif,system-ui,sans-serif;
  --font-display:"Sora","Sora Fallback",ui-sans-serif,system-ui,sans-serif;
  --color-background:var(--background);
  --color-foreground:var(--foreground);
  --color-primary:var(--primary);
  --color-primary-foreground:var(--primary-foreground);
  --color-muted-foreground:var(--muted-foreground);
  --color-border:var(--border);
  --color-ink:var(--ink);
  --color-ink-foreground:var(--ink-foreground);
  --color-flow:var(--flow);
}
*,::before,::after{box-sizing:border-box;border:0 solid}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;min-height:100%;background:var(--color-background);color:var(--color-foreground);font-family:var(--font-sans);line-height:1.5;-webkit-font-smoothing:antialiased}
img,picture,video{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;background:none;border:0;padding:0;color:inherit}
header{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--color-border);background:color-mix(in oklab,var(--color-background) 92%,transparent);backdrop-filter:blur(10px)}
header>div{margin:0 auto;display:flex;max-width:72rem;align-items:center;justify-content:space-between;gap:.75rem;padding:.75rem 1rem}
#main-content>section:first-child{position:relative;min-height:min(72dvh,560px);overflow:hidden;color:var(--color-ink-foreground)}
#main-content>section:first-child picture{position:absolute;inset:0}
#main-content>section:first-child img{position:absolute;inset:0;height:100%;width:100%;object-fit:cover;object-position:72% center}
#main-content>section:first-child>div:first-of-type{position:absolute;inset:0;background:linear-gradient(180deg,oklch(0.16 0.032 250 / .55) 0%,oklch(0.16 0.032 250 / .78) 42%,oklch(0.14 0.03 250 / .92) 100%),linear-gradient(105deg,oklch(0.16 0.032 250 / .7) 0%,oklch(0.19 0.038 245 / .45) 55%,oklch(0.25 0.038 230 / .25) 100%)}
#main-content>section:first-child>div:last-child{position:relative;margin:0 auto;display:flex;min-height:min(72dvh,560px);max-width:72rem;flex-direction:column;justify-content:center;padding:2rem 1rem}
#main-content h1{margin:0;font-family:var(--font-display);font-weight:800;letter-spacing:-.03em;line-height:1.05;font-size:clamp(2rem,8vw,3.75rem);max-width:18ch}
#main-content>section:first-child p{margin:.75rem 0 0;max-width:36rem;font-size:1rem;line-height:1.5;color:color-mix(in oklab,var(--color-ink-foreground) 88%,transparent)}
a[href^="tel:"]{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--color-primary);color:var(--color-primary-foreground);font-weight:700;padding:.75rem 1.25rem}
@media (min-width:640px){
  #main-content>section:first-child{min-height:88vh}
  #main-content>section:first-child img{object-position:center}
  #main-content>section:first-child>div:last-child{min-height:88vh;padding:5rem 1.25rem}
}
`.replace(/\n/g, "");
