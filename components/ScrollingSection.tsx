"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import SignUpDialog from "./SignUpDialog";
import CustomerButtons from "./CustomerButtons";
export type SectionProps = {
  children: React.ReactNode;
  direction?: "left" | "right";
  containerClassName?: string; // classes for the outer container
  innerClassName?: string; // classes for the inner container
  style?: React.CSSProperties;
  animationType?: "slide" | "fade";
};

const Section = ({
  children,
  direction = "left",
  containerClassName = "",
  innerClassName = "max-w-3xl mx-auto text-center py-10",
  style,
  animationType = "slide",
}: SectionProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants =
    animationType === "fade"
      ? {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 1.8 } },
        }
      : {
          hidden: { opacity: 0, x: direction === "left" ? -100 : 100 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
        };

  return (
    <div className={`w-full ${containerClassName}`} style={style}>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className={`my-[10vh] px-4 ${innerClassName}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function ScrollingSections() {
  return (
    // The container still has a tall height for preview
    <div className="py-8 min-h-[50vh] bg-gray-100 ">
      <Section animationType="slide" direction="left">
        <h2 className="text-4xl font-bold text-violet-900">
          Why Our Platform?
        </h2>
        <p className="mt-4 text-lg text-gray-700">
          Discover a new way to manage your business and grow your network.
        </p>

        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts of sentences fly into your mouth. Even
          the all-powerful Pointing has no control about the blind texts it is
          an almost unorthographic life One day however a small line of blind
          text by the name of Lorem Ipsum decided to leave for the far World of
          Grammar. The Big Oxmox advised her not to do so, because there were
          thousands of bad Commas, wild Question Marks and devious Semikoli, but
          the Little Blind Text didn’t listen. She packed her seven versalia,
          put her initial into the belt and made herself on the way. When she
          reached the first hills of the Italic Mountains, she had a last view
          back on the skyline of her hometown Bookmarksgrove, the headline of
          Alphabet Village and the subline of her own road, the Line Lane.
          Pityful a rethoric question ran over her cheek, then
        </p>
      </Section>
      <Section
        animationType="fade"
        containerClassName="w-full"
        innerClassName="w-full text-center py-10"
        style={{
          background:
            "linear-gradient(to right, rgba(84,72,213,1), rgba(84,72,213,0.5))",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white">Why Choose Us?</h2>
          <p className="mt-4 text-lg text-white pb-4">
            Enjoy exclusive features, advanced tools, and personalized support.
          </p>

          <p>
            Far far away, behind the word mountains, far from the countries
            Vokalia and Consonantia, there live the blind texts. Separated they
            live in Bookmarksgrove right at the coast of the Semantics, a large
            language ocean. A small river named Duden flows by their place and
            supplies it with the necessary regelialia. It is a paradisematic
            country, in which roasted parts of sentences fly into your mouth.
            Even the all-powerful Pointing has no control about the blind texts
            it is an almost unorthographic life One day however a small line of
            blind text by the name of Lorem Ipsum decided to leave for the far
            World of Grammar. The Big Oxmox advised her not to do so, because
            there were thousands of bad Commas, wild Question Marks and devious
            Semikoli, but the Little Blind Text didn’t listen. She packed her
            seven versalia, put her initial into the belt and made herself on
            the way. When she reached the first hills of the Italic Mountains,
            she had a last view back on the skyline of her hometown
            Bookmarksgrove, the headline of Alphabet Village and the subline of
            her own road, the Line Lane. Pityful a rethoric question ran over
            her cheek, then
          </p>
        </div>
      </Section>

      <Section direction="right">
        <h2 className="text-4xl font-bold text-gray-800">
          Seamless Experience
        </h2>
        <p className="mt-4 text-lg text-gray-700">
          Our platform offers intuitive design and smooth performance on all
          devices.
        </p>
        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts of sentences fly into your mouth. Even
          the all-powerful Pointing has no control about the blind texts it is
          an almost unorthographic life One day however a small line of blind
          text by the name of Lorem Ipsum decided to leave for the far World of
          Grammar. The Big Oxmox advised her not to do so, because there were
          thousands of bad Commas, wild Question Marks and devious Semikoli, but
          the Little Blind Text didn’t listen. She packed her seven versalia,
          put her initial into the belt and made herself on the way. When she
          reached the first hills of the Italic Mountains, she had a last view
          back on the skyline of her hometown Bookmarksgrove, the headline of
          Alphabet Village and the subline of her own road, the Line Lane.
          Pityful a rethoric question ran over her cheek, then
        </p>
      </Section>
      <Section
        animationType="fade"
        containerClassName="w-full"
        innerClassName="w-full text-center py-10 text-white"
        style={{
          background:
            "linear-gradient(to right, rgba(84,72,213,1), rgba(84,72,213,0.5))",
        }}
      >
        <h2 className="text-4xl font-bold text-white py-4">
          Ready to Get Started?
        </h2>
        <p>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts of sentences fly into your mouth. Even
          the all-powerful Pointing has no control about the blind texts it is
          an almost unorthographic life One day however a small line of blind
          text by the name of Lorem Ipsum decided to leave for the far World of
          Grammar. The Big Oxmox advised her not to do so, because there were
          thousands of bad Commas, wild Question Marks and devious Semikoli, but
          the Little Blind Text didn’t listen. She packed her seven versalia,
          put her initial into the belt and made herself on the way. When she
          reached the first hills of the Italic Mountains, she had a last view
          back on the skyline of her hometown Bookmarksgrove, the headline of
          Alphabet Village and the subline of her own road, the Line Lane.
          Pityful a rethoric question ran over her cheek, then
        </p>

        <div className="flex justify-center my-12">
          <SignUpDialog />
        </div>
      </Section>

      <Section animationType="slide" direction="left">
        <h2 className="text-4xl font-bold text-violet-900">Our Customers</h2>
        <p className="mt-4 text-lg text-gray-700">
          These are the just some of the companies using Catēna
        </p>

        <CustomerButtons />
      </Section>
    </div>
  );
}
