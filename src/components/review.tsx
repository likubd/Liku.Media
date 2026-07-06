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
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export default function MarqueeDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
    </div>
  );
}
