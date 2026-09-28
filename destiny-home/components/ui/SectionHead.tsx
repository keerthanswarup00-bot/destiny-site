export default function SectionHead({ id, title, intro }: { id?: string; title: string; intro?: string }) {
  return (
    <div className="mb-6 md:mb-9">
      <h2 id={id} className="max-w-[16ch] font-display text-[clamp(24px,6vw,36px)] font-normal italic leading-[1.1]">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-mute">{intro}</p>}
    </div>
  );
}
