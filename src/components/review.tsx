import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";

const reviews = [
  {
    name: "Asadul Islam",
    username: "Asad Publishers",
    body: "Liku Media's print quality and graphics design are truly exceptional. They created an amazing cover design and printed our books beautifully.",
    img: "https://avatar.vercel.sh/asad",
  },
  {
    name: "Rehana Akhter",
    username: "Unique Boutiques",
    body: "We hired Liku Media for our e-commerce website and custom accounting software. Their speed, execution, and support were fantastic.",
    img: "https://avatar.vercel.sh/rehana",
  },
  {
    name: "Tanvir Rahman",
    username: "TechValley Ltd",
    body: "We had a complete ERP system built for our company. Liku Media's development team is extremely professional and highly skilled.",
    img: "https://avatar.vercel.sh/tanvir",
  },
  {
    name: "Sabina Yesmin",
    username: "Agro Life",
    body: "The mobile app and website design are incredibly sleek and user-friendly. The feedback from our customers has been wonderful.",
    img: "https://avatar.vercel.sh/sabina",
  },
  {
    name: "Farhan Ahmed",
    username: "Creative Hub",
    body: "Their logo design and branding services are top-notch. Many thanks to the Liku Media team for delivering modern and trendy designs.",
    img: "https://avatar.vercel.sh/farhan",
  },
  {
    name: "Mehedi Hasan",
    username: "Fast Logistics",
    body: "They built our business website and tracking software in record time. Liku Media is definitely the best choice for any digital service.",
    img: "https://avatar.vercel.sh/mehedi",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-3xl border p-6 transition-all duration-300",
        // light styles
        "border-black/5 bg-black/[0.01] hover:bg-black/[0.03] hover:border-black/10",
        // dark styles
        "dark:border-white/5 dark:bg-white/[0.01] dark:hover:bg-white/[0.03] dark:hover:border-primary/30",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full border border-black/5 dark:border-white/10" width="40" height="40" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            {name}
          </figcaption>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{body}</blockquote>
    </figure>
  );
};

export default function MarqueeDemo() {
  return (
    <div className="relative flex h-[380px] w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:25s] gap-6">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:25s] gap-6 mt-4">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent"></div>
    </div>
  );
}
